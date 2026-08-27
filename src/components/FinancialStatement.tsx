/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Printer, Calendar, FileSpreadsheet, Building2, CheckCircle2 } from 'lucide-react';
import { AppSettings, Transaction } from '../types';

interface FinancialStatementProps {
  settings: AppSettings;
  transactions: Transaction[];
}

export const FinancialStatement: React.FC<FinancialStatementProps> = ({
  settings,
  transactions,
}) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  const monthNames = [
    'Januari',
    'Februari',
    'Mac',
    'April',
    'Mei',
    'Jun',
    'Julai',
    'Ogos',
    'September',
    'Oktober',
    'November',
    'Disember',
  ];

  // Selected Month formatted string: e.g. "2026-08"
  const ymString = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  // Prior transactions before this selected month
  const priorTransactions = useMemo(() => {
    return transactions.filter((t) => t.date < `${ymString}-01`);
  }, [transactions, ymString]);

  // Computing opening balance brought forward for selected month
  const openingBroughtForward = useMemo(() => {
    const priorIn = priorTransactions
      .filter((t) => t.type === 'IN')
      .reduce((sum, t) => sum + t.amount, 0);
    const priorOut = priorTransactions
      .filter((t) => t.type === 'OUT')
      .reduce((sum, t) => sum + t.amount, 0);

    return settings.openingBalances.total + priorIn - priorOut;
  }, [priorTransactions, settings.openingBalances.total]);

  // Current month transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(ymString));
  }, [transactions, ymString]);

  // Month IN & OUT
  const monthIn = useMemo(() => monthTransactions.filter((t) => t.type === 'IN'), [monthTransactions]);
  const monthOut = useMemo(() => monthTransactions.filter((t) => t.type === 'OUT'), [monthTransactions]);

  const totalMonthIn = useMemo(() => monthIn.reduce((sum, t) => sum + t.amount, 0), [monthIn]);
  const totalMonthOut = useMemo(() => monthOut.reduce((sum, t) => sum + t.amount, 0), [monthOut]);

  const endingBalance = openingBroughtForward + totalMonthIn - totalMonthOut;

  // Group by Categories
  const inCategoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    monthIn.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  }, [monthIn]);

  const outCategoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    monthOut.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  }, [monthOut]);

  const handlePrint = () => {
    if (settings.subscription?.status === 'trial') {
      alert("⚠️ PERHATIAN: Fungsi cetakan dan simpan sebagai PDF tidak dibenarkan untuk versi Percubaan (Trial 7 Hari).\n\nSila naik taraf langganan anda untuk mengaktifkan fungsi cetakan penuh.");
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Non-printable Selector & Action Controls */}
      <div className="print:hidden bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Penyata Kewangan Bulanan Lengkap</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Jana dan cetak laporan penerimaan, perbelanjaan, dan pengesahan 3 Ahli Jawatankuasa
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month & Year Pickers */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
            >
              {monthNames.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
              <option value={2028}>2028</option>
              <option value={2029}>2029</option>
              <option value={2030}>2030</option>
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan Penyata</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 text-slate-900 space-y-6">
        {/* Report Header */}
        <div className="border-b-[3px] border-slate-900 pb-5 flex flex-col items-center justify-center gap-1.5 text-center">
          {settings.org.logoUrl && (
            <div className="shrink-0">
              <img src={settings.org.logoUrl} alt="Logo Surau" className="h-16 sm:h-20 w-auto object-contain" />
            </div>
          )}
          <div className="space-y-0.5 flex flex-col items-center w-full">
            <h1 className="text-xl sm:text-2xl font-black text-[#004d40] uppercase tracking-tight mb-0.5">
              {settings.org.name.toUpperCase()}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              {settings.org.kariah}
            </p>
            {settings.org.address && (
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                {settings.org.address}
              </p>
            )}
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
              No. Pendaftaran: {settings.org.regNo} | Akaun Bank: {settings.org.bankName} ({settings.org.bankAccount})
            </p>
            
            <div className="mt-3 bg-[#00251a] text-[#ffc107] font-bold text-xs sm:text-sm px-6 py-2 rounded-full uppercase tracking-wider shadow-sm">
              PENYATA KEWANGAN BULANAN – {monthNames[selectedMonth - 1].toUpperCase()} {selectedYear}
            </div>
          </div>
        </div>

        {/* Executive Summary Box */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Baki Bawa Ke Hadapan
            </span>
            <span className="text-base font-extrabold text-slate-800">
              RM {openingBroughtForward.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase block">
              Jumlah Duit Masuk
            </span>
            <span className="text-base font-extrabold text-emerald-600">
              +RM {totalMonthIn.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-rose-600 uppercase block">
              Jumlah Perbelanjaan
            </span>
            <span className="text-base font-extrabold text-rose-600">
              -RM {totalMonthOut.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="border-l border-slate-200 pl-3">
            <span className="text-[10px] font-bold text-slate-800 uppercase block">
              Baki Akhir {monthNames[selectedMonth - 1]}
            </span>
            <span className="text-base font-black text-emerald-900">
              RM {endingBalance.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Section 1: Breakdown By Income & Expense Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Income Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-emerald-800 text-white p-2.5 font-bold flex justify-between items-center">
              <span>1. PENERIMAAN (DUIT MASUK)</span>
              <span>RM</span>
            </div>
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-100">
                {Object.keys(inCategoryTotals).length === 0 ? (
                  <tr>
                    <td className="p-3 text-slate-400 italic">Tiada penerimaan direkodkan.</td>
                  </tr>
                ) : (
                  (Object.entries(inCategoryTotals) as [string, number][]).map(([cat, amount]) => (
                    <tr key={cat} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium text-slate-800">{cat}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900 font-mono">
                        {amount.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-emerald-50 border-t-2 border-emerald-800 font-extrabold text-emerald-900">
                  <td className="p-2.5">JUMLAH KESELURAHAN PENERIMAAN:</td>
                  <td className="p-2.5 text-right font-mono">
                    RM {totalMonthIn.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Expense Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-rose-800 text-white p-2.5 font-bold flex justify-between items-center">
              <span>2. PERBELANJAAN (DUIT KELUAR)</span>
              <span>RM</span>
            </div>
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-100">
                {Object.keys(outCategoryTotals).length === 0 ? (
                  <tr>
                    <td className="p-3 text-slate-400 italic">Tiada perbelanjaan direkodkan.</td>
                  </tr>
                ) : (
                  (Object.entries(outCategoryTotals) as [string, number][]).map(([cat, amount]) => (
                    <tr key={cat} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium text-slate-800">{cat}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900 font-mono">
                        {amount.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-rose-50 border-t-2 border-rose-800 font-extrabold text-rose-900">
                  <td className="p-2.5">JUMLAH KESELURAHAN PERBELANJAAN:</td>
                  <td className="p-2.5 text-right font-mono">
                    RM {totalMonthOut.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Official AJK Signatures Block */}
        <div className="pt-6 border-t-2 border-slate-900 space-y-6">
          <div className="text-center">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
              PENGESAHAN LAPORAN KEWANGAN AHLI JAWATANKUASA SURAU
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Penyata ini telah disemak, disahkan dan diluluskan secara rasmi
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-xs text-center">
            {/* Pengerusi */}
            <div className="flex flex-col items-center justify-end pt-8">
              <div className="w-full max-w-[120px] border-b border-slate-900 mb-1"></div>
              <span className="font-extrabold text-slate-900 line-clamp-1" title={settings.ajk.pengerusi}>{settings.ajk.pengerusi}</span>
              <span className="text-[10px] text-slate-500 font-medium">Pengerusi</span>
            </div>

            {/* Setiausaha */}
            <div className="flex flex-col items-center justify-end pt-8">
              <div className="w-full max-w-[120px] border-b border-slate-900 mb-1"></div>
              <span className="font-extrabold text-slate-900 line-clamp-1" title={settings.ajk.setiausaha}>{settings.ajk.setiausaha}</span>
              <span className="text-[10px] text-slate-500 font-medium">Setiausaha</span>
            </div>

            {/* Bendahari */}
            <div className="flex flex-col items-center justify-end pt-8">
              <div className="w-full max-w-[120px] border-b border-slate-900 mb-1"></div>
              <span className="font-extrabold text-slate-900 line-clamp-1" title={settings.ajk.bendahari}>{settings.ajk.bendahari}</span>
              <span className="text-[10px] text-slate-500 font-medium">Bendahari</span>
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400 pt-4">
          Dicetak dari Sistem Pengurusan Kewangan & Akaun Surau ({settings.org.name}) • {new Date().toLocaleDateString('ms-MY')}
        </div>
      </div>
    </div>
  );
};
