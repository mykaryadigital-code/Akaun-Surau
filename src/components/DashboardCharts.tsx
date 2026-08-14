import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ms } from 'date-fns/locale';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Transaction } from '../types';

interface DashboardChartsProps {
  transactions: Transaction[];
}

const COLORS = ['#0f766e', '#0284c7', '#7c3aed', '#c084fc', '#f59e0b', '#e11d48'];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ transactions }) => {
  // 1. Prepare Data for Bar Chart (Monthly Cash Flow)
  const monthlyData = useMemo(() => {
    const grouped: Record<string, { month: string; rawDate: Date; masuk: number; keluar: number }> = {};

    transactions.forEach(tx => {
      const date = parseISO(tx.date);
      // Format as "Ogo 26" (short month, 2-digit year) using MS locale
      const monthKey = format(date, 'MMM yy', { locale: ms });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: monthKey,
          rawDate: date,
          masuk: 0,
          keluar: 0
        };
      }

      if (tx.type === 'IN') {
        grouped[monthKey].masuk += tx.amount;
      } else {
        grouped[monthKey].keluar += tx.amount;
      }
    });

    // Sort chronologically
    return Object.values(grouped).sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
  }, [transactions]);

  // 2. Prepare Data for Donut Chart (Expense Breakdown)
  const expenseData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'OUT');
    const grouped: Record<string, number> = {};

    expenses.forEach(tx => {
      grouped[tx.category] = (grouped[tx.category] || 0) + tx.amount;
    });

    const sorted = Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Keep top 4, group rest as "Lain-lain"
    if (sorted.length > 5) {
      const top4 = sorted.slice(0, 4);
      const restValue = sorted.slice(4).reduce((sum, item) => sum + item.value, 0);
      return [...top4, { name: 'Lain-lain', value: restValue }];
    }

    return sorted;
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg text-sm">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }} className="font-medium">
                {entry.name === 'masuk' ? 'Duit Masuk' : 'Duit Keluar'}:
              </span>
              <span className="font-bold">
                RM {entry.value.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => `RM${value}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Chart 1: Bar Chart */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Aliran Tunai Bulanan (Masuk vs Keluar)</h3>
              <p className="text-xs text-slate-500">Perbandingan jumlah debit & kredit</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            Analisis Bulanan
          </span>
        </div>
        
        <div className="h-64 sm:h-72 w-full">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  tickFormatter={formatYAxis} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  content={(props) => {
                    const { payload } = props;
                    return (
                      <div className="flex items-center justify-center gap-6 mt-4">
                        {payload?.map((entry, index) => (
                          <div key={`item-${index}`} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
                            {entry.value === 'keluar' ? 'Duit Keluar (Kredit)' : 'Duit Masuk (Debit)'}
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Bar dataKey="keluar" fill="#e11d48" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Bar dataKey="masuk" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Tiada data transaksi
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Donut Chart */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Pecahan Perbelanjaan Mengikut Kategori</h3>
              <p className="text-xs text-slate-500">Agihan perbelanjaan utama surau</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
            Kredit
          </span>
        </div>
        
        <div className="h-64 sm:h-72 w-full flex items-center justify-center">
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `RM ${value.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  wrapperStyle={{ fontSize: '12px', paddingLeft: '20px' }}
                  content={(props) => {
                    const { payload } = props;
                    return (
                      <ul className="space-y-3">
                        {payload?.map((entry, index) => (
                          <li key={`item-${index}`} className="flex items-center gap-3">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                              <span className="text-slate-700 truncate max-w-[120px]" title={entry.value}>
                                {entry.value}
                              </span>
                            </div>
                            <span className="font-bold text-slate-900 shrink-0">
                              RM {expenseData[index].value.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                            </span>
                          </li>
                        ))}
                      </ul>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Tiada data perbelanjaan
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
