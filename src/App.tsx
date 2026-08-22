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

import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Ledger } from './components/Ledger';
import { ReceiptView } from './components/ReceiptView';
import { FinancialStatement } from './components/FinancialStatement';
import { TransactionModal } from './components/TransactionModal';
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
    importBackupData,
  } = useFirestoreData(user);

  // Active Main Navigation Tab ('dashboard' | 'penerimaan' | 'perbelanjaan' | 'resit' | 'ledger' | 'report')
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const isExpired =
    forceShowPaywall ||
    (!isSuperAdmin &&
      (settings?.subscription?.status === 'expired' ||
        (settings?.subscription?.validUntil &&
          new Date(settings.subscription.validUntil).getTime() < Date.now())));

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
            body: JSON.stringify({ billCode: billcode }),
          });
          const data = await response.json();

          if (data.success && data.isPaid) {
            const currentExpiry = new Date(settings.subscription?.validUntil || Date.now()).getTime();
            const baseTime = Math.max(currentExpiry, Date.now());

            let daysToAdd = 365;
            let successMsg = 'Pembayaran berjaya! Langganan anda telah diperbaharui selama setahun (365 hari).';

            if (pkg === 'monthly') {
              daysToAdd = 30;
              successMsg = 'Pembayaran berjaya! Langganan bulanan (30 hari) anda telah diaktifkan.';
            } else if (pkg === 'pro') {
              daysToAdd = 36500; // 100 years (Lifetime / White Label)
              successMsg = 'Pembayaran berjaya! Pakej PRO (White Label) anda telah diaktifkan untuk akses seumur hidup.';
            }

            const newValidUntil = new Date(baseTime + daysToAdd * 24 * 60 * 60 * 1000).toISOString();

            await updateSettings({
              ...settings,
              subscription: {
                status: 'active',
                validUntil: newValidUntil,
              },
            });
            alert(successMsg);
          } else {
            alert('Pembayaran belum diterima. Jika duit telah ditolak, sila hubungi Admin Surau.');
          }
        } catch (error) {
          console.error('Verification error:', error);
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

  // Handler to Reset Data
  const handleResetData = async () => {
    if (window.confirm('Adakah anda pasti? Tindakan ini akan memulihkan tetapan kepada lalai.')) {
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-800 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={() => {}} orgName="Sistem Kewangan Berpusat" />;
  }

  if (dataLoading || !settings) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-800 border-t-transparent" />
        <p className="text-slate-500 font-medium animate-pulse text-sm">Menyegerak Data Awan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col selection:bg-emerald-800 selection:text-white">
      <div className="flex flex-1 min-h-screen">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSettings={() => setSettingsOpen(true)}
          settings={settings}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navbar */}
          <Navbar
            settings={settings}
            onOpenSettings={() => setSettingsOpen(true)}
            onLogout={handleLogout}
            onMobileMenuToggle={() => setMobileMenuOpen(true)}
            isSuperAdmin={isSuperAdmin}
          />

          {/* Dynamic Page Views */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard
                settings={settings}
                transactions={transactions}
                onOpenNewTransaction={handleOpenNewTransaction}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'penerimaan' && (
              <Ledger
                transactions={transactions}
                onEditTransaction={(tx) => setEditingTx(tx)}
                onDeleteTransaction={deleteTransaction}
                onOpenNewTransaction={handleOpenNewTransaction}
                forcedType="IN"
              />
            )}

            {activeTab === 'perbelanjaan' && (
              <Ledger
                transactions={transactions}
                onEditTransaction={(tx) => setEditingTx(tx)}
                onDeleteTransaction={deleteTransaction}
                onOpenNewTransaction={handleOpenNewTransaction}
                forcedType="OUT"
              />
            )}

            {activeTab === 'ledger' && (
              <Ledger
                transactions={transactions}
                onEditTransaction={(tx) => setEditingTx(tx)}
                onDeleteTransaction={deleteTransaction}
                onOpenNewTransaction={handleOpenNewTransaction}
                forcedType="ALL"
              />
            )}

            {activeTab === 'resit' && (
              <ReceiptView settings={settings} transactions={transactions} />
            )}

            {activeTab === 'report' && (
              <FinancialStatement settings={settings} transactions={transactions} />
            )}
          </main>

          {/* Minimalist Clean Footer */}
          <footer className="border-t border-slate-200 bg-white py-3.5 px-4 sm:px-6 text-xs text-slate-500">
            <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>
                © {new Date().getFullYear()} {settings.org.name || 'Surau Al-Jannah'}. Hak Cipta Terpelihara.
              </span>
              <div className="flex items-center gap-4">
                {isSuperAdmin && (
                  <button
                    onClick={() => setForceShowPaywall(!forceShowPaywall)}
                    className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded hover:bg-rose-200 transition font-bold"
                  >
                    Simulasi Paywall (Admin)
                  </button>
                )}
                <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-700 inline-block animate-pulse" />
                  Sistem Kewangan Berpusat (Cloud Sync Aktif)
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>

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
          paymentVerifying={paymentVerifying}
          onCloseSimulated={
            forceShowPaywall || manualPaywall
              ? () => {
                  setForceShowPaywall(false);
                  setManualPaywall(false);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
