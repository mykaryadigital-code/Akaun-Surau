import React, { useState } from 'react';
import {
  Search,
  Bell,
  User,
  ChevronDown,
  Menu,
  LogOut,
  Settings,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { AppSettings, Transaction } from '../types';

interface NavbarProps {
  settings: AppSettings;
  onOpenSettings: () => void;
  onLogout?: () => void;
  onMobileMenuToggle: () => void;
  onSearch?: (query: string) => void;
  isSuperAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenSettings,
  onLogout,
  onMobileMenuToggle,
  onSearch,
  isSuperAdmin,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-auto relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-3">
          {/* Notification Button with Badge '2' */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
              aria-label="Pemberitahuan"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                2
              </span>
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900">Pemberitahuan</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">2 Baharu</span>
                </div>
                <div className="divide-y divide-slate-100 py-1">
                  <div className="py-2 space-y-0.5">
                    <p className="font-semibold text-slate-800">Penyegerakan Awan Berjaya</p>
                    <p className="text-[11px] text-slate-500">Semua transaksi telah disandarkan secara selamat.</p>
                  </div>
                  <div className="py-2 space-y-0.5">
                    <p className="font-semibold text-slate-800">Laporan Bulanan Sedia</p>
                    <p className="text-[11px] text-slate-500">Penyata kewangan bagi bulan ini sedia untuk dijana.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-full sm:rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
            >
              {/* Avatar circle */}
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                <User className="w-4 h-4 text-slate-600" />
              </div>

              {/* User text */}
              <div className="text-left hidden sm:block">
                <span className="block text-xs font-bold text-slate-900 leading-tight">
                  Admin Surau
                </span>
                <span className="block text-[10px] text-slate-500 leading-tight">
                  {isSuperAdmin ? 'Pentadbir Utama' : 'Pentadbir'}
                </span>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="font-bold text-slate-900">Admin Surau</p>
                  <p className="text-[11px] text-slate-500 truncate">{settings.org.name}</p>
                </div>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Tetapan Sistem</span>
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-medium transition border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Keluar</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
