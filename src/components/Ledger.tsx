import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { Search, Filter, Pencil, Trash2, ArrowUpRight, ArrowDownRight, FileText, Download } from 'lucide-react';

interface LedgerProps {
  transactions: Transaction[];
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const Ledger: React.FC<LedgerProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');

  // Generate unique months for the filter dropdown
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((tx) => {
      const monthPrefix = tx.date.substring(0, 7); // YYYY-MM
      months.add(monthPrefix);
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Filter by type
      if (filterType !== 'ALL' && tx.type !== filterType) return false;

      // Filter by month
      if (filterMonth !== 'ALL' && !tx.date.startsWith(filterMonth)) return false;

      // Search filter
      const searchLower = searchTerm.toLowerCase();
      if (
        searchTerm &&
        !tx.refNo.toLowerCase().includes(searchLower) &&
        !tx.partyName.toLowerCase().includes(searchLower) &&
        !tx.category.toLowerCase().includes(searchLower) &&
        !tx.notes.toLowerCase().includes(searchLower)
      ) {
        return false;
      }

      return true;
    });
  }, [transactions, searchTerm, filterType, filterMonth]);

  const totalFilteredIn = filteredTransactions
    .filter((tx) => tx.type === 'IN')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalFilteredOut = filteredTransactions
    .filter((tx) => tx.type === 'OUT')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handleDelete = (id: string, refNo: string) => {
    if (window.confirm(`Adakah anda pasti mahu memadamkan transaksi ${refNo} ini? Tindakan ini tidak boleh dikembalikan.`)) {
      onDeleteTransaction(id);
    }
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    // Build CSV Content
    const headers = ['Tarikh', 'No Rujukan', 'Jenis', 'Kategori', 'Kaedah Bayaran', 'Pihak/Syarikat', 'Jumlah (RM)', 'Nota'];
    const rows = filteredTransactions.map(tx => [
      tx.date,
      tx.refNo,
      tx.type === 'IN' ? 'Masuk' : 'Keluar',
      `"${tx.category}"`,
      tx.paymentMethod,
      `"${tx.partyName || '-'}"`,
      tx.amount.toFixed(2),
      `"${tx.notes.replace(/"/g, '""') || '-'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    // Create Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Buku_Tunai_${filterMonth === 'ALL' ? 'Semua' : filterMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Buku Tunai & Rekod Transaksi</h2>
            <p className="text-sm text-slate-500">Urus dan pusing ganti semua rekod kewangan surau</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-bold">
              +RM {totalFilteredIn.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
            </div>
            <div className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg font-bold">
              -RM {totalFilteredOut.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
            </div>
            <button
              onClick={handleExportCSV}
              disabled={filteredTransactions.length === 0}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-3 py-1.5 rounded-lg font-semibold transition shadow-sm"
              title="Eksport ke CSV (Excel)"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Eksport CSV</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full md:w-auto flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari no rujukan, nama, atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="ALL">Semua Jenis</option>
                <option value="IN">Duit Masuk (+)</option>
                <option value="OUT">Duit Keluar (-)</option>
              </select>
            </div>

            <div className="relative w-full md:w-auto">
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full pl-4 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="ALL">Semua Bulan</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="p-4">Tarikh & No. Ruj</th>
                <th className="p-4">Kategori & Butiran</th>
                <th className="p-4">Kaedah</th>
                <th className="p-4 text-right">Jumlah (RM)</th>
                <th className="p-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>Tiada rekod transaksi dijumpai.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition group">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{tx.date}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{tx.refNo}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {tx.type === 'IN' ? (
                          <ArrowDownRight className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-slate-800">{tx.category}</div>
                          <div className="text-xs text-slate-500 truncate max-w-xs" title={tx.notes || tx.partyName}>
                            {tx.partyName} {tx.notes && `• ${tx.notes}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`font-extrabold ${
                          tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'IN' ? '+' : '-'}
                        {tx.amount.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                          title="Kemaskini"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id, tx.refNo)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Padam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
