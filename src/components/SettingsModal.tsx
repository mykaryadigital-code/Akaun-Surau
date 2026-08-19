/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Settings,
  Building2,
  Users,
  Wallet,
  Palette,
  Cloud,
  FileJson,
  RotateCcw,
  Save,
  CheckCircle,
  FileSpreadsheet,
  Database,
} from 'lucide-react';
import { AppSettings, AppTheme } from '../types';
import { THEMES } from '../utils/theme';
import { exportBackupJSON } from '../services/storage';

interface SettingsModalProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onClose: () => void;
  onResetData: () => void;
  onClearData: () => void;
  onImportBackup: (importedData: any) => void;
  allTransactions: any[];
  isSuperAdmin?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
  onResetData,
  onClearData,
  onImportBackup,
  allTransactions,
  isSuperAdmin = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'org' | 'ajk' | 'balances' | 'theme' | 'sync'>('org');

  // Form states
  const [org, setOrg] = useState({ ...settings.org });
  const [ajk, setAjk] = useState({ ...settings.ajk });
  const [openingBalances, setOpeningBalances] = useState({ ...settings.openingBalances });
  const [theme, setTheme] = useState<AppTheme>(settings.theme);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: AppSettings = {
      ...settings,
      org,
      ajk,
      openingBalances,
      theme,
    };
    onSaveSettings(updatedSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.settings && parsed.transactions) {
            onImportBackup(parsed);
            alert('Berjaya mengimport data daripada fail sandaran (JSON backup)!');
            onClose();
          } else {
            alert('Format fail backup tidak sah.');
          }
        } catch (err) {
          alert('Gagal membaca fail backup JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-300" />
            <h3 className="font-extrabold text-base">Tetapan & Konfigurasi Sistem</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('org')}
            className={`px-4 py-3 border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'org'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Maklumat Surau
          </button>
          <button
            onClick={() => setActiveSubTab('ajk')}
            className={`px-4 py-3 border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'ajk'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            AJK & Pengesah
          </button>
          <button
            onClick={() => setActiveSubTab('balances')}
            className={`px-4 py-3 border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'balances'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4" />
            Baki Awal
          </button>
          <button
            onClick={() => setActiveSubTab('theme')}
            className={`px-4 py-3 border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'theme'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            Tema Warna
          </button>
          <button
            onClick={() => setActiveSubTab('sync')}
            className={`px-4 py-3 border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'sync'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-4 h-4" />
            Penyegerakan & Backup
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* SubTab 1: Org Info */}
          {activeSubTab === 'org' && (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Surau / Masjid
                </label>
                <input
                  type="text"
                  value={org.name}
                  onChange={(e) => setOrg({ ...org, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Logo Surau (Pilihan)</label>
                <div className="flex items-center gap-3">
                  {org.logoUrl && (
                    <div className="relative w-12 h-12 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                      <img src={org.logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-1" />
                      <button 
                        type="button"
                        onClick={() => setOrg({ ...org, logoUrl: '' })}
                        className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5"
                        title="Buang Logo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setOrg({ ...org, logoUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. Pendaftaran (JAIS / Agama)
                  </label>
                  <input
                    type="text"
                    value={org.regNo}
                    onChange={(e) => setOrg({ ...org, regNo: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lokasi / Kariah
                  </label>
                  <input
                    type="text"
                    value={org.kariah}
                    onChange={(e) => setOrg({ ...org, kariah: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Penuh Surau
                </label>
                <textarea
                  rows={2}
                  value={org.address}
                  onChange={(e) => setOrg({ ...org, address: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Bank Utama
                  </label>
                  <input
                    type="text"
                    value={org.bankName}
                    onChange={(e) => setOrg({ ...org, bankName: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nombor Akaun Bank
                  </label>
                  <input
                    type="text"
                    value={org.bankAccount}
                    onChange={(e) => setOrg({ ...org, bankAccount: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SubTab 2: AJK */}
          {activeSubTab === 'ajk' && (
            <div className="space-y-3">
              <p className="text-slate-500 text-[11px]">
                Nama pegawai AJK ini akan tertera pada bahagian Tandatangan Penyata Kewangan Bulanan
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Pengerusi Surau
                </label>
                <input
                  type="text"
                  value={ajk.pengerusi}
                  onChange={(e) => setAjk({ ...ajk, pengerusi: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Bendahari Surau *
                </label>
                <input
                  type="text"
                  value={ajk.bendahari}
                  onChange={(e) => setAjk({ ...ajk, bendahari: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Setiausaha Surau
                </label>
                <input
                  type="text"
                  value={ajk.setiausaha}
                  onChange={(e) => setAjk({ ...ajk, setiausaha: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                />
              </div>
            </div>
          )}

          {/* SubTab 3: Opening Balances */}
          {activeSubTab === 'balances' && (
            <div className="space-y-3">
              <p className="text-slate-500 text-[11px]">
                Tetapkan baki kewangan awal yang dibawa daripada akaun terdahulu
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Baki Awal Keseluruhan (RM)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={openingBalances.total}
                  onChange={(e) =>
                    setOpeningBalances({ ...openingBalances, total: parseFloat(e.target.value) || 0 })
                  }
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-sm text-emerald-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Baki Awal Akaun Bank (RM)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={openingBalances.bank}
                    onChange={(e) =>
                      setOpeningBalances({ ...openingBalances, bank: parseFloat(e.target.value) || 0 })
                    }
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Baki Awal Peti Tunai / Cash-in-Hand (RM)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={openingBalances.cash}
                    onChange={(e) =>
                      setOpeningBalances({ ...openingBalances, cash: parseFloat(e.target.value) || 0 })
                    }
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SubTab 4: Theme Color */}
          {activeSubTab === 'theme' && (
            <div className="space-y-3">
              <p className="text-slate-500 text-[11px]">
                Pilih tema warna dinamik untuk header, kad baki, dan butang utama
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(THEMES).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id as AppTheme)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                      theme === t.id
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{t.name}</span>
                      <span className="text-[10px] text-slate-500">Skim warna utama</span>
                    </div>
                    {theme === t.id && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 5: Sync, Backup & Reset */}
          {activeSubTab === 'sync' && (
            <div className="space-y-4">
              {/* Built-in Cloud Sync Note */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <h4 className="font-bold text-emerald-800 text-sm mb-1 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Awan Berpusat (Firebase Enterprise) Aktif
                </h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Sistem ini telah dilengkapi dengan storan pangkalan data awan gred perusahaan terbina dalam yang menyegerakkan semua transaksi, baki, dan resit masa nyata ke peranti yang selamat. Anda tidak perlu memautkan pangkalan data pihak ketiga.
                </p>
              </div>

              {/* JSON Backup & Restore */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-slate-800 block">Muat Turun Backup (JSON)</span>
                  <p className="text-[11px] text-slate-500">
                    Simpan salinan keselamatan fail kewangan lengkap surau
                  </p>
                  <button
                    type="button"
                    onClick={() => exportBackupJSON(settings, allTransactions)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <FileJson className="w-4 h-4" />
                    Muat Turun Fail .JSON
                  </button>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-slate-800 block">Muat Naik / Pulih Data</span>
                  <p className="text-[11px] text-slate-500">
                    Pulihkan data daripada fail sandaran .JSON
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="w-full text-xs text-slate-500 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* Reset Data */}
              {isSuperAdmin && (
                <>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-orange-600 block">Kosongkan Data (Clear Data)</span>
                      <span className="text-[10px] text-slate-500">
                        Memadam semua transaksi dan menetapkan baki awal ke 0.
                      </span>
                    </div>
                    {!clearConfirm ? (
                      <button
                        type="button"
                        onClick={() => setClearConfirm(true)}
                        className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold rounded-xl flex items-center gap-1 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Kosongkan
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setClearConfirm(false)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClearData();
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                        >
                          Pasti Padam
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-rose-700 block">Reset / Muat Semula Data Contoh</span>
                      <span className="text-[10px] text-slate-500">
                        Mengembalikan data ke keadaan asal sampel master prompt
                      </span>
                    </div>
                    {!resetConfirm ? (
                      <button
                        type="button"
                        onClick={() => setResetConfirm(true)}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl flex items-center gap-1 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Semula
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setResetConfirm(false)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onResetData();
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                        >
                          Pasti Reset
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Save Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {savedSuccess ? (
              <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Tetapan berjaya disimpan!
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">Sistem dikemaskini secara automatik</span>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Simpan Tetapan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
