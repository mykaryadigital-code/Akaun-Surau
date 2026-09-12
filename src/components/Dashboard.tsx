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
  ChevronRight,
  Building2,
  Hammer,
  HeartHandshake,
  Scale,
} from 'lucide-react';
import { AppSettings, Transaction } from '../types';
import { getTheme } from '../utils/theme';
import { DashboardCharts } from './DashboardCharts';
import { calculateAllFundBalances, getTransactionFundCategory } from '../utils/fundCategory';

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

  // 1. Calculate Fund Balances (Tabung Am, Tabung Pembangunan, Dana Khas, Jumlah Keseluruhan)
  const fundSummary = calculateAllFundBalances(transactions, settings.openingBalances.total);

  // 2. Totals Calculation
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
      
      {/* 1. PRIMARY SECTION: Baki Mengikut Kategori Dana */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tabung Am */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden transition-all hover:border-emerald-400">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Tabung Am
              </span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-white block tracking-tight">
                RM {fundSummary.tabungAm.balance.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
              </span>
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                <span className="text-emerald-600 font-semibold" title="Jumlah Terima">
                  +{fundSummary.tabungAm.totalIn.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-rose-500 font-semibold" title="Jumlah Belanja">
                  -{fundSummary.tabungAm.totalOut.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Tabung Pembangunan */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden transition-all hover:border-amber-400">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Tabung Pembangunan
              </span>
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl">
                <Hammer className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-white block tracking-tight">
                RM {fundSummary.tabungPembangunan.balance.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
              </span>
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                <span className="text-emerald-600 font-semibold" title="Jumlah Terima">
                  +{fundSummary.tabungPembangunan.totalIn.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-rose-500 font-semibold" title="Jumlah Belanja">
                  -{fundSummary.tabungPembangunan.totalOut.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Dana Khas */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden transition-all hover:border-purple-400">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                Dana Khas
              </span>
              <div className="p-2 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-xl">
                <HeartHandshake className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-white block tracking-tight">
                RM {fundSummary.danaKhas.balance.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
              </span>
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                <span className="text-emerald-600 font-semibold" title="Jumlah Terima">
                  +{fundSummary.danaKhas.totalIn.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-rose-500 font-semibold" title="Jumlah Belanja">
                  -{fundSummary.danaKhas.totalOut.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Jumlah Keseluruhan */}
          <div className={`bg-gradient-to-br ${theme.gradientBg} text-white p-5 rounded-2xl shadow-sm border border-black/10 relative overflow-hidden`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${theme.id === 'white' ? 'text-slate-700' : 'text-white/90'}`}>
                Jumlah Keseluruhan
              </span>
              <div className="p-2 bg-black/10 rounded-xl">
                <Wallet className={`w-5 h-5 ${theme.id === 'white' ? 'text-slate-700' : 'text-white/90'}`} />
              </div>
            </div>
            <div className="mt-3">
              <span className={`text-2xl font-black tracking-tight block ${theme.id === 'white' ? 'text-slate-900' : 'text-white'}`}>
                RM {fundSummary.totalOverall.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
              </span>
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/20 text-[11px]">
                <span className={theme.id === 'white' ? 'text-slate-500' : 'text-white/80'}>Semua Tabung & Akaun</span>
                <span className={`font-bold ${theme.id === 'white' ? 'text-slate-700' : 'text-white'}`}>Bank + Tunai</span>
              </div>
            </div>
          </div>
        </div>

      {/* 2. SECONDARY METRICS: Bank, Cash, Income, Expense, Weekly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <span className="text-xl font-extrabold text-slate-900 dark:text-white block">
              RM {currentBank.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block font-mono">
              {settings.org.bankAccount}
            </span>
          </div>
        </div>

        {/* Cash-in-hand Balance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Peti Tunai (Cash-in-Hand)
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-extrabold text-slate-900 dark:text-white block">
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
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
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
            <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 block">
              -RM {totalOut.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Bayaran Bil, Program & Servis
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
              onClick={() => onNavigateTab('ledger')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition"
            >
              Lihat Buku Tunai <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Belum ada transaksi direkodkan.
              </div>
            ) : (
              recentTransactions.map((tx) => {
                const fund = getTransactionFundCategory(tx);
                return (
                  <div
                    key={tx.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl ${
                          tx.type === 'IN'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'
                        }`}
                      >
                        {tx.type === 'IN' ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {tx.partyName || tx.source || tx.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              fund === 'Tabung Pembangunan'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : fund === 'Dana Khas'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {fund}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{tx.date}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {tx.source ? `${tx.source} • ` : ''}{tx.category}
                          </span>
                          {tx.purpose && (
                            <>
                              <span>•</span>
                              <span className="italic text-slate-600 dark:text-slate-400">Tujuan: {tx.purpose}</span>
                            </>
                          )}
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
                );
              })
            )}
          </div>
        </div>

        {/* Quick Shortcut Box & Info Card (1 col on lg) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Tindakan Pantas Kewangan
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => onOpenNewTransaction('IN')}
                className="w-full text-left p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition flex items-center justify-between text-emerald-900"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="block font-bold text-xs">
                      Rekod Duit Masuk
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Pilih sumber, sistem tentukan tabung automatik
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                onClick={() => onOpenNewTransaction('OUT')}
                className="w-full text-left p-3 rounded-xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200 transition flex items-center justify-between text-rose-900"
              >
                <div className="flex items-center gap-2.5">
                  <MinusCircle className="w-5 h-5 text-rose-600" />
                  <div>
                    <span className="block font-bold text-xs">
                      Rekod Duit Keluar
                    </span>
                    <span className="text-[11px] text-rose-700">
                      Bayaran bil, penyelenggaraan & program
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-600" />
              </button>

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

              <button
                onClick={() => onNavigateTab('guidelines')}
                className="w-full text-left p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 transition flex items-center justify-between text-emerald-950"
              >
                <div className="flex items-center gap-2.5">
                  <Scale className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <span className="block font-bold text-xs text-emerald-900">
                      Panduan Tabung Jabatan Agama
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Hukum kenduri, pembangunan & kaedah syarak
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
