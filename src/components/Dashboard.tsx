/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Wallet,
  Landmark,
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
  FileSpreadsheet,
  PlusCircle,
  MinusCircle,
  Search,
  ChevronRight,
} from 'lucide-react';
import { AppSettings, Transaction } from '../types';
import { getTheme } from '../utils/theme';
import { DashboardCharts } from './DashboardCharts';

interface DashboardProps {
  settings: AppSettings;
  transactions: Transaction[];
  onOpenNewTransaction: (type: 'IN' | 'OUT') => void;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  settings,
  transactions,
  onOpenNewTransaction,
  onNavigateTab,
}) => {
  const theme = getTheme(settings.theme);

  // Totals Calculation
  const totalIn = transactions
    .filter((t) => t.type === 'IN')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOut = transactions
    .filter((t) => t.type === 'OUT')
    .reduce((sum, t) => sum + t.amount, 0);

  const bankIn = transactions
    .filter((t) => t.type === 'IN' && (t.paymentMethod === 'Pindahan Bank' || t.paymentMethod === 'Cek' || t.paymentMethod === 'QR Pay'))
    .reduce((sum, t) => sum + t.amount, 0);

  const bankOut = transactions
    .filter((t) => t.type === 'OUT' && (t.paymentMethod === 'Pindahan Bank' || t.paymentMethod === 'Cek' || t.paymentMethod === 'QR Pay'))
    .reduce((sum, t) => sum + t.amount, 0);

  const cashIn = transactions
    .filter((t) => t.type === 'IN' && t.paymentMethod === 'Tunai')
    .reduce((sum, t) => sum + t.amount, 0);

  const cashOut = transactions
    .filter((t) => t.type === 'OUT' && t.paymentMethod === 'Tunai')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentTotal = settings.openingBalances.total + totalIn - totalOut;
  const currentBank = settings.openingBalances.bank + bankIn - bankOut;
  const currentCash = settings.openingBalances.cash + cashIn - cashOut;

  // Weekly Stats Calculation
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyIn = transactions
    .filter((t) => t.type === 'IN' && new Date(t.date) >= sevenDaysAgo)
    .reduce((sum, t) => sum + t.amount, 0);
  const weeklyOut = transactions
    .filter((t) => t.type === 'OUT' && new Date(t.date) >= sevenDaysAgo)
    .reduce((sum, t) => sum + t.amount, 0);
  const weeklyNet = weeklyIn - weeklyOut;

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 pb-12">
      {/* Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Overall Balance */}
        <div className={`bg-gradient-to-br ${theme.gradientBg} text-white p-5 rounded-2xl shadow-sm border border-black/10 relative overflow-hidden`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${theme.id === 'white' ? 'text-slate-500' : 'text-white/80'}`}>
              Baki Keseluruhan
            </span>
            <div className="p-2 bg-black/10 rounded-xl">
              <Wallet className={`w-5 h-5 ${theme.id === 'white' ? 'text-slate-700' : 'text-white/90'}`} />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-extrabold tracking-tight block ${theme.id === 'white' ? 'text-slate-900' : 'text-white'}`}>
              RM {currentTotal.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-[11px] mt-1 block ${theme.id === 'white' ? 'text-slate-500' : 'text-white/70'}`}>
              Termasuk Baki Awal + Transaksi
            </span>
          </div>
        </div>

        {/* Bank Balance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Akaun Bank ({settings.org.bankName})
            </span>
            <div className="p-2 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 rounded-xl">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white block">
              RM {currentBank.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Akaun No: {settings.org.bankAccount}
            </span>
          </div>
        </div>

        {/* Cash-in-hand Balance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Peti Tunai / Cash-in-Hand
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white block">
              RM {currentCash.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Di bawah simpanan Bendahari
            </span>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Jumlah Duit Masuk
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">
              +RM {totalIn.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Kutipan & Infak Terkumpul
            </span>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Jumlah Perbelanjaan
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 block">
              -RM {totalOut.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Bayaran Bil, Program & Servis
            </span>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="bg-slate-900 dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-800 dark:border-slate-700 text-white relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Prestasi 7 Hari Terkini
            </span>
            <div className="p-2 bg-white/10 text-white rounded-xl">
              {weeklyNet >= 0 ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold block">
              {weeklyNet >= 0 ? '+' : '-'}RM {Math.abs(weeklyNet).toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span className="text-emerald-400">+RM{weeklyIn.toLocaleString()}</span>
              <span className="text-slate-500">|</span>
              <span className="text-rose-400">-RM{weeklyOut.toLocaleString()}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <DashboardCharts transactions={transactions} />

      {/* Quick Action & Recent Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Transaksi Terkini</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">6 transaksi terbaru duit masuk & keluar</p>
            </div>
            <button
              onClick={() => onNavigateTab('report')}
              className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition"
            >
              Penyata Kewangan
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                      tx.type === 'IN'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {tx.type === 'IN' ? '+IN' : '-OUT'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-slate-900">
                        {tx.partyName || tx.category}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {tx.refNo}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-700">{tx.category}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`block font-extrabold text-sm sm:text-base ${
                      tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {tx.type === 'IN' ? '+' : '-'}RM{' '}
                    {tx.amount.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <span className="text-[10px] text-slate-400">{tx.paymentMethod}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Shortcut Box & Info Card (1 col on lg) */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Tindakan Pantas Kewangan
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => onNavigateTab('report')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 transition flex items-center justify-between"
              >
                <div>
                  <span className="block font-semibold text-xs text-slate-800">
                    Penyata Bulanan & Tahunan
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Penjanaan laporan rasmi lengkap tandatangan AJK
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};