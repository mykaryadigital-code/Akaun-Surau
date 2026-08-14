/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings, Transaction, TransactionType } from '../types';
import { DEFAULT_SETTINGS, INITIAL_TRANSACTIONS } from '../utils/initialData';

const SETTINGS_KEY = 'surau_kewangan_settings_v1';
const TRANSACTIONS_KEY = 'surau_kewangan_transactions_v1';

export function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(data);
    const merged = { ...DEFAULT_SETTINGS, ...parsed };
    
    // Override name and pengerusi based on new requirements
    merged.org.name = 'Surau Al-Jannah';
    merged.ajk.pengerusi = 'En.Karim Bin Syamsuddin';
    merged.ajk.bendahari = 'Haji Bakil Bin Luki';

    // Pastikan kategori baru dimasukkan sekiranya belum ada untuk pengguna sedia ada
    if (merged.categoriesIn && !merged.categoriesIn.includes('Duit Tabung Surau/Masjid')) {
      merged.categoriesIn = ['Duit Tabung Surau/Masjid', ...merged.categoriesIn];
    }
    
    // Perbetulkan ejaan Saguhati dan Bil Elektrik sekiranya pengguna menggunakan data lama
    if (merged.categoriesOut) {
      merged.categoriesOut = merged.categoriesOut.map((cat: string) => {
        if (cat === 'Saghati Penceramah & Imam') return 'Saguhati Penceramah/Imam';
        if (cat === 'Bil Elektrik & Air (TNB / SYABAS)') return 'Bil Elektrik & Air';
        return cat;
      });
    }
    
    
    return merged;
  } catch (err) {
    console.error('Error loading settings from localStorage', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings to localStorage', err);
  }
}

export function loadTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    if (!data) return INITIAL_TRANSACTIONS;
    const parsed = JSON.parse(data);
    let txs = Array.isArray(parsed) ? parsed : INITIAL_TRANSACTIONS;
    
    // Perbetulkan ejaan Saguhati dan Bil Elektrik dalam data transaksi sedia ada
    txs = txs.map(tx => {
      if (tx.category === 'Saghati Penceramah & Imam') {
        return { ...tx, category: 'Saguhati Penceramah/Imam' };
      }
      if (tx.category === 'Bil Elektrik & Air (TNB / SYABAS)') {
        return { ...tx, category: 'Bil Elektrik & Air' };
      }
      return tx;
    });
    
    return txs;
  } catch (err) {
    console.error('Error loading transactions from localStorage', err);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransactions(txs: Transaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
  } catch (err) {
    console.error('Error saving transactions to localStorage', err);
  }
}

/**
 * Auto-generate next reference sequence number:
 * Duit Masuk (IN): [SAJ-YYYYMM-0001]
 * Duit Keluar (OUT): [INV-YYYYMM-0001]
 */
export function generateNextRefNo(
  type: TransactionType,
  txs: Transaction[],
  dateStr?: string
): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const ymPrefix = `${year}${month}`;

  const prefix = type === 'IN' ? 'SAJ' : 'INV';
  const targetPattern = `${prefix}-${ymPrefix}-`;

  // Filter existing matching reference numbers
  const matching = txs.filter((t) => t.refNo && t.refNo.startsWith(targetPattern));

  let maxNum = 0;
  matching.forEach((t) => {
    const parts = t.refNo.split('-');
    if (parts.length >= 3) {
      const numPart = parseInt(parts[2], 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  });

  const nextNum = String(maxNum + 1).padStart(4, '0');
  return `${prefix}-${ymPrefix}-${nextNum}`;
}

/**
 * Backup all app data to a JSON file
 */
export function exportBackupJSON(settings: AppSettings, txs: Transaction[]): void {
  const backup = {
    appName: 'Sistem Kewangan Surau & Masjid',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    settings,
    transactions: txs,
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Backup-Kewangan-Surau-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export transactions to CSV format
 */
export function exportToCSV(txs: Transaction[], orgName: string): void {
  const headers = [
    'No Rujukan',
    'Tarikh',
    'Jenis',
    'Kategori',
    'Jumlah (RM)',
    'Kaedah Bayaran',
    'Pembayar / Penerima',
    'Catatan',
  ];

  const rows = txs.map((t) => [
    `"${t.refNo}"`,
    `"${t.date}"`,
    `"${t.type === 'IN' ? 'Duit Masuk' : 'Duit Keluar'}"`,
    `"${t.category}"`,
    `"${t.amount.toFixed(2)}"`,
    `"${t.paymentMethod}"`,
    `"${(t.partyName || '').replace(/"/g, '""')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    `Laporan-Kewangan-${orgName.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Send transaction to Google Apps Script Webhook (for Google Sheets sync)
 */
export async function sendToGoogleSheetsWebhook(
  webhookUrl: string,
  tx: Transaction
): Promise<boolean> {
  if (!webhookUrl) return false;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    return true;
  } catch (err) {
    console.error('Failed sending to Google Sheets Webhook', err);
    return false;
  }
}
