import React from 'react';
import { CreditCard, Lock, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppSettings } from '../types';

interface PaywallProps {
  settings: AppSettings;
}

export const Paywall: React.FC<PaywallProps & { onCloseSimulated?: () => void }> = ({ settings, onCloseSimulated }) => {
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
          phone: '0123456789'
        }),
      });

      const data = await response.json();
      
      if (data.success && data.paymentUrl) {
        // Redirect to ToyyibPay
        window.location.href = data.paymentUrl;
      } else {
        alert('Gagal menjana bil pembayaran. Sila hubungi sokongan.');
      }
    } catch (err) {
      console.error(err);
      alert('Ralat sistem. Sila cuba sebentar lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Illustration */}
        <div className="bg-slate-900 px-6 py-8 text-center relative overflow-hidden">
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
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mb-4 ring-8 ring-rose-500/10">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Langganan Tamat Tempoh</h2>
            <p className="text-slate-300 text-sm mt-2 max-w-sm">
              Sistem telah dikunci. Anda kini berada dalam <b>Mod Baca Sahaja</b>. Sila perbaharui langganan untuk terus merekod transaksi.
            </p>
          </div>
        </div>

        {/* Pricing & Features */}
        <div className="p-6 space-y-6">
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex items-center justify-between">
            <div>
              <p className="text-emerald-800 font-bold text-lg">Pakej Tahunan</p>
              <p className="text-emerald-600 text-xs">Untuk penggunaan 12 bulan</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-700">RM 120</span>
              <span className="text-emerald-600 text-xs block">/tahun</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Akses Penuh Perusahaan:
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Rekod duit keluar & masuk tanpa had
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Storan awan selamat bersandarkan Google Firebase
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Janaan Penyata Kewangan automatik
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Buku Tunai PDF & CSV Ekstrak
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <button
              onClick={handlePayment}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-slate-200"
            >
              <CreditCard className="w-5 h-5" />
              Bayar Sekarang (ToyyibPay)
            </button>
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              Pembayaran selamat melalui gateway FPX ToyyibPay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
