import React, { useState } from 'react';
import { CreditCard, Lock, ShieldCheck, Sparkles, CheckCircle2, User, Crown, Gem, Star } from 'lucide-react';
import { AppSettings } from '../types';

interface PaywallProps {
  settings: AppSettings;
  uid?: string;
  paymentVerifying?: boolean;
}

export const Paywall: React.FC<PaywallProps & { onCloseSimulated?: () => void }> = ({ settings, uid, paymentVerifying, onCloseSimulated }) => {
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
          billDescription,
          userId: uid // pass userId to backend for webhook mapping
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
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Illustration */}
        <div className="px-5 py-8 text-center relative overflow-hidden shrink-0">
          {onCloseSimulated && (
            <button 
              onClick={onCloseSimulated}
              className="absolute top-4 right-4 z-20 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-1.5 rounded-lg text-xs font-bold transition"
            >
              Tutup
            </button>
          )}
          
          {/* Decorative Light Background Elements */}
          <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[150%] bg-indigo-50/80 blur-3xl rounded-full pointer-events-none"></div>
          <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[150%] bg-emerald-50/80 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center pt-2">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-orange-500 blur-xl opacity-40 rounded-full"></div>
              <div className="w-16 h-16 bg-gradient-to-b from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center relative shadow-lg p-[2px]">
                 <div className="w-full h-full bg-white backdrop-blur-sm rounded-2xl overflow-hidden shadow-inner">
                   <img src="/ikon.png" alt="Sistem Langganan" className="w-full h-full object-cover" />
                 </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {onCloseSimulated ? 'Sistem Langganan' : 'Langganan Tamat Tempoh'}
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto font-medium">
              {onCloseSimulated 
                ? 'Naik Taraf Pengurusan Masjid & Surau Anda' 
                : <span>Sistem telah dikunci. Anda kini berada dalam <b>Mod Baca Sahaja</b>. Sila perbaharui langganan untuk terus merekod transaksi.</span>
              }
            </p>
          </div>
        </div>

        {/* Pricing & Features */}
        <div className="p-6 md:p-8 overflow-y-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">
            
            {/* Pakej Asas (Bulanan) */}
            <div className="bg-[#f8fdfa] rounded-3xl p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(52,211,153,0.15)] border-2 border-emerald-500/20 relative transition hover:scale-[1.02] duration-300">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center rotate-3 shadow-sm">
                    <User className="w-6 h-6 text-emerald-500 -rotate-3" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm tracking-wide">PAKEJ BULANAN</h3>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-black text-slate-900">RM30</span>
                  <span className="text-slate-500 text-sm font-medium">/bulan</span>
                </div>
                <p className="text-xs text-slate-600 mb-6 h-8">Akses Penuh Sistem Akaun Masjid & Surau.</p>
                <ul className="space-y-3 text-[13px] text-slate-600 mb-8 font-medium">
                  <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>Rekod masuk & keluar tanpa had</span></li>
                  <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>Storan awan Firebase</span></li>
                  <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>Jana Penyata Kewangan automatik</span></li>
                  <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>Jana & muat turun Buku Tunai PDF</span></li>
                  <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>Eksport rekod ke CSV</span></li>
                </ul>
              </div>
              <button
                onClick={() => handlePayment('monthly', 3000, 'Pakej Bulanan (1 Bulan)')}
                disabled={paymentVerifying || isCreatingBill}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 disabled:opacity-50 font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-sm border border-emerald-100"
              >
                <CreditCard className="w-4 h-4" /> Langgan Bulanan
              </button>
            </div>

            {/* Pakej Tahunan */}
            <div className="bg-[#f4f8ff] rounded-3xl p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(59,130,246,0.25)] border-2 border-blue-500/40 relative transform md:-translate-y-2 transition hover:scale-[1.02] duration-300">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full z-10 whitespace-nowrap">
                Paling Popular
              </div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm tracking-wide">PAKEJ TAHUNAN</h3>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-black text-slate-900">RM120</span>
                  <span className="text-slate-500 text-sm font-medium">/tahun</span>
                </div>
                <p className="text-xs text-slate-600 mb-6 h-8">Jimat <b>RM240</b> setahun berbanding pakej bulanan!</p>
                <ul className="space-y-3 text-[13px] text-slate-600 mb-8 font-medium">
                  <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /><span>Akses penuh selama 12 bulan</span></li>
                  <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /><span>Rekod masuk & keluar tanpa had</span></li>
                  <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /><span>Storan awan selamat Firebase</span></li>
                  <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /><span>Jana Penyata Kewangan automatik</span></li>
                  <li className="flex items-start gap-2.5"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /><span>Jana Buku Tunai PDF & CSV</span></li>
                </ul>
              </div>
              <button
                onClick={() => handlePayment('yearly', 12000, 'Pakej Tahunan (12 Bulan)')}
                disabled={paymentVerifying || isCreatingBill}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 font-bold py-3.5 px-4 rounded-xl transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 text-sm"
              >
                <CreditCard className="w-4 h-4" /> Langgan Tahunan
              </button>
            </div>

            {/* Pakej PRO */}
            <div className="bg-[#fff9f5] rounded-3xl p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(249,115,22,0.15)] border-2 border-orange-500/20 relative transition hover:scale-[1.02] duration-300">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20">
                    <Gem className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm tracking-wide">PAKEJ PRO + WHITE LABEL</h3>
                  </div>
                </div>
                <div className="mb-4 flex items-end gap-1">
                  <span className="text-3xl font-black text-slate-900">RM799</span>
                  <span className="text-slate-500 text-[10px] font-medium uppercase tracking-wider mb-1.5">Sekali Bayar</span>
                </div>
                <p className="text-xs text-slate-600 mb-6 h-8">Miliki sistem ini & jual semula di bawah jenama sendiri.</p>
                <ul className="space-y-3 text-[13px] text-slate-600 mb-8 font-medium">
                  <li className="flex items-start gap-2.5"><Star className="w-4 h-4 text-orange-400 fill-orange-400 shrink-0 mt-0.5" /><span><b className="text-slate-800">Termasuk semua ciri Pakej Biasa</b></span></li>
                  <li className="flex items-start gap-2.5"><Star className="w-4 h-4 text-orange-400 fill-orange-400 shrink-0 mt-0.5" /><span>Dapat Fail Penuh Web App</span></li>
                  <li className="flex items-start gap-2.5"><Star className="w-4 h-4 text-orange-400 fill-orange-400 shrink-0 mt-0.5" /><span>Tukar nama & branding bebas</span></li>
                  <li className="flex items-start gap-2.5"><Star className="w-4 h-4 text-orange-400 fill-orange-400 shrink-0 mt-0.5" /><span>White Label License Penuh</span></li>
                  <li className="flex items-start gap-2.5"><Star className="w-4 h-4 text-orange-400 fill-orange-400 shrink-0 mt-0.5" /><span>Tutorial Pemasangan A–Z</span></li>
                  <li className="flex items-start gap-2.5"><Star className="w-4 h-4 text-orange-400 fill-orange-400 shrink-0 mt-0.5" /><span>Pasang di domain anda sendiri</span></li>
                </ul>
              </div>
              <button
                onClick={() => handlePayment('pro', 79900, 'Pakej PRO + White Label')}
                disabled={paymentVerifying || isCreatingBill}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white disabled:opacity-50 font-bold py-3.5 px-4 rounded-xl transition shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 text-sm"
              >
                <CreditCard className="w-4 h-4" /> Dapatkan Pakej PRO
              </button>
            </div>

          </div>
          
          <div className="mt-8 text-center flex items-center justify-center gap-2 text-[12px] text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Pembayaran selamat melalui gerbang pembayaran FPX (ToyyibPay)
          </div>
        </div>
      </div>
    </div>
  );
};
