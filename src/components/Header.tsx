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
  Moon,
  Sun,
  BadgeCheck,
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
  onToggleDarkMode?: () => void;
  onLogout?: () => void;
  isSuperAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  transactions,
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  onOpenSettings,
  onThemeChange,
  onToggleDarkMode,
  onLogout,
  isSuperAdmin,
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

  const isWhite = theme.id === 'white';

  return (
    <header className="sticky top-0 z-30 shadow-md transition-colors duration-200">
      {/* Top Bar with Org Info & Balances */}
      <div className={`${theme.headerBg} ${isWhite ? 'text-slate-900' : 'text-white'} px-4 py-3 sm:px-6`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Org Title & Badge */}
          <div className="flex items-center gap-3">
            {settings.org.logoUrl && (
              <img src={settings.org.logoUrl} alt="Logo" className="h-16 sm:h-20 w-auto object-contain bg-white rounded-lg p-1 shrink-0 shadow-sm border border-slate-200" />
            )}
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                  {settings.org.name}
                </h1>
                {settings.subscription?.status === 'active' && (
                  <span 
                    className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm border"
                    style={{
                      backgroundColor: isWhite ? '#f0fdf4' : 'rgba(255, 255, 255, 0.2)',
                      color: isWhite ? '#166534' : '#fff',
                      borderColor: isWhite ? '#bbf7d0' : 'rgba(255, 255, 255, 0.3)',
                    }}
                    title="Akaun PRO Aktif"
                  >
                    <BadgeCheck className="w-3.5 h-3.5" />
                    PRO
                  </span>
                )}
              </div>
              <div className={`text-xs ${theme.headerAccent} flex flex-col gap-1`}>
                <span className={`font-medium ${isWhite ? 'text-slate-600' : 'text-white/90'} sm:text-sm`}>{settings.org.kariah}</span>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md ${isWhite ? 'bg-slate-100 border border-slate-300 text-slate-700' : 'bg-white/20 border border-white/20 text-white'} text-[10px] font-bold tracking-wide`}>
                    {settings.org.regNo}
                  </span>
                  <span className="opacity-50 hidden sm:inline">•</span>
                  <span className={isWhite ? 'text-slate-600' : ''}>{settings.org.bankName} ({settings.org.bankAccount})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Cards Bar */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 text-xs sm:text-sm">
            {/* Total Balance */}
            <div className={`${isWhite ? 'bg-slate-50 border-slate-200' : 'bg-white/10 border-white/15'} backdrop-blur-md px-3 py-1.5 rounded-lg border flex items-center gap-2`}>
              <Wallet className={`w-4 h-4 ${isWhite ? 'text-slate-700' : 'text-emerald-300'}`} />
              <div>
                <span className={`block text-[10px] ${isWhite ? 'text-slate-500' : 'text-white/70'} uppercase tracking-wider font-medium`}>
                  Baki Keseluruhan
                </span>
                <span className={`font-bold text-sm sm:text-base ${isWhite ? 'text-emerald-700' : 'text-amber-300'}`}>
                  RM {currentTotal.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Bank Balance */}
            <div className={`${isWhite ? 'bg-slate-50 border-slate-200' : 'bg-white/10 border-white/15'} backdrop-blur-md px-3 py-1.5 rounded-lg border hidden sm:flex items-center gap-2`}>
              <Landmark className={`w-4 h-4 ${isWhite ? 'text-slate-700' : 'text-sky-300'}`} />
              <div>
                <span className={`block text-[10px] ${isWhite ? 'text-slate-500' : 'text-white/70'} uppercase tracking-wider font-medium`}>
                  Baki Bank
                </span>
                <span className={`font-semibold ${isWhite ? 'text-slate-800' : 'text-white'}`}>
                  RM {currentBank.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Cash Balance */}
            <div className={`${isWhite ? 'bg-slate-50 border-slate-200' : 'bg-white/10 border-white/15'} backdrop-blur-md px-3 py-1.5 rounded-lg border hidden md:flex items-center gap-2`}>
              <CreditCard className={`w-4 h-4 ${isWhite ? 'text-slate-700' : 'text-amber-300'}`} />
              <div>
                <span className={`block text-[10px] ${isWhite ? 'text-slate-500' : 'text-white/70'} uppercase tracking-wider font-medium`}>
                  Peti Tunai
                </span>
                <span className={`font-semibold ${isWhite ? 'text-slate-800' : 'text-white'}`}>
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
                className={`${theme.primaryBtn} font-medium px-4 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 transition`}
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
            {!isSuperAdmin && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-paywall'))}
                className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-2 rounded-lg border border-amber-200 transition flex items-center gap-1.5 text-xs sm:text-sm font-bold shadow-sm"
                title="Langgan Penuh"
              >
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Langgan</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition flex items-center justify-center"
                title="Tukar Mod Gelap/Terang"
              >
                {settings.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 text-xs sm:text-sm font-medium"
              title="Tetapan Sistem"
            >
              <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="hidden sm:inline">Tetapan</span>
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 text-xs sm:text-sm font-medium"
                title="Log Keluar"
              >
                <LogOut className="w-4 h-4 text-slate-600 dark:text-slate-400" />
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
