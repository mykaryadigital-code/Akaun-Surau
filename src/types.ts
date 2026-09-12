/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'IN' | 'OUT';

export type PaymentMethod = 'Pindahan Bank' | 'Tunai' | 'Cek' | 'QR Pay';

export type AppTheme = 'emerald' | 'masjidi' | 'teal' | 'amber' | 'slate' | 'white';

export interface OrganizationInfo {
  name: string;
  regNo: string;
  kariah: string;
  address: string;
  phone?: string;
  bankName: string;
  bankAccount: string;
  logoUrl?: string;
}

export interface AJKInfo {
  pengerusi: string;
  bendahari: string;
  setiausaha: string;
}

export interface OpeningBalances {
  total: number;
  bank: number;
  cash: number;
}

export type FundCategory = 'Tabung Am' | 'Tabung Pembangunan' | 'Dana Khas';

export interface AuditLogEntry {
  timestamp: number;
  date: string;
  action: string;
  originalSuggested: string;
  chosenCategory: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  refNo: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: string;
  fundCategory?: FundCategory;
  source?: string;
  hasSpecificPurpose?: boolean;
  purpose?: string;
  fundName?: string;
  isCategoryOverridden?: boolean;
  overrideAuditLog?: AuditLogEntry[];
  amount: number;
  paymentMethod: PaymentMethod;
  partyName: string; // Pembayar or Penerima
  notes: string;
  attachmentUrl?: string;
  createdAt: number;
}

export interface AppSettings {
  org: OrganizationInfo;
  ajk: AJKInfo;
  openingBalances: OpeningBalances;
  theme: AppTheme;
  categoriesIn: string[];
  categoriesOut: string[];
  firebaseConfig?: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
  googleAppsScriptUrl?: string;
  darkMode?: boolean;
  subscription?: {
    status: 'trial' | 'active' | 'expired';
    validUntil: string;
  };
}
