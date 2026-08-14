/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppTheme } from '../types';

export interface ThemeColors {
  id: AppTheme;
  name: string;
  badge: string;
  headerBg: string;
  headerAccent: string;
  primaryBtn: string;
  primaryBtnHover: string;
  secondaryBtn: string;
  borderActive: string;
  activeTab: string;
  cardHeader: string;
  iconBg: string;
  iconText: string;
  highlightText: string;
  ring: string;
  gradientBg: string;
  bannerBg: string;
}

export const THEMES: Record<AppTheme, ThemeColors> = {
  emerald: {
    id: 'emerald',
    name: 'Emerald Hijau Tradisional',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    headerBg: 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900',
    headerAccent: 'text-emerald-200',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
    primaryBtnHover: 'hover:bg-emerald-700',
    secondaryBtn: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200',
    borderActive: 'border-emerald-500',
    activeTab: 'bg-emerald-600 text-white shadow-sm',
    cardHeader: 'bg-emerald-50 text-emerald-900 border-b border-emerald-100',
    iconBg: 'bg-emerald-100 text-emerald-700',
    iconText: 'text-emerald-700',
    highlightText: 'text-emerald-600',
    ring: 'focus:ring-emerald-500',
    gradientBg: 'from-emerald-900 via-emerald-800 to-teal-900',
    bannerBg: 'bg-emerald-900 text-white',
  },
  masjidi: {
    id: 'masjidi',
    name: 'Biru Masjidi',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    headerBg: 'bg-gradient-to-r from-sky-800 via-sky-700 to-blue-900',
    headerAccent: 'text-sky-200',
    primaryBtn: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm',
    primaryBtnHover: 'hover:bg-sky-700',
    secondaryBtn: 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200',
    borderActive: 'border-sky-500',
    activeTab: 'bg-sky-600 text-white shadow-sm',
    cardHeader: 'bg-sky-50 text-sky-900 border-b border-sky-100',
    iconBg: 'bg-sky-100 text-sky-700',
    iconText: 'text-sky-700',
    highlightText: 'text-sky-600',
    ring: 'focus:ring-sky-500',
    gradientBg: 'from-sky-900 via-blue-800 to-indigo-900',
    bannerBg: 'bg-sky-900 text-white',
  },
  teal: {
    id: 'teal',
    name: 'Teal Islamik',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    headerBg: 'bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-900',
    headerAccent: 'text-teal-200',
    primaryBtn: 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm',
    primaryBtnHover: 'hover:bg-teal-700',
    secondaryBtn: 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200',
    borderActive: 'border-teal-500',
    activeTab: 'bg-teal-600 text-white shadow-sm',
    cardHeader: 'bg-teal-50 text-teal-900 border-b border-teal-100',
    iconBg: 'bg-teal-100 text-teal-700',
    iconText: 'text-teal-700',
    highlightText: 'text-teal-600',
    ring: 'focus:ring-teal-500',
    gradientBg: 'from-teal-900 via-teal-800 to-emerald-900',
    bannerBg: 'bg-teal-900 text-white',
  },
  amber: {
    id: 'amber',
    name: 'Amber Gold',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    headerBg: 'bg-gradient-to-r from-amber-800 via-amber-700 to-yellow-900',
    headerAccent: 'text-amber-200',
    primaryBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm',
    primaryBtnHover: 'hover:bg-amber-700',
    secondaryBtn: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200',
    borderActive: 'border-amber-500',
    activeTab: 'bg-amber-600 text-white shadow-sm',
    cardHeader: 'bg-amber-50 text-amber-900 border-b border-amber-100',
    iconBg: 'bg-amber-100 text-amber-800',
    iconText: 'text-amber-700',
    highlightText: 'text-amber-600',
    ring: 'focus:ring-amber-500',
    gradientBg: 'from-amber-900 via-amber-800 to-yellow-900',
    bannerBg: 'bg-amber-900 text-white',
  },
  slate: {
    id: 'slate',
    name: 'Slate Gelap Moden',
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
    headerBg: 'bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900',
    headerAccent: 'text-slate-300',
    primaryBtn: 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm',
    primaryBtnHover: 'hover:bg-slate-900',
    secondaryBtn: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300',
    borderActive: 'border-slate-600',
    activeTab: 'bg-slate-800 text-white shadow-sm',
    cardHeader: 'bg-slate-100 text-slate-900 border-b border-slate-200',
    iconBg: 'bg-slate-200 text-slate-800',
    iconText: 'text-slate-800',
    highlightText: 'text-slate-700',
    ring: 'focus:ring-slate-500',
    gradientBg: 'from-slate-950 via-slate-900 to-zinc-900',
    bannerBg: 'bg-slate-900 text-white',
  },
};

export function getTheme(themeKey: AppTheme): ThemeColors {
  return THEMES[themeKey] || THEMES.emerald;
}
