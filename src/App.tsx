/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppTheme, Transaction } from './types';
import { sendToGoogleSheetsWebhook } from './services/storage';
import { useAuth, useFirestoreData } from './services/dbHooks';
import { auth } from './services/firebase';
import { signOut } from 'firebase/auth';

import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Ledger } from './components/Ledger';
import { TransactionModal } from './components/TransactionModal';
import { FinancialStatement } from './components/FinancialStatement';
import { SettingsModal } from './components/SettingsModal';
import { Login } from './components/Login';
import { Paywall } from './components/Paywall';
import { DEFAULT_SETTINGS } from './utils/initialData';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  
  const { 
    settings, 
    transactions, 
    dataLoading, 
    updateSettings, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction, 
    clearAllData, 
    importBackupData 
  } = useFirestoreData(user);

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modal States
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [quickModalType, setQuickModalType] = useState<'IN' | 'OUT' | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [paymentVerifying, setPaymentVerifying] = useState(false);
  // Super Admin Bypass (Founder Account)
  const isSuperAdmin = user?.email === 'mykaryadigital@gmail.com';

  const [forceShowPaywall, setForceShowPaywall] = useState(false);
  const [manualPaywall, setManualPaywall] = useState(false);

  useEffect(() => {
    const handleOpenPaywall = () => setManualPaywall(true);
    window.addEventListener('open-paywall', handleOpenPaywall);
    return () => window.removeEventListener('open-paywall', handleOpenPaywall);
  }, []);

  const isExpired = forceShowPaywall || (!isSuperAdmin && (
    settings?.subscription?.status === 'expired' || 
    (settings?.subscription?.validUntil && new Date(settings.subscription.validUntil).getTime() < Date.now())
  ));

  const showPaywall = isExpired || manualPaywall;

  // Verify Toyyibpay redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const billcode = urlParams.get('billcode');
    const status_id = urlParams.get('status_id');
    const pkg = urlParams.get('pkg') || 'yearly';

    if (billcode && settings && user && !paymentVerifying) {
      const verifyPayment = async () => {
        setPaymentVerifying(true);
        try {
          if (status_id === '3') {
             alert('Pembayaran dibatalkan atau gagal.');
             window.history.replaceState({}, document.title, window.location.pathname);
             setPaymentVerifying(false);
             return;
          }

          const response = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ billCode: billcode })
          });
          let data;
          try {
            const textResponse = await response.text();
            data = JSON.parse(textResponse);
          } catch (parseErr) {
            alert("Ralat Sistem: Backend pelayan tidak dijumpai.\n\nSistem mengesan anda menjalankan aplikasi ini di pelayan statik (seperti Vercel). Sila pastikan backend Node.js (server.ts) di-deploy dengan betul.");
            return;
          }
          
          if (data.success && data.isPaid) {
            const currentExpiry = new Date(settings.subscription?.validUntil || Date.now()).getTime();
            const baseTime = Math.max(currentExpiry, Date.now());
            
            let daysToAdd = 365;
            let successMsg = 'Pembayaran berjaya! Langganan anda telah diperbaharui selama setahun (365 hari).';
            
            if (pkg === 'monthly') {
              daysToAdd = 30;
              successMsg = 'Pembayaran berjaya! Langganan bulanan (30 hari) anda telah diaktifkan. Sila tunggu sebentar sementara sistem mengemas kini akaun anda.';
            } else if (pkg === 'pro') {
              daysToAdd = 36500; // 100 years (Lifetime / White Label)
              successMsg = 'Pembayaran berjaya! Pakej PRO (White Label) anda telah diaktifkan untuk akses seumur hidup. Sila tunggu sebentar sementara sistem mengemas kini akaun anda.';
            }

            alert(successMsg);
          } else {
            alert('Pembayaran belum diterima. Jika duit telah ditolak, sila hubungi Admin Surau.');
          }
        } catch (error) {
          console.error("Verification error:", error);
          alert('Ralat semasa mengesahkan pembayaran. Sila hubungi sokongan.');
        } finally {
          window.history.replaceState({}, document.title, window.location.pathname);
          setPaymentVerifying(false);
        }
      };
      verifyPayment();
    }
  }, [settings, user]);

  // Handler to add a new transaction
  const handleAddTransaction = async (newTx: Transaction) => {
    if (isExpired) {
      alert('Akaun anda telah tamat tempoh. Sila langgan untuk menambah rekod baharu.');
      return;
    }
    await addTransaction(newTx);
    // Optional webhook trigger for Google Sheets
    if (settings?.googleAppsScriptUrl) {
      sendToGoogleSheetsWebhook(settings.googleAppsScriptUrl, newTx);
    }
  };

  // Handler for Theme Change
  const handleThemeChange = (newTheme: AppTheme) => {
    if (settings) {
      updateSettings({ ...settings, theme: newTheme });
    }
  };

  // Handler for Dark Mode Toggle
  const toggleDarkMode = () => {
    if (settings) {
      updateSettings({ ...settings, darkMode: !settings.darkMode });
    }
  };

  React.useEffect(() => {
    if (settings?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings?.darkMode]);

  // Handler to Reset Data to Default Master Prompt Preset
  const handleResetData = async () => {
    if (window.confirm("Adakah anda pasti? Tindakan ini akan memulihkan tetapan kepada lalai.")) {
      await updateSettings(DEFAULT_SETTINGS);
    }
  };

  // Quick Action Trigger for +IN / -OUT
  const handleOpenNewTransaction = (type: 'IN' | 'OUT') => {
    setQuickModalType(type);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={() => {}} orgName="Sistem Kewangan Berpusat" />;
  }

  if (dataLoading || !settings) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
        <p className="text-slate-500 font-medium animate-pulse">Menyegerak Data Awan (Luar Talian Disokong)...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-white transition-colors duration-300">
      {/* Top Header */}
      <Header
        settings={settings}
        transactions={transactions}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={handleOpenNewTransaction}
        onOpenSettings={() => setSettingsOpen(true)}
        onThemeChange={handleThemeChange}
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
        isSuperAdmin={isSuperAdmin}
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
        
        {activeTab === 'ledger' && (
          <Ledger
            transactions={transactions}
            onEditTransaction={(tx) => setEditingTx(tx)}
            onDeleteTransaction={deleteTransaction}
          />
        )}

        {activeTab === 'report' && (
          <FinancialStatement settings={settings} transactions={transactions} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {settings.org.name} ({settings.org.regNo}). Hak Cipta Terpelihara.
          </span>
          <div className="flex items-center gap-4">
            {isSuperAdmin && (
              <button 
                onClick={() => setForceShowPaywall(!forceShowPaywall)}
                className="text-[10px] bg-rose-100 text-rose-700 px-2 py-1 rounded hover:bg-rose-200 transition"
              >
                Simulasi Paywall (Admin)
              </button>
            )}
            <span className="text-[11px] text-emerald-600 font-medium">
              ☁️ Diselaraskan secara Masa Nyata (Cloud SaaS)
            </span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onSaveSettings={updateSettings}
          onClose={() => setSettingsOpen(false)}
          onResetData={handleResetData}
          onClearData={clearAllData}
          onImportBackup={importBackupData}
          allTransactions={transactions}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {/* Global Transaction Modal */}
      <TransactionModal
        settings={settings}
        initialTypeModal={quickModalType}
        editingTransaction={editingTx}
        onCloseInitialModal={() => {
          setQuickModalType(null);
          setEditingTx(null);
        }}
        onAddTransaction={handleAddTransaction}
        onUpdateTransaction={updateTransaction}
      />

      {/* Paywall Overlay */}
      {showPaywall && (
        <Paywall 
          settings={settings} 
          uid={user?.uid}
          userEmail={user?.email || undefined}
          paymentVerifying={paymentVerifying} 
          onCloseSimulated={forceShowPaywall || manualPaywall ? () => {
            setForceShowPaywall(false);
            setManualPaywall(false);
          } : undefined} 
        />
      )}
    </div>
  );
}
