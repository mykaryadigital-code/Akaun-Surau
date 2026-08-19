import React from 'react';
import { CreditCard, Lock, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppSettings } from '../types';

interface PaywallProps {
  settings: AppSettings;
  paymentVerifying?: boolean;
}

export const Paywall: React.FC<PaywallProps & { onCloseSimulated?: () => void }> = ({ settings, paymentVerifying, onCloseSimulated }) => {
  const handlePayment = async () => {
    try {
      // Create bill via our secure backend
      const response = await fetch('/api/create-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 12000, // RM120.00
          name: settings.org.name,
          email: 'admin@surau.com',
          phone: '0123456789',
          returnUrl: window.location.origin
        }),
      });

      const data = await response.json();
      
      if (data.success && data.paymentUrl) {
        // Redirect to ToyyibPay
        window.location.href = data.paymentUrl;
      } else {
        alert(`Gagal menjana bil: ${JSON.stringify(data.details || data.error || data)}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Ralat sistem: ${err.message || 'Sila cuba sebentar lagi.'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Illustration */}
        <div className="bg-slate-900 px-5 py-6 text-center relative overflow-hidden shrink-0">
          {onCloseSimulated && (
            <button 
              onClick={onCloseSimulated}
              className="absolute top-4 right-4 z-20 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-xs font-bold transition"
            >
              Tutup Simulasi
            </button>
          )}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mb-2 ring-4 ring-rose-500/10">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Langganan Tamat Tempoh</h2>
            <p className="text-slate-300 text-xs mt-1 max-w-sm">
              Sistem telah dikunci. Anda kini berada dalam <b>Mod Baca Sahaja</b>. Sila perbaharui langganan untuk terus merekod transaksi.
            </p>
          </div>
        </div>

        {/* Pricing & Features */}
        <div className="p-5 space-y-5 overflow-y-auto">
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center justify-between shrink-0">
            <div>
              <p className="text-emerald-800 font-bold text-base">Pakej Tahunan</p>
              <p className="text-emerald-600 text-[11px]">Untuk penggunaan 12 bulan</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-emerald-700">RM 120</span>
              <span className="text-emerald-600 text-[11px] block">/tahun</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-800 text-[13px] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Akses Penuh Akaun Masjid/Surau:
            </p>
            <ul className="space-y-1.5 text-[13px] text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                Rekod duit keluar & masuk tanpa had
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                Storan awan selamat bersandarkan Google Firebase
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                Janaan Penyata Kewangan automatik
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                Buku Tunai PDF & CSV Ekstrak
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2.5 shrink-0 sticky bottom-0 bg-white pb-1">
            <button
              onClick={handlePayment}
              disabled={paymentVerifying}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-slate-200"
            >
              <CreditCard className="w-4 h-4" />
              {paymentVerifying ? 'Mengesahkan...' : 'Langgan Sekarang (ToyyibPay)'}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldAlert className="w-3 h-3" />
              Pembayaran automatik, selamat melalui gateway FPX
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
