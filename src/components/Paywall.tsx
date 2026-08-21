import React, { useState } from 'react';
import { CreditCard, Lock, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppSettings } from '../types';

interface PaywallProps {
  settings: AppSettings;
  paymentVerifying?: boolean;
}

export const Paywall: React.FC<PaywallProps & { onCloseSimulated?: () => void }> = ({ settings, paymentVerifying, onCloseSimulated }) => {
  const [isCreatingBill, setIsCreatingBill] = useState(false);

  const handlePayment = async (packageId: string, amount: number, billDescription: string) => {
    try {
      setIsCreatingBill(true);
      // Create bill via our secure backend
      const response = await fetch('/api/create-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          name: settings.org.name,
          email: 'admin@surau.com',
          phone: '0123456789',
          returnUrl: window.location.origin,
          packageId,
          billDescription
        }),
      });

      const data = await response.json();
      
      if (data.success && data.paymentUrl) {
        // Redirect to ToyyibPay
        window.location.href = data.paymentUrl;
      } else {
        alert(`Gagal menjana bil: ${JSON.stringify(data.details || data.error || data)}`);
        setIsCreatingBill(false);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Ralat sistem: ${err.message || 'Sila cuba sebentar lagi.'}`);
      setIsCreatingBill(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Illustration */}
        <div className="bg-slate-900 px-5 py-8 text-center relative overflow-hidden shrink-0">
          {onCloseSimulated && (
            <button 
              onClick={onCloseSimulated}
              className="absolute top-4 right-4 z-20 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-xs font-bold transition"
            >
              Tutup
            </button>
          )}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mb-3 ring-4 ring-rose-500/10">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {onCloseSimulated ? 'Sistem Langganan' : 'Langganan Tamat Tempoh'}
            </h2>
            <p className="text-slate-300 text-sm mt-2 max-w-lg">
              {onCloseSimulated 
                ? 'Naik Taraf Pengurusan Masjid & Surau Anda' 
                : <span>Sistem telah dikunci. Anda kini berada dalam <b>Mod Baca Sahaja</b>. Sila perbaharui langganan untuk terus merekod transaksi.</span>
              }
            </p>
          </div>
        </div>

        {/* Pricing & Features */}
        <div className="p-5 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            
            {/* Pakej Bulanan */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition relative">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <h3 className="font-bold text-slate-800 text-sm tracking-wide">PAKEJ BULANAN</h3>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-black text-slate-900">RM30</span>
                  <span className="text-slate-500 text-sm font-medium">/bulan</span>
                </div>
                <p className="text-xs text-slate-600 mb-4 h-8">Akses Penuh Sistem Akaun Masjid & Surau.</p>
                <ul className="space-y-2.5 text-[13px] text-slate-600 mb-6">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>Rekod masuk & keluar tanpa had</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>Storan awan Firebase</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>Jana Penyata Kewangan automatik</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>Jana & muat turun Buku Tunai PDF</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>Eksport rekod ke CSV</span></li>
                </ul>
              </div>
              <button
                onClick={() => handlePayment('monthly', 3000, 'Pakej Bulanan (1 Bulan)')}
                disabled={paymentVerifying || isCreatingBill}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-50 font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm"
              >
                <CreditCard className="w-4 h-4" /> Langgan Bulanan
              </button>
            </div>

            {/* Pakej Tahunan */}
            <div className="bg-slate-900 rounded-2xl border-2 border-emerald-500 p-5 flex flex-col justify-between shadow-xl relative transform md:-translate-y-2">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full">
                Paling Popular
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-sky-400"></div>
                  <h3 className="font-bold text-white text-sm tracking-wide">PAKEJ TAHUNAN</h3>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-black text-white">RM120</span>
                  <span className="text-slate-400 text-sm font-medium">/tahun</span>
                </div>
                <p className="text-xs text-slate-300 mb-4 h-8">Jimat <b>RM240</b> setahun berbanding pakej bulanan!</p>
                <ul className="space-y-2.5 text-[13px] text-slate-300 mb-6">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /><span>Akses penuh selama 12 bulan</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /><span>Rekod masuk & keluar tanpa had</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /><span>Storan awan selamat Firebase</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /><span>Jana Penyata Kewangan automatik</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /><span>Jana Buku Tunai PDF & CSV</span></li>
                </ul>
              </div>
              <button
                onClick={() => handlePayment('yearly', 12000, 'Pakej Tahunan (12 Bulan)')}
                disabled={paymentVerifying || isCreatingBill}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm"
              >
                <CreditCard className="w-4 h-4" /> Langgan Tahunan
              </button>
            </div>

            {/* Pakej PRO */}
            <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-2xl border border-indigo-500/30 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition relative">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-fuchsia-400"></div>
                  <h3 className="font-bold text-white text-sm tracking-wide">PAKEJ PRO + WHITE LABEL</h3>
                </div>
                <div className="mb-4 flex items-end gap-1">
                  <span className="text-3xl font-black text-white">RM799</span>
                  <span className="text-indigo-300 text-[10px] font-medium uppercase tracking-wider mb-1">Sekali Bayar</span>
                </div>
                <p className="text-xs text-indigo-200 mb-4 h-8">Miliki sistem ini & jual semula di bawah jenama sendiri.</p>
                <ul className="space-y-2 text-[12px] text-indigo-100 mb-6">
                  <li className="flex items-start gap-2"><Sparkles className="w-3.5 h-3.5 text-fuchsia-400 shrink-0 mt-0.5" /><span><b>Termasuk semua ciri Pakej Biasa</b></span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-3.5 h-3.5 text-fuchsia-400 shrink-0 mt-0.5" /><span>Dapat Fail Penuh Web App</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-3.5 h-3.5 text-fuchsia-400 shrink-0 mt-0.5" /><span>Tukar nama & branding bebas</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-3.5 h-3.5 text-fuchsia-400 shrink-0 mt-0.5" /><span>White Label License Penuh</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-3.5 h-3.5 text-fuchsia-400 shrink-0 mt-0.5" /><span>Tutorial Pemasangan A–Z</span></li>
                  <li className="flex items-start gap-2"><Sparkles className="w-3.5 h-3.5 text-fuchsia-400 shrink-0 mt-0.5" /><span>Pasang di domain anda sendiri</span></li>
                </ul>
              </div>
              <button
                onClick={() => handlePayment('pro', 79900, 'Pakej PRO + White Label')}
                disabled={paymentVerifying || isCreatingBill}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 text-sm"
              >
                <CreditCard className="w-4 h-4" /> Dapatkan Pakej PRO
              </button>
            </div>

          </div>
          
          <div className="mt-5 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldAlert className="w-3 h-3" />
            Pembayaran selamat melalui gerbang pembayaran FPX (ToyyibPay)
          </div>
        </div>
      </div>
    </div>
  );
};
