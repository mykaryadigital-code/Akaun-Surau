/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppSettings, AppTheme, Transaction } from './types';
import {
  loadSettings,
  saveSettings,
  loadTransactions,
  saveTransactions,
  sendToGoogleSheetsWebhook,
} from './services/storage';

import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TransactionModal } from './components/TransactionModal';
import { FinancialStatement } from './components/FinancialStatement';
import { SettingsModal } from './components/SettingsModal';
import { Login } from './components/Login';
import { DEFAULT_SETTINGS, INITIAL_TRANSACTIONS } from './utils/initialData';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('surau_kewangan_auth_v1') === 'true';
  });

  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modal States
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [quickModalType, setQuickModalType] = useState<'IN' | 'OUT' | null>(null);

  // Sync to LocalStorage on change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Handler to add a new transaction
  const handleAddTransaction = (newTx: Transaction) => {
    const updated = [newTx, ...transactions];
    setTransactions(updated);

    // Optional webhook trigger for Google Sheets
    if (settings.googleAppsScriptUrl) {
      sendToGoogleSheetsWebhook(settings.googleAppsScriptUrl, newTx);
    }
  };

  // Handler to update an existing transaction
  const handleUpdateTransaction = (updatedTx: Transaction) => {
    const updated = transactions.map((t) => (t.id === updatedTx.id ? updatedTx : t));
    setTransactions(updated);
  };

  // Handler to delete a transaction
  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
  };

  // Handler for Theme Change
  const handleThemeChange = (newTheme: AppTheme) => {
    setSettings((prev) => ({ ...prev, theme: newTheme }));
  };

  // Handler to Reset Data to Default Master Prompt Preset
  const handleResetData = () => {
    setSettings(DEFAULT_SETTINGS);
    setTransactions(INITIAL_TRANSACTIONS);
    localStorage.removeItem('surau_kewangan_settings_v1');
    localStorage.removeItem('surau_kewangan_transactions_v1');
  };

  // Handler to Clear Data completely
  const handleClearData = () => {
    setSettings((prev) => ({
      ...prev,
      openingBalances: { total: 0, bank: 0, cash: 0 },
    }));
    setTransactions([]);
  };

  // Handler to Import Backup JSON
  const handleImportBackup = (importedData: any) => {
    if (importedData.settings) {
      setSettings(importedData.settings);
    }
    if (Array.isArray(importedData.transactions)) {
      setTransactions(importedData.transactions);
    }
  };

  // Quick Action Trigger for +IN / -OUT
  const handleOpenNewTransaction = (type: 'IN' | 'OUT') => {
    setQuickModalType(type);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('surau_kewangan_auth_v1', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('surau_kewangan_auth_v1');
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} orgName={settings.org.name} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        settings={settings}
        transactions={transactions}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={handleOpenNewTransaction}
        onOpenSettings={() => setSettingsOpen(true)}
        onThemeChange={handleThemeChange}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            settings={settings}
            transactions={transactions}
            onOpenNewTransaction={handleOpenNewTransaction}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'report' && (
          <FinancialStatement settings={settings} transactions={transactions} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {settings.org.name} ({settings.org.regNo}). Hak Cipta Terpelihara.
          </span>
          <span className="text-[11px] text-slate-400">
            Penyegerakan Awan & Real-time Local Storage Engine
          </span>
        </div>
      </footer>

      {/* Settings Modal */}
      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onSaveSettings={setSettings}
          onClose={() => setSettingsOpen(false)}
          onResetData={handleResetData}
          onClearData={handleClearData}
          onImportBackup={handleImportBackup}
          allTransactions={transactions}
        />
      )}

      {/* Global Transaction Modal */}
      <TransactionModal
        settings={settings}
        initialTypeModal={quickModalType}
        onCloseInitialModal={() => setQuickModalType(null)}
        onAddTransaction={handleAddTransaction}
        onUpdateTransaction={handleUpdateTransaction}
      />
    </div>
  );
}
