import React from 'react';
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  BarChart3,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';
import { AppSettings } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  settings: AppSettings;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  settings,
  mobileOpen,
  setMobileOpen,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const financialItems = [
    { id: 'penerimaan', label: 'Penerimaan', icon: ArrowDownCircle },
    { id: 'perbelanjaan', label: 'Perbelanjaan', icon: ArrowUpCircle },
    { id: 'resit', label: 'Resit', icon: Receipt },
    { id: 'report', label: 'Laporan', icon: BarChart3 },
    { id: 'settings_trigger', label: 'Tetapan', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'settings_trigger') {
      onOpenSettings();
    } else {
      setActiveTab(id);
    }
    setMobileOpen(false);
  };

  const currentYear = new Date().getFullYear();
  const surauName = settings.org?.name || 'Surau Al-Jannah';
  const surauLocation = settings.org?.kariah || 'Pantai Manis, Papar';
  const surauEstablished = settings.org?.regNo ? settings.org.regNo : 'Sejak 2024';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-5 transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:static lg:shadow-none'
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Islamic Mosque Logo Symbol */}
              <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center text-white shadow-sm shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" stroke="none">
                  <path d="M12 2C11.5 2 11 2.3 11 2.8C11 3.4 11.4 3.9 12 4C13.1 4 14 4.9 14 6C14 7.1 13.1 8 12 8C11.4 8.1 11 8.6 11 9.2C11 9.7 11.5 10 12 10C14.2 10 16 8.2 16 6C16 3.8 14.2 2 12 2Z" />
                  <path d="M12 4.5C9.5 7 7 9.5 7 13H17C17 9.5 14.5 7 12 4.5Z" />
                  <rect x="5" y="13" width="14" height="8" rx="1" />
                  <path d="M10 21V16C10 14.9 10.9 14 12 14C13.1 14 14 14.9 14 16V21H10Z" fill="#064e3b" />
                  <circle cx="12" cy="11" r="1" fill="#ecfdf5" />
                  <rect x="3" y="10" width="2" height="11" rx="0.5" />
                  <path d="M4 8L5 10H3L4 8Z" />
                  <rect x="19" y="10" width="2" height="11" rx="0.5" />
                  <path d="M20 8L21 10H19L20 8Z" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-slate-900 leading-none">
                  AKAUN SURAU
                </h1>
                <p className="text-[10px] text-slate-500 font-medium mt-1 leading-tight">
                  Telus • Amanah • Bertanggungjawab
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            {/* Top items (Dashboard) */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Section: Kewangan */}
            <div className="space-y-1">
              <span className="block px-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Kewangan
              </span>
              {financialItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Mosque Profile Card */}
        <div className="mt-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 p-4 text-white shadow-md border border-emerald-700/50">
            {/* Mosque Silhouette SVG Art Backdrop */}
            <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none translate-x-2 translate-y-2">
              <svg width="120" height="100" viewBox="0 0 100 80" fill="currentColor">
                <path d="M50 0C45 8 38 18 38 30H62C62 18 55 8 50 0Z" />
                <rect x="30" y="30" width="40" height="50" rx="2" />
                <path d="M43 80V60C43 56 46 53 50 53C54 53 57 56 57 60V80H43Z" fill="#022c22" />
                <rect x="15" y="20" width="10" height="60" rx="1" />
                <path d="M20 10L25 20H15L20 10Z" />
                <rect x="75" y="20" width="10" height="60" rx="1" />
                <path d="M80 10L85 20H75L80 10Z" />
              </svg>
            </div>

            {/* Glowing dome badge */}
            <div className="relative z-10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-200 border border-white/10">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white tracking-tight leading-tight line-clamp-1">
                  {surauName}
                </h4>
                <p className="text-[11px] text-emerald-200/90 font-medium line-clamp-1">
                  {surauLocation}
                </p>
              </div>
              <div className="pt-1">
                <span className="inline-block px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-bold text-emerald-100 border border-white/10">
                  {surauEstablished}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
