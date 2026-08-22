import React, { useState } from 'react';
import { Transaction, AppSettings } from '../types';
import { Search, Printer, Receipt, CheckCircle, ArrowDownRight, ArrowUpRight, Calendar, User, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ms } from 'date-fns/locale';

interface ReceiptViewProps {
  settings: AppSettings;
  transactions: Transaction[];
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({ settings, transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTxId, setSelectedTxId] = useState<string>(transactions[0]?.id || '');

  const filtered = transactions.filter(t => 
    t.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTx = transactions.find(t => t.id === selectedTxId) || transactions[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="print:hidden bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Penjanaan & Cetakan Resit Rasmi</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Cari transaksi untuk menjana dan mencetak baucar atau resit rasmi surau
          </p>
        </div>
        {selectedTx && (
          <button
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition w-fit"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Resit ({selectedTx.refNo})</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Transaction Selector List */}
        <div className="print:hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari no rujukan, nama pembayar/penerima..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-8">Tiada transaksi dijumpai</p>
            ) : (
              filtered.map((tx) => (
                <button
                  key={tx.id}
                  onClick={() => setSelectedTxId(tx.id)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between gap-2 ${
                    selectedTx?.id === tx.id
                      ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400'
                      : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        tx.type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tx.type === 'IN' ? 'RESIT PENERIMAAN' : 'BAUCAR BAYARAN'}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate">{tx.refNo}</span>
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-1">{tx.partyName || tx.category}</p>
                    <p className="text-[11px] text-slate-400">{tx.date}</p>
                  </div>
                  <span className={`font-bold text-xs whitespace-nowrap ${
                    tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {tx.type === 'IN' ? '+' : '-'}RM {tx.amount.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Printable Receipt Canvas */}
        <div className="lg:col-span-2">
          {selectedTx ? (
            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 text-slate-900 space-y-6">
              {/* Receipt Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                    {settings.org.name}
                  </h1>
                  <p className="text-xs font-semibold text-slate-700">
                    {settings.org.kariah} • No Pendaftaran: {settings.org.regNo}
                  </p>
                  <p className="text-xs text-slate-500">
                    Akaun Bank: {settings.org.bankName} ({settings.org.bankAccount})
                  </p>
                </div>
                {settings.org.logoUrl && (
                  <img src={settings.org.logoUrl} alt="Logo" className="h-16 w-auto object-contain shrink-0" />
                )}
              </div>

              {/* Title Badge */}
              <div className="text-center py-2 bg-slate-100 rounded-xl border border-slate-200">
                <h2 className="text-sm sm:text-base font-black tracking-wider uppercase text-slate-800">
                  {selectedTx.type === 'IN' ? 'RESIT RASMI PENERIMAAN' : 'BAUCAR BAYARAN / PERBELANJAAN'}
                </h2>
              </div>

              {/* Receipt Meta Fields */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">No. Rujukan</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{selectedTx.refNo}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Tarikh</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{selectedTx.date}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Kaedah Bayaran</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{selectedTx.paymentMethod}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Kategori</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{selectedTx.category}</span>
                </div>
              </div>

              {/* Details Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="py-2.5 px-4 text-left">Keterangan / Butiran</th>
                      <th className="py-2.5 px-4 text-right">Jumlah (RM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">
                          {selectedTx.type === 'IN' ? 'Diterima Daripada: ' : 'Dibayar Kepada: '}
                          {selectedTx.partyName || 'Hamba Allah / Umum'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Tujuan / Nota: {selectedTx.notes || selectedTx.category}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-base text-slate-900 align-top">
                        RM {selectedTx.amount.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                    <tr>
                      <td className="py-3 px-4 text-right">JUMLAH KESELURUHAN</td>
                      <td className="py-3 px-4 text-right text-emerald-700 text-base">
                        RM {selectedTx.amount.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-200 text-center text-xs">
                <div className="space-y-12">
                  <span className="text-slate-500 font-medium">Disediakan Oleh:</span>
                  <div className="border-t border-slate-400 pt-1">
                    <p className="font-bold text-slate-900">{settings.ajk.bendahari || 'Bendahari Surau'}</p>
                    <p className="text-[10px] text-slate-500">Bendahari</p>
                  </div>
                </div>
                <div className="space-y-12">
                  <span className="text-slate-500 font-medium">Disemak / Diterima:</span>
                  <div className="border-t border-slate-400 pt-1">
                    <p className="font-bold text-slate-900">{selectedTx.partyName || 'Penerima / Pembayar'}</p>
                    <p className="text-[10px] text-slate-500">Pihak Berkenaan</p>
                  </div>
                </div>
                <div className="space-y-12 col-span-2 sm:col-span-1">
                  <span className="text-slate-500 font-medium">Disahkan Oleh:</span>
                  <div className="border-t border-slate-400 pt-1">
                    <p className="font-bold text-slate-900">{settings.ajk.pengerusi || 'Pengerusi Surau'}</p>
                    <p className="text-[10px] text-slate-500">Pengerusi / Nazir</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center text-slate-400">
              Pilih transaksi daripada senarai di sebelah kiri untuk melihat resit
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
