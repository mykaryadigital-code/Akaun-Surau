/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  BookOpenCheck,
  Settings,
  Menu,
  X,
  CreditCard,
  Wallet,
  Landmark,
  PlusCircle,
  MinusCircle,
  LogOut,
} from 'lucide-react';
import { AppSettings, AppTheme, Transaction } from '../types';
import { getTheme, THEMES } from '../utils/theme';

interface HeaderProps {
  settings: AppSettings;
  transactions: Transaction[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewTransaction: (type: 'IN' | 'OUT') => void;
  onOpenSettings: () => void;
  onThemeChange: (theme: AppTheme) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  transactions,
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  onOpenSettings,
  onThemeChange,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transactionMenuOpen, setTransactionMenuOpen] = useState(false);

  const theme = getTheme(settings.theme);

  // Compute live balances
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

  const navItems = [
    { id: 'dashboard', label: 'Papan Pemuka', icon: LayoutDashboard },
    { id: 'ledger', label: 'Buku Tunai', icon: BookOpenCheck },
    { id: 'report', label: 'Penyata Kewangan', icon: FileSpreadsheet },
  ];

  return (
    <header className="sticky top-0 z-30 shadow-md transition-colors duration-200">
      {/* Top Bar with Org Info & Balances */}
      <div className={`${theme.headerBg} text-white px-4 py-3 sm:px-6`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Org Title & Badge */}
          <div className="flex items-center gap-3">
            {settings.org.logoUrl && (
              <img src={settings.org.logoUrl} alt="Logo" className="h-16 sm:h-20 w-auto object-contain bg-white rounded-lg p-1 shrink-0 shadow-sm" />
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-0.5">
                {settings.org.name}
              </h1>
              <div className={`text-xs ${theme.headerAccent} flex flex-col gap-1`}>
                <span className="font-medium text-white/90 sm:text-sm">{settings.org.kariah}</span>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/20 border border-white/20 text-[10px] font-bold text-white tracking-wide">
                    {settings.org.regNo}
                  </span>
                  <span className="opacity-50 hidden sm:inline">•</span>
                  <span>{settings.org.bankName} ({settings.org.bankAccount})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Cards Bar */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 text-xs sm:text-sm">
            {/* Total Balance */}
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-300" />
              <div>
                <span className="block text-[10px] text-white/70 uppercase tracking-wider font-medium">
                  Baki Keseluruhan
                </span>
                <span className="font-bold text-amber-300 text-sm sm:text-base">
                  RM {currentTotal.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Bank Balance */}
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 hidden sm:flex items-center gap-2">
              <Landmark className="w-4 h-4 text-sky-300" />
              <div>
                <span className="block text-[10px] text-white/70 uppercase tracking-wider font-medium">
                  Baki Bank
                </span>
                <span className="font-semibold text-white">
                  RM {currentBank.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Cash Balance */}
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 hidden md:flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-300" />
              <div>
                <span className="block text-[10px] text-white/70 uppercase tracking-wider font-medium">
                  Peti Tunai
                </span>
                <span className="font-semibold text-white">
                  RM {currentCash.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Nav Menu & Quick Buttons */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 h-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                    isActive
                      ? `${theme.activeTab}`
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="relative">
              <button
                onClick={() => setTransactionMenuOpen(!transactionMenuOpen)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tambah Transaksi</span>
              </button>

              {transactionMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      onOpenNewTransaction('IN');
                      setTransactionMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-50 transition text-emerald-700 font-semibold text-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Duit Masuk (+IN)</span>
                  </button>
                  <div className="h-px bg-slate-100 mx-2"></div>
                  <button
                    onClick={() => {
                      onOpenNewTransaction('OUT');
                      setTransactionMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-50 transition text-rose-600 font-semibold text-sm"
                  >
                    <MinusCircle className="w-4 h-4" />
                    <span>Duit Keluar (-OUT)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Upgrade Button */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-paywall'))}
              className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-2 rounded-lg border border-amber-200 transition flex items-center gap-1.5 text-xs sm:text-sm font-bold shadow-sm"
              title="Langgan Penuh"
            >
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Langgan</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 transition flex items-center gap-1.5 text-xs sm:text-sm font-medium"
              title="Tetapan Sistem"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Tetapan</span>
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 transition flex items-center gap-1.5 text-xs sm:text-sm font-medium"
                title="Log Keluar"
              >
                <LogOut className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition ${
                    isActive
                      ? `${theme.activeTab}`
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
