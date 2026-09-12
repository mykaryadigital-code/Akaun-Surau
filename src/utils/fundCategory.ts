import { FundCategory, Transaction } from '../types';

export const INCOME_SOURCES = [
  'Duit Tabung Surau',
  'Kutipan Jumaat',
  'Sumbangan Individu',
  'Sumbangan Orang Ramai',
  'Sumbangan YB / Kerajaan',
  'Sumbangan Syarikat / NGO',
  'Sumbangan Pembangunan',
  'Kutipan Pembangunan',
  'Kutipan Khas',
  'Lain-lain',
] as const;

export type IncomeSource = (typeof INCOME_SOURCES)[number];

export const PURPOSE_EXAMPLES = [
  'Baik pulih bumbung',
  'Pembinaan tandas',
  'Membeli penghawa dingin',
  'Program Ramadan',
  'Bantuan Asnaf & Anak Yatim',
  'Lain-lain',
] as const;

// Development keywords for auto-detection
const PEMBANGUNAN_KEYWORDS = [
  'pembangunan',
  'bumbung',
  'tandas',
  'penghawa dingin',
  'aircond',
  'air-cond',
  'karpet',
  'baik pulih',
  'pembaikan',
  'pembinaan',
  'renovasi',
  'ubah suai',
  'kubah',
  'menara',
  'pagar',
  'cat',
  'paip',
  'lampu',
  'wayar',
  'struktur',
  'sound system',
  'audio',
  'mikrofon',
  'tangga',
  'pagar',
];

// Special Fund / Welfare keywords
const DANA_KHAS_KEYWORDS = [
  'ramadan',
  'iftar',
  'anak yatim',
  'yatim',
  'asnaf',
  'fakir',
  'miskin',
  'kebajikan',
  'bantuan',
  'banjir',
  'palestin',
  'korban',
  'khas',
  'ihya',
  'moreh',
  'kematian',
  'khairat',
  'jenazah',
  'aidilfitri',
  'aidiladha',
];

/**
 * Automatically determine Fund Category based on source, purpose, and specific purpose flag
 */
export function determineFundCategory(
  source: string,
  hasSpecificPurpose: boolean = false,
  purpose: string = ''
): {
  category: FundCategory;
  suggestedBy: 'default' | 'pembangunan-keyword' | 'danakhas-keyword' | 'specific-purpose';
} {
  // 1. Fixed source mappings
  if (source === 'Sumbangan Pembangunan' || source === 'Kutipan Pembangunan') {
    return { category: 'Tabung Pembangunan', suggestedBy: 'default' };
  }

  if (source === 'Kutipan Khas') {
    return { category: 'Dana Khas', suggestedBy: 'default' };
  }

  // 2. Specific purpose check
  if (hasSpecificPurpose && purpose.trim()) {
    const lowerPurpose = purpose.toLowerCase();

    // Check if purpose relates to development
    const isPembangunan = PEMBANGUNAN_KEYWORDS.some((kw) => lowerPurpose.includes(kw));
    if (isPembangunan) {
      return { category: 'Tabung Pembangunan', suggestedBy: 'pembangunan-keyword' };
    }

    // Check if purpose relates to special fund / welfare
    const isDanaKhas = DANA_KHAS_KEYWORDS.some((kw) => lowerPurpose.includes(kw));
    if (isDanaKhas) {
      return { category: 'Dana Khas', suggestedBy: 'danakhas-keyword' };
    }

    // If specific purpose is non-empty and custom
    return { category: 'Dana Khas', suggestedBy: 'specific-purpose' };
  }

  // 3. General sources or "Tidak" for specific purpose
  // Duit Tabung Surau, Kutipan Jumaat, Sumbangan Individu, Sumbangan Orang Ramai,
  // Sumbangan YB / Kerajaan, Sumbangan Syarikat / NGO, Lain-lain
  return { category: 'Tabung Am', suggestedBy: 'default' };
}

/**
 * Resolve the Fund Category of an existing or new transaction (handles legacy data gracefully)
 */
export function getTransactionFundCategory(tx: Transaction): FundCategory {
  if (tx.fundCategory) {
    return tx.fundCategory;
  }

  if (tx.category === 'Tabung Am' || tx.category === 'Tabung Pembangunan' || tx.category === 'Dana Khas') {
    return tx.category;
  }

  if (tx.type === 'IN') {
    if (tx.source) {
      return determineFundCategory(tx.source, tx.hasSpecificPurpose, tx.purpose).category;
    }
    const cat = tx.category.toLowerCase();
    if (cat.includes('pembangunan') || cat.includes('wakaf')) {
      return 'Tabung Pembangunan';
    }
    if (cat.includes('anak yatim') || cat.includes('asnaf') || cat.includes('khas') || cat.includes('korban') || cat.includes('ramadan')) {
      return 'Dana Khas';
    }
    return 'Tabung Am';
  } else {
    // Type === 'OUT'
    const cat = tx.category.toLowerCase();
    if (cat.includes('penyelenggaraan') || cat.includes('pembaikan') || cat.includes('pembangunan')) {
      return 'Tabung Pembangunan';
    }
    if (cat.includes('kebajikan') || cat.includes('asnaf') || cat.includes('khas') || cat.includes('anak yatim')) {
      return 'Dana Khas';
    }
    return 'Tabung Am';
  }
}

export interface FundSummary {
  balance: number;
  totalIn: number;
  totalOut: number;
}

export interface AllFundsSummary {
  tabungAm: FundSummary;
  tabungPembangunan: FundSummary;
  danaKhas: FundSummary;
  totalOverall: number;
}

/**
 * Calculate balances for Tabung Am, Tabung Pembangunan, Dana Khas, and Overall Total
 */
export function calculateAllFundBalances(
  transactions: Transaction[],
  openingTotal: number = 0
): AllFundsSummary {
  let amIn = 0;
  let amOut = 0;
  let pembIn = 0;
  let pembOut = 0;
  let khasIn = 0;
  let khasOut = 0;

  for (const tx of transactions) {
    const fund = getTransactionFundCategory(tx);
    if (tx.type === 'IN') {
      if (fund === 'Tabung Pembangunan') pembIn += tx.amount;
      else if (fund === 'Dana Khas') khasIn += tx.amount;
      else amIn += tx.amount;
    } else {
      if (fund === 'Tabung Pembangunan') pembOut += tx.amount;
      else if (fund === 'Dana Khas') khasOut += tx.amount;
      else amOut += tx.amount;
    }
  }

  // Opening total default is placed into Tabung Am (core fund of the mosque)
  const amBalance = openingTotal + amIn - amOut;
  const pembBalance = pembIn - pembOut;
  const khasBalance = khasIn - khasOut;
  const totalOverall = amBalance + pembBalance + khasBalance;

  return {
    tabungAm: {
      balance: amBalance,
      totalIn: amIn,
      totalOut: amOut,
    },
    tabungPembangunan: {
      balance: pembBalance,
      totalIn: pembIn,
      totalOut: pembOut,
    },
    danaKhas: {
      balance: khasBalance,
      totalIn: khasIn,
      totalOut: khasOut,
    },
    totalOverall,
  };
}
