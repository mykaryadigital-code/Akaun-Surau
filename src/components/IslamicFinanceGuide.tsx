/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Scale,
  Building2,
  Hammer,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  Search,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  Coins,
  ChevronDown,
  ChevronUp,
  Receipt,
  UserCheck,
  Landmark,
} from 'lucide-react';

interface IslamicFinanceGuideProps {
  onNavigateToExpense?: () => void;
}

export const IslamicFinanceGuide: React.FC<IslamicFinanceGuideProps> = ({
  onNavigateToExpense,
}) => {
  const [selectedCheckerFund, setSelectedCheckerFund] = useState<'Tabung Am' | 'Tabung Pembangunan' | 'Dana Khas'>('Tabung Pembangunan');
  const [selectedExpensePurpose, setSelectedExpensePurpose] = useState<string>('kenduri');
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'checker' | 'tatacara' | 'faq' | 'sources'>('matrix');

  // Matrix comparison items
  const expenseTypes = [
    {
      id: 'kenduri',
      title: 'Kenduri / Jamuan Jemaah & Program',
      desc: 'Jamuan makan selepas ceramah, moreh, iftar kariah, sambutan Maulidur Rasul',
      tabungAm: {
        status: 'allowed',
        label: 'DIBENARKAN',
        details: 'Harus secara munasabah untuk pengimarahan masjid dan mengeratkan ukhuwah (Fatwa Mufti Selangor & Pahang). Elakkan pembaziran.',
      },
      tabungPembangunan: {
        status: 'forbidden',
        label: 'TIDAK DIBENARKAN (HARAM)',
        details: 'Dilarang keras menyalahi niat penyumbang. Kaedah Syarak: "Syarat Pewakaf seperti Nas Syarak". Menggunakannya adalah pecah amanah.',
      },
      danaKhas: {
        status: 'conditional',
        label: 'BERSYARAT',
        details: 'Hanya dibenarkan jika tabung itu memang dilabel khusus untuk makanan/jamuan (contoh: Tabung Ihya Ramadan). Ditegah ambil daripada Tabung Anak Yatim.',
      },
    },
    {
      id: 'pembangunan',
      title: 'Baik Pulih, Ubah Suai & Binaan Fizikal',
      desc: 'Baiki atap bocor, bina tandas, renovasi dewan solat, pendawaian elektrik',
      tabungAm: {
        status: 'allowed',
        label: 'DIBENARKAN',
        details: 'Harus digunakan sekiranya ada keperluan mendesak memelihara bangunan surau dengan kelulusan mesyuarat AJK (Garis Panduan JAIS / JAKIM).',
      },
      tabungPembangunan: {
        status: 'allowed',
        label: 'FUNGSI UTAMA (WAJIB)',
        details: 'Inilah tujuan asal dan asasi tabung ini diwujudkan mengikut niat dan lafaz penyumbang.',
      },
      danaKhas: {
        status: 'forbidden',
        label: 'TIDAK DIBENARKAN',
        details: 'Wang tabung khas (anak yatim / bencana / palestin) tidak boleh disalurkan untuk struktur bangunan surau.',
      },
    },
    {
      id: 'utiliti',
      title: 'Bil Utiliti (Elektrik, Air, Wifi) & Kebersihan',
      desc: 'Bil TNB, bekalan air, bahan cucian, kawalan serangga, penyelenggaraan pendingin hawa',
      tabungAm: {
        status: 'allowed',
        label: 'FUNGSI UTAMA',
        details: 'Tanggungjawab asasi Tabung Am untuk operasi harian rumah Allah bagi keselesaan jemaah solat.',
      },
      tabungPembangunan: {
        status: 'forbidden',
        label: 'TIDAK DIBENARKAN',
        details: 'Fatwa Mufti Pulau Pinang & Selangor: Dana pembangunan wakaf tidak boleh digunakan untuk membayar bil utiliti bulanan.',
      },
      danaKhas: {
        status: 'forbidden',
        label: 'TIDAK DIBENARKAN',
        details: 'Haram mengambil hak asnaf atau sasaran tabung khas untuk menampung bil masjid.',
      },
    },
    {
      id: 'aset',
      title: 'Pembelian Aset Kekal (Aircond, Karpet, PA Sistem)',
      desc: 'Peralatan modal jangka panjang yang kekal dalam surau/masjid',
      tabungAm: {
        status: 'allowed',
        label: 'DIBENARKAN',
        details: 'Boleh dibeli melalui Tabung Am jika baki mencukupi dan diluluskan mesyuarat jawatankuasa.',
      },
      tabungPembangunan: {
        status: 'allowed',
        label: 'DIBENARKAN',
        details: 'Termasuk dalam kategori prasarana fizikal & kemudahan kekal rumah ibadat.',
      },
      danaKhas: {
        status: 'forbidden',
        label: 'TIDAK DIBENARKAN',
        details: 'Kecuali sumbangan itu memang dibuat khas oleh penderma untuk pembelian karpet atau pendingin hawa berkenaan.',
      },
    },
    {
      id: 'elaun',
      title: 'Elaun & Saguhati Pegawai / Penceramah',
      desc: 'Saguhati Imam, Bilal, Siak, guru takmir, penceramah jemputan',
      tabungAm: {
        status: 'allowed',
        label: 'DIBENARKAN',
        details: 'Boleh dibayar daripada Tabung Am mengikut kadar yang ditetapkan oleh Jawatankuasa / Garis Panduan Jabatan Agama.',
      },
      tabungPembangunan: {
        status: 'forbidden',
        label: 'TIDAK DIBENARKAN',
        details: 'Wang pembangunan fizikal tidak boleh dialihkan untuk pembayaran elaun atau saguhati kakitangan/penceramah.',
      },
      danaKhas: {
        status: 'forbidden',
        label: 'TIDAK DIBENARKAN',
        details: 'Dilarang sama sekali mengambil dana khas kebajikan untuk elaun pegawai surau.',
      },
    },
    {
      id: 'asnaf',
      title: 'Bantuan Fakir Miskin, Anak Yatim & Asnaf',
      desc: 'Agihan tunai, barangan dapur, bantuan kecemasan asnaf kariah',
      tabungAm: {
        status: 'allowed',
        label: 'HARUS',
        details: 'Boleh disalurkan sebahagian kecil sekiranya ada lebihan Tabung Am untuk kebajikan ahli kariah yang memerlukan (Fatwa Mufti WP).',
      },
      tabungPembangunan: {
        status: 'forbidden',
        label: 'TIDAK DIBENARKAN',
        details: 'Tidak boleh dialihkan daripada Tabung Pembangunan.',
      },
      danaKhas: {
        status: 'allowed',
        label: 'FUNGSI UTAMA (WAJIB)',
        details: 'Wajib diserahkan 100% kepada asnaf / penerima yang disasarkan tanpa potongan pentadbiran yang tidak dibenarkan.',
      },
    },
    {
      id: 'umrah',
      title: 'Tajaan Umrah / Lawatan / Percutian AJK',
      desc: 'Menaja tambang umrah, melancong, atau hadiah peribadi pegawai masjid',
      tabungAm: {
        status: 'forbidden',
        label: 'TIDAK DIBENARKAN',
        details: 'Fatwa Jabatan Mufti Negeri Pahang & Selangor: Wang masjid tidak boleh digunakan untuk menaja ibadah umrah atau percutian AJK masjid.',
      },
      tabungPembangunan: {
        status: 'forbidden',
        label: 'TIDAK DIBENARKAN',
        details: 'Sangat dilarang dan menyalahi amanah wakaf pembinaan.',
      },
      danaKhas: {
        status: 'forbidden',
        label: 'TIDAK DIBENARKAN',
        details: 'Pecah amanah terhadap hak penerima sumbangan.',
      },
    },
  ];

  // Checker evaluation
  const currentExpenseEvaluation = expenseTypes.find((e) => e.id === selectedExpensePurpose);
  let evaluationResult = {
    status: 'allowed',
    label: 'DIBENARKAN',
    details: '',
  };

  if (currentExpenseEvaluation) {
    if (selectedCheckerFund === 'Tabung Am') {
      evaluationResult = currentExpenseEvaluation.tabungAm;
    } else if (selectedCheckerFund === 'Tabung Pembangunan') {
      evaluationResult = currentExpenseEvaluation.tabungPembangunan;
    } else {
      evaluationResult = currentExpenseEvaluation.danaKhas;
    }
  }

  // Authentic FAQs
  const faqs = [
    {
      q: 'Apakah hukum menggunakan duit Tabung Pembangunan untuk jamuan makan atau kenduri surau?',
      a: 'HUKUMNYA ADALAH TIDAK DIBENARKAN (HARAM). Mengikut keputusan rasmi Pejabat Mufti Wilayah Persekutuan, Jabatan Mufti Negeri Selangor, dan Jabatan Mufti Pulau Pinang, wang Tabung Pembangunan adalah berstatus wakaf/infaq bersyarat khusus. Kaedah Fiqh menetapkan: «شَرْطُ الْوَاقِفِ كَنَصِّ الشَّارِعِ» (Syarat pewakaf/penyumbang adalah seperti nas syarak). Menyalahgunakan wang yang disumbangkan orang ramai untuk pembinaan bagi tujuan kenduri atau makan-makan merupakan satu bentuk pecah amanah.',
      source: 'Irsyad Al-Fatwa PMWP, Fatwa Jawatankuasa Fatwa Negeri Selangor & Pulau Pinang.',
    },
    {
      q: 'Bolehkah duit Tabung Am digunakan untuk projek baik pulih atau pembinaan masjid/surau?',
      a: 'YA, BOLEH DAN HARUS. Tabung Am bersifat umum (mutlak) untuk segala kemaslahatan, pengurusan, dan pemeliharaan rumah ibadat. Menurut Garis Panduan Pengurusan Kewangan Masjid JAIS (2023) dan JAKIM (2021), sekiranya masjid memerlukan pembaikan fasiliti seperti bumbung bocor, membaiki tandas, atau membesarkan ruangan solat, Jawatankuasa Surau dibenarkan meluluskan perbelanjaan daripada Tabung Am.',
      source: 'Buku Garis Panduan Pengurusan Kewangan MAIS (Bil. 6/2023), JAKIM (2021).',
    },
    {
      q: 'Apakah hukum menggunakan duit Tabung Am untuk jamuan makan kenduri kariah atau jemaah?',
      a: 'BOLEH DENGAN SYARAT KADAR YANG MUNASABAH & BERTUJUAN PENGIMARAHAN. Jabatan Mufti Negeri Selangor dan Jabatan Mufti Negeri Pahang menjelaskan bahawa penggunaan sebahagian dana Tabung Am untuk jamuan jemaah sempena majlis ilmu, jamuan moreh Ramadan, atau kenduri ukhuwah kariah adalah harus kerana ia termasuk dalam kategori mengimarahkan rumah Allah (Imarah al-Masajid) dan menarik jemaah. Walau bagaimanapun, dilarang berlaku pembaziran (israf) atau perbelanjaan berlebih-lebihan melebihi kemampuan kewangan surau.',
      source: 'Fatwa Jabatan Mufti Negeri Selangor & Jabatan Mufti Negeri Pahang.',
    },
    {
      q: 'Bagaimana sekiranya projek pembangunan telah siap dan masih terdapat lebihan duit Tabung Pembangunan?',
      a: 'LEBIHAN TIDAK BOLEH DISERAP KEPADA TABUNG KENDURI/AM SESUKA HATI. Menurut Garis Panduan Kewangan JAIS dan kaedah syarak, baki lebihan hendaklah dikekalkan di dalam akaun pembangunan untuk penyelenggaraan atau fasa pembangunan seterusnya. Jika surau berhasrat memindahkan lebihan dana tersebut ke tabung lain kerana tiada lagi projek pembangunan, Jawatankuasa WAJIB merujuk dan mendapatkan kebenaran bertulis daripada Majlis Agama Islam Negeri (contoh: MAIS di Selangor atau MAIWP di Wilayah Persekutuan) selaras dengan konsep istibdal atau pengalihan maslahah.',
      source: 'Garis Panduan Pengurusan Kewangan MAIS/JAIS 2023.',
    },
    {
      q: 'Apakah tujuan dan batasan penggunaan Dana Khas (contoh: Tabung Anak Yatim, Tabung Palestin)?',
      a: 'DANA KHAS MESTI DISALURKAN 100% KEPADA SASARANNYA. Jawatankuasa Surau hanyalah pemegang amanah (yad amanah). Mengikut garis panduan Jabatan Agama Islam dan Pejabat Mufti, diharamkan sama sekali mengambil atau memotong wang tabung anak yatim atau tabung mangsa bencana untuk membiayai bil elektrik surau, elaun siak, atau jamuan AJK. Setiap sumbangan khas wajib diagihkan terus kepada pihak berhak atau diserahkan kepada tabung amanah rasmi Majlis Agama Islam Negeri.',
      source: 'Garis Panduan MAIWP & JAIS; Irsyad Al-Fatwa Mufti WP.',
    },
    {
      q: 'Bolehkah AJK surau/masjid menggunakan duit tabung masjid untuk menaja umrah atau percutian AJK?',
      a: 'TIDAK DIBENARKAN SAMA SEKALI. Jabatan Mufti Negeri Pahang menegaskan bahawa wang tabung masjid tidak boleh digunakan untuk menaja tambang umrah atau percutian mana-mana AJK. Duit tabung masjid adalah amanah umat Islam untuk maslahah masjid dan jemaah umum, bukannya ganjaran peribadi kepada individu pentadbir.',
      source: 'Keputusan Fatwa Jabatan Mufti Negeri Pahang.',
    },
    {
      q: 'Bolehkah surau memberi pinjaman wang tabung kepada mana-mana AJK atau anak kariah yang memerlukan?',
      a: 'TIDAK DIBENARKAN. Mengikut Buku Garis Panduan Pengurusan Kewangan JAIS dan JAWI, pentadbir surau/masjid ditegah sama sekali daripada memberi pinjaman peribadi daripada dana tabung masjid kepada mana-mana individu, termasuk pegawai masjid itu sendiri. Sekiranya ada anak kariah terdesak, bantuan hendaklah disalurkan dalam bentuk saguhati kebajikan asnaf mengikut kriteria yang diluluskan mesyuarat, bukannya pinjaman berhutang.',
      source: 'Garis Panduan Tatacara Kewangan Masjid JAIS / MAIWP.',
    },
    {
      q: 'Apakah peraturan tandatangan cek dan had kuasa perbelanjaan menurut Jabatan Agama?',
      a: 'Setiap cek atau arahan transaksi bank WAJIB ditandatangani oleh sekurang-kurangnya DUA orang penandatangan yang sah (lazimnya Pengerusi bersama Bendahari, atau Setiausaha jika salah seorang tiada). Ditegah sekeras-kerasnya menandatangani cek kosong (blank cheque). Untuk perbelanjaan yang melebihi siling kuasa (contoh melebihi RM10,000 mengikut ketetapan negeri), kelulusan mesyuarat jawatankuasa dan kebenaran Pegawai Tadbir Agama Daerah (PAID) / MAIS / JAWI adalah diwajibkan sebelum pembayaran dibuat.',
      source: 'Enakmen Pentadbiran Agama Islam & Garis Panduan Kewangan JAIS / JAWI / JHEAINS / MIS Sarawak.',
    },
    {
      q: 'Bagaimanakah tatacara pengurusan akaun bank, pendaftaran surau, dan audit kewangan di Sabah (JHEAINS & MUIS)?',
      a: 'Berdasarkan Enakmen Majlis Ugama Islam Sabah 2004 serta ketetapan Jabatan Hal Ehwal Agama Islam Negeri Sabah (JHEAINS): Setiap surau yang berdaftar (dengan nombor pendaftaran rasmi JHEAINS cth: BPWD) dibenarkan membuka akaun bank rasmi atas nama surau (seperti di Agro Bank, Bank Islam, atau bank tempatan lain) dengan sekurang-kurangnya dua penandatangan berdaftar (Pengerusi & Bendahari). Wang kutipan tidak boleh disimpan di kediaman peribadi AJK melebihi had wang runcit. Bendahari wajib membentangkan Penyata Kewangan bulanan kepada jemaah serta menyediakan Laporan Kewangan Tahunan beraudit (disemak oleh Pemeriksa Kira-kira yang dilantik anak kariah) untuk dikemukakan kepada Pegawai Tadbir Agama Daerah (PTAD) JHEAINS.',
      source: 'Enakmen Majlis Ugama Islam Sabah 2004, Garis Panduan Pentadbiran Masjid & Surau JHEAINS, Bahagian Kewangan MUIS.',
    },
    {
      q: 'Apakah ketetapan pengurusan kewangan masjid dan surau di Sarawak di bawah Majlis Islam Sarawak (MIS) & JAIS?',
      a: 'Di bawah Ordinan Majlis Islam Sarawak 2001 dan Garis Panduan Pengurusan Masjid dan Surau Sarawak 2024 (Kaedah Pengurusan Kewangan): Jawatankuasa Pengurusan Surau bertanggungjawab memastikan tadbir urus kewangan telus dan beraudit. Kutipan tabung Jumaat wajib dibuka bersama saksi dengan borang kiraan rasmi pecahan wang, serta dibankkan dengan segera. Bagi projek pembaikan fizikal atau binaan tambahan, surau berdaftar di bawah JAIS boleh memohon skim bantuan Tabung Baitulmal Sarawak (TBS) tertakluk kepada pematuhan tatacara perolehan dan laporan Bahagian Pentadbiran & Kewangan JAIS.',
      source: 'Ordinan Majlis Islam Sarawak 2001, Garis Panduan Pengurusan Masjid dan Surau Sarawak 2024 (Majlis Islam Sarawak), Tabung Baitulmal Sarawak (TBS).',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner / Title Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide">
            <Scale className="w-3.5 h-3.5" />
            PANDUAN SYARAK & JABATAN AGAMA ISLAM
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Garis Panduan Pengurusan & Penggunaan Duit Tabung Surau / Masjid
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Panduan rasmi bagi memastikan setiap sen kutipan tabung diuruskan mengikut ketetapan{' '}
            <strong className="text-white underline decoration-emerald-400 font-semibold">
              Hukum Syarak
            </strong>
            , fatwa Jabatan Mufti, dan{' '}
            <strong className="text-white underline decoration-emerald-400 font-semibold">
              Garis Panduan Kewangan Jabatan Agama Islam Negeri (JHEAINS Sabah, MUIS, JAIS Sarawak, MIS, JAIS Selangor, JAWI, MAIS, MAIWP, JAKIM)
            </strong>
            .
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-emerald-200">
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Rujukan Dokumen Rasmi
            </span>
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              Kaedah Fiqh: Syart al-Waqif ka nass al-Syari&apos;
            </span>
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              Tadbir Urus Beraudit
            </span>
          </div>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
          <Scale className="w-72 h-72 text-emerald-300" />
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition ${
            activeSubTab === 'matrix'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Scale className="w-4 h-4" />
          Matriks Hukum & Perbandingan Dana
        </button>

        <button
          onClick={() => setActiveSubTab('checker')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition ${
            activeSubTab === 'checker'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Penyemak Kesesuaian Perbelanjaan
        </button>

        <button
          onClick={() => setActiveSubTab('tatacara')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition ${
            activeSubTab === 'tatacara'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Tatacara Pengendalian Wang Tunai
        </button>

        <button
          onClick={() => setActiveSubTab('faq')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition ${
            activeSubTab === 'faq'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Soal Jawab Lazim (FAQ)
        </button>

        <button
          onClick={() => setActiveSubTab('sources')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition ${
            activeSubTab === 'sources'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Senarai Dokumen & Sumber Rujukan
        </button>
      </div>

      {/* 1. SUB-TAB: MATRIKS HUKUM PENGGUNAAN DANA */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-6">
          {/* Quick Summary Cards on 3 Funds */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tabung Am */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Tabung Am (Tabung Umum)
                </span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Sifat: Infaq Mutlak / Umum
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Wang yang disumbang tanpa ikatan syarat khusus (contoh: tabung jumaat bergerak, tabung am surau).
                </p>
              </div>
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl text-xs space-y-1.5 border border-emerald-100 dark:border-emerald-900">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Untuk Pembangunan? <strong>Boleh / Harus</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Untuk Kenduri / Jamuan? <strong>Boleh secara berhemah</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Bil Utiliti & Elaun? <strong>Fungsi Utama</strong></span>
                </div>
              </div>
            </div>

            {/* Tabung Pembangunan */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/60 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Tabung Pembangunan
                </span>
                <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 rounded-xl">
                  <Hammer className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Sifat: Infaq / Wakaf Bersyarat Khusus
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Diniatkan oleh penderma khusus untuk binaan fizikal, baik pulih struktur, dan aset kekal.
                </p>
              </div>
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl text-xs space-y-1.5 border border-amber-100 dark:border-amber-900">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Struktur & Fasiliti? <strong>Fungsi Utama (Wajib)</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-bold">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Untuk Kenduri / Jamuan? <strong>TIDAK BOLEH (HARAM)</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-semibold">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Bil Utiliti & Elaun? <strong>Tidak Boleh</strong></span>
                </div>
              </div>
            </div>

            {/* Dana Khas */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-purple-200 dark:border-purple-800/60 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">
                  Dana Khas (Amanah Khusus)
                </span>
                <div className="p-2 bg-purple-50 dark:bg-purple-500/10 text-purple-700 rounded-xl">
                  <HeartHandshake className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Sifat: Amanah Asnaf / Projek Khusus
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Contoh: Tabung Anak Yatim, Tabung Palestin/Bencana, Tabung Ihya Ramadan, Khairat Kematian.
                </p>
              </div>
              <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-xl text-xs space-y-1.5 border border-purple-100 dark:border-purple-900">
                <div className="flex items-center gap-1.5 text-purple-800 dark:text-purple-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Agihan 100% Sasaran? <strong>Wajib Diserah</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-semibold">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Untuk Operasi / Bil Surau? <strong>Dilarang Keras</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-semibold">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Untuk Kenduri Am? <strong>Tidak Boleh</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Kaedah Fiqh Callout */}
          <div className="bg-emerald-900 text-white p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-emerald-700 shadow-sm">
            <div className="space-y-1">
              <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
                Prinsip Fiqh Asasi Pengurusan Tabung Masjid
              </div>
              <div className="text-lg sm:text-xl font-bold font-serif italic text-emerald-100">
                « شَرْطُ الْوَاقِفِ كَنَصِّ الشَّارِعِ »
              </div>
              <div className="text-xs text-emerald-200">
                <em>&quot;Syarat pewakaf (atau niat penyumbang pada label tabung) adalah mengikat seperti nas syarak.&quot;</em>
                <br />
                (Imam al-Suyuti, <em>Al-Asybah wa al-Naza&apos;ir</em>; Ibn Nujaim, <em>Al-Bahr ar-Ra&apos;iq</em>)
              </div>
            </div>
            <div className="text-xs bg-black/20 p-3 rounded-xl border border-white/10 max-w-sm">
              <strong>Huraian Fatwa:</strong> Apabila orang ramai menderma ke dalam kotak bertulis &quot;Tabung Pembangunan&quot;, wang itu haram dialihkan untuk tujuan selain pembangunan fizikal tanpa kebenaran pihak berkuasa agama.
            </div>
          </div>

          {/* Detailed Matrix Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Jadual Matriks Perbelanjaan Mengikut Ketetapan Garis Panduan
                </h3>
                <p className="text-xs text-slate-500">
                  Panduan status keharusan perbelanjaan mengikut kategori dana rasmi
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-4 w-1/3">Tujuan / Jenis Perbelanjaan</th>
                    <th className="p-4 w-1/5 text-emerald-800 dark:text-emerald-400">Tabung Am</th>
                    <th className="p-4 w-1/5 text-amber-800 dark:text-amber-400">Tabung Pembangunan</th>
                    <th className="p-4 w-1/5 text-purple-800 dark:text-purple-400">Dana Khas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expenseTypes.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4 align-top">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</div>
                      </td>

                      {/* Tabung Am */}
                      <td className="p-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full ${
                            item.tabungAm.status === 'allowed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                          }`}
                        >
                          {item.tabungAm.status === 'allowed' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          {item.tabungAm.label}
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-tight">
                          {item.tabungAm.details}
                        </p>
                      </td>

                      {/* Tabung Pembangunan */}
                      <td className="p-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full ${
                            item.tabungPembangunan.status === 'allowed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                          }`}
                        >
                          {item.tabungPembangunan.status === 'allowed' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          {item.tabungPembangunan.label}
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-tight">
                          {item.tabungPembangunan.details}
                        </p>
                      </td>

                      {/* Dana Khas */}
                      <td className="p-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full ${
                            item.danaKhas.status === 'allowed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : item.danaKhas.status === 'conditional'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                          }`}
                        >
                          {item.danaKhas.status === 'allowed' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : item.danaKhas.status === 'conditional' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          {item.danaKhas.label}
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-tight">
                          {item.danaKhas.details}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUB-TAB: PENYEMAK KESESUAIAN PERBELANJAAN (INTERACTIVE CHECKER) */}
      {activeSubTab === 'checker' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Alat Semakan Kesesuaian Perbelanjaan Syarak
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Uji tujuan perbelanjaan yang ingin anda buat untuk mengetahui sama ada dibenarkan atau ditegah mengikut ketetapan Jabatan Agama Islam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            {/* Step 1: Choose Fund */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Pilih Kategori Tabung Yang Hendak Dikeluarkan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Tabung Am', 'Tabung Pembangunan', 'Dana Khas'] as const).map((fund) => (
                  <button
                    key={fund}
                    onClick={() => setSelectedCheckerFund(fund)}
                    className={`p-3 rounded-xl text-xs font-bold border text-center transition ${
                      selectedCheckerFund === fund
                        ? fund === 'Tabung Pembangunan'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : fund === 'Dana Khas'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {fund}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Choose Purpose */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Pilih Jenis Perbelanjaan
              </label>
              <select
                value={selectedExpensePurpose}
                onChange={(e) => setSelectedExpensePurpose(e.target.value)}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {expenseTypes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Banner */}
          {currentExpenseEvaluation && (
            <div
              className={`p-6 rounded-2xl border transition-all ${
                evaluationResult.status === 'allowed'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                  : evaluationResult.status === 'conditional'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl shrink-0 bg-white/80 dark:bg-black/20 shadow-sm">
                  {evaluationResult.status === 'allowed' ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  ) : evaluationResult.status === 'conditional' ? (
                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-rose-600" />
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-75">
                      Keputusan Hukum Syarak:
                    </span>
                    <span
                      className={`font-black text-sm px-3 py-1 rounded-full ${
                        evaluationResult.status === 'allowed'
                          ? 'bg-emerald-600 text-white'
                          : evaluationResult.status === 'conditional'
                          ? 'bg-amber-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {evaluationResult.label}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold">
                    Menggunakan dana <span className="underline">{selectedCheckerFund}</span> untuk{' '}
                    <span className="underline">{currentExpenseEvaluation.title}</span>
                  </h3>

                  <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                    {evaluationResult.details}
                  </p>

                  <div className="pt-2 text-[11px] opacity-75">
                    <strong>Rujukan Punca Kuasa:</strong> Garis Panduan Kewangan Masjid JAIS (Bil. 6/2023), Garis Panduan Pengurusan Kewangan Masjid JHEAINS Sabah / MUIS, Garis Panduan Pengurusan Masjid & Surau Sarawak 2024 (MIS/JAIS), JAKIM (2021), serta Fatwa Pejabat Mufti WP / Sabah / Selangor.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Action to record expense if appropriate */}
          {onNavigateToExpense && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={onNavigateToExpense}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-sm"
              >
                <span>Buka Borang Rekod Duit Keluar</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. SUB-TAB: TATACARA PENGENDALIAN WANG TUNAI JAIS/JHEAINS/MIS SARAWAK/JAKIM */}
      {activeSubTab === 'tatacara' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Pembukaan & Kiraan Tabung */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    1. Tatacara Pembukaan & Kiraan Tabung
                  </h3>
                  <p className="text-xs text-slate-500">Kawalan dalaman kutipan tunai jemaah (Sabah, Sarawak & Semenanjung)</p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Sekurang-kurangnya 2 atau 3 Saksi:</strong> Tabung (khasnya Kutipan Jumaat) wajib dibuka dan dikira bersama oleh sekurang-kurangnya 2 orang pegawai/AJK (cth: Bendahari, Setiausaha, atau Siak).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Borang Kiraan Tabung:</strong> Pecahan duit kertas (RM100, RM50, RM20, RM10, RM5, RM1) dan syiling mesti dicatatkan dalam borang kiraan dan ditandatangani oleh semua saksi.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Segera Dibankkan:</strong> Wang kutipan mesti dimasukkan ke akaun bank berdaftar rasmi surau (cth: Agro Bank / Bank Islam) selewat-lewatnya pada hari bekerja berikutnya. Dilarang menyimpan tunai kutipan di rumah AJK.
                  </span>
                </li>
              </ul>
            </div>

            {/* Box 2: Had Kuasa Berbelanja */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-100 text-sky-800 rounded-xl">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    2. Had Kuasa Meluluskan Perbelanjaan
                  </h3>
                  <p className="text-xs text-slate-500">Ketetapan perolehan mengikut JHEAINS / MIS Sarawak / JAIS / JAWI</p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Wang Runcit (Petty Cash):</strong> Dihadkan kepada siling kecil (cth: RM300 - RM500) bagi pembelian segera dengan resit/invois sah.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Perbelanjaan Operasi Biasa:</strong> Diluluskan oleh Pengerusi dan Bendahari mengikut belanjawan tahunan yang diluluskan dalam Mesyuarat Agung.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Projek Baik Pulih / Pembinaan Melebihi Had:</strong> Bagi projek melebihi had ambang (cth: melebihi RM10,000), wajib mendapat sebut harga, kelulusan mesyuarat jawatankuasa penuh, serta kebenaran bertulis Pegawai Tadbir Agama Bahagian/Daerah (PTAD JHEAINS Sabah / PAID Semenanjung / JAIS Sarawak / TBS) sebelum kerja dimulakan.
                  </span>
                </li>
              </ul>
            </div>

            {/* Box 3: Larangan Keras Pentadbiran */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-100 text-rose-800 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    3. Larangan Keras Pentadbiran Kewangan
                  </h3>
                  <p className="text-xs text-slate-500">Perkara yang ditegah di sisi undang-undang Islam</p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-rose-900 dark:text-rose-300">
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Cek Kosong (Blank Cheque):</strong> Ditegah sama sekali menandatangani cek kosong tanpa nama penerima dan jumlah yang sah.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Pinjaman Peribadi:</strong> Dilarang memberi atau meminjamkan duit tabung masjid kepada mana-mana AJK atau individu.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Kutipan Tanpa Kebenaran MUIS / MIS / MAIS:</strong> Mengutip derma luar atau membenarkan pihak ketiga mengutip di kawasan surau tanpa surat kebenaran rasmi Majlis Ugama Islam Negeri (MUIS di Sabah, MIS di Sarawak, MAIS di Selangor, dll) adalah satu kesalahan jenayah syariah.
                  </span>
                </li>
              </ul>
            </div>

            {/* Box 4: Pengauditan & Ketelusan */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-800 rounded-xl">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    4. Pengauditan & Paparan Notis Kariah
                  </h3>
                  <p className="text-xs text-slate-500">Ketelusan di hadapan jemaah dan Jabatan Agama Islam Negeri</p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Penyata Kewangan Bulanan:</strong> Bendahari wajib menyediakan penyata kewangan setiap bulan dan menampalnya di papan kenyataan surau untuk semakan anak kariah.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Audit Dalaman Tahunan:</strong> Sekurang-kurangnya 2 orang Pemeriksa Kira-Kira (Juru Audit Dalaman) yang dilantik dalam Mesyuarat Agung Tahunan wajib mengaudit buku tunai dan baucar sebelum dihantar ke Jabatan Hal Ehwal Agama Islam Negeri (JHEAINS Daerah di Sabah / JAIS Bahagian di Sarawak / PAID).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Simpanan Rekod & Resit:</strong> Semua resit, bil, baucar pembayaran, dan penyata bank mesti disimpan sekurang-kurangnya 7 tahun bagi tujuan semakan audit Jabatan Agama.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB: SOAL JAWAB LAZIM (FAQ) */}
      {activeSubTab === 'faq' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                Soal Jawab Lazim Pengurusan Tabung Surau / Masjid
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rujukan jawapan berdasarkan keputusan fatwa dan enakmen rasmi
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Cari soalan atau topik..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tiada soalan ditemui untuk carian &quot;{faqSearch}&quot;.
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="py-4">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left flex items-start justify-between gap-4 font-bold text-slate-900 dark:text-white text-sm hover:text-emerald-700 dark:hover:text-emerald-400 transition"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-emerald-600 text-xs font-black">Q{idx + 1}.</span>
                        {faq.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 shrink-0 text-slate-400 mt-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 shrink-0 text-slate-400 mt-1" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-700/60">
                        <p>{faq.a}</p>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-700">
                          📌 <strong>Sumber / Hujah:</strong> {faq.source}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5. SUB-TAB: SENARAI DOKUMEN & SUMBER RUJUKAN */}
      {activeSubTab === 'sources' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Senarai Dokumen Rasmi & Sumber Rujukan Fatwa
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Panduan dalam sistem ini dipetik terus daripada sumber autoriti agama Islam yang sah di Malaysia:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* JHEAINS / MUIS SABAH */}
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                  Sabah
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  JHEAINS & Majlis Ugama Islam Sabah (MUIS)
                </span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                <li>
                  <strong>Enakmen Majlis Ugama Islam Sabah 2004:</strong> Peruntukan undang-undang hal ehwal pentadbiran masjid, surau, baitulmal dan amanah wakaf negeri Sabah.
                </li>
                <li>
                  <strong>Garis Panduan Pentadbiran Masjid dan Surau JHEAINS:</strong> Tatacara pendaftaran surau berdaftar (nombor rujukan cth: JHEAINS:BPWD), pembukaan akaun bank rasmi (cth: Agro Bank / Bank Islam), dan penandatangan berdaftar (Pengerusi & Bendahari).
                </li>
                <li>
                  <strong>Pekeliling Kewangan & Kursus Pengurusan JHEAINS/MUIS:</strong> Kewajipan pembukaan tabung Jumaat bersama saksi, larangan menyimpan tunai di kediaman AJK, penyata bulanan kariah, serta audit dalaman sebelum dihantar ke Pegawai Tadbir Agama Daerah (PTAD).
                </li>
                <li>
                  <strong>Bahagian Zakat & Baitulmal MUIS:</strong> Prosedur pengurusan bantuan kemudahan surau, dana khas asnaf, dan pengasingan amanah projek surau.
                </li>
              </ul>
            </div>

            {/* JAIS / MIS SARAWAK */}
            <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/30 dark:bg-teal-950/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-600 text-white">
                  Sarawak
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  Majlis Islam Sarawak (MIS) & JAIS
                </span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                <li>
                  <strong>Ordinan Majlis Islam Sarawak 2001:</strong> Bahagian V berkenaan kuasa pengurusan masjid, surau, wakaf, dan tadbir urus amanah di negeri Sarawak.
                </li>
                <li>
                  <strong>Garis Panduan Pengurusan Masjid dan Surau Sarawak 2024:</strong> Panduan rasmi terkini pentadbiran organisasi, tatakelola kewangan, dan digitalisasi akaun masjid/surau Majlis Islam Sarawak.
                </li>
                <li>
                  <strong>Kaedah Pengurusan Masjid Dan Surau - Prosedur Kewangan (MIS):</strong> Prosedur pembukaan peti tabung dengan borang pecahan tunai berbilang saksi, had kuasa perbelanjaan, dan penyediaan penyata berkala kepada Bahagian Pentadbiran & Kewangan JAIS.
                </li>
                <li>
                  <strong>Tabung Baitulmal Sarawak (TBS):</strong> Garis panduan kelayakan dan audit bagi skim bantuan pembinaan dan penyenggaraan surau berdaftar JAIS.
                </li>
              </ul>
            </div>

            {/* JAIS / MAIS */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Selangor
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  Jabatan Agama Islam Selangor (JAIS) / MAIS
                </span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                <li>Buku Garis Panduan Pengurusan Kewangan, Perolehan dan Aset Masjid dan Surau Negeri Selangor (Diluluskan MAIS Bil. 6/2023 pada 28 Nov 2023).</li>
                <li>Enakmen Pentadbiran Agama Islam (Negeri Selangor) 2003 & Peraturan-Peraturan Masjid dan Surau.</li>
                <li>Keputusan Jawatankuasa Fatwa Negeri Selangor: Penggunaan Duit Tabung Masjid.</li>
              </ul>
            </div>

            {/* JAWI / MAIWP */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                  Wilayah Persekutuan
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  JAWI, MAIWP & Pejabat Mufti WP
                </span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                <li>Garis Panduan MAIWP Bagi Pegawai Masjid di Wilayah Persekutuan (Panduan 8: Pengurusan Kewangan).</li>
                <li>Garis Panduan Pentadbiran Undang-Undang Islam Wilayah Persekutuan (Jawatankuasa Surau).</li>
                <li>Irsyad Al-Fatwa Siri PMWP: Hukum Menggunakan Duit Tabung Masjid & Kaedah Syarat Pewakaf.</li>
              </ul>
            </div>

            {/* JAKIM */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Peringkat Persekutuan
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  Jabatan Kemajuan Islam Malaysia (JAKIM)
                </span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                <li>Garis Panduan Penyelarasan Pengurusan Kewangan Masjid dan Surau Seluruh Malaysia (Diterbitkan 28 September 2021).</li>
                <li>Piawaian Tadbir Urus Masjid Malaysia.</li>
              </ul>
            </div>

            {/* Jabatan Mufti Negeri-Negeri Lain */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  Fatwa Negeri
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  Jabatan Mufti Pulau Pinang, Pahang & N. Sembilan
                </span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                <li>Fatwa Mufti Pulau Pinang: Penegasan Wang Tabung Pembangunan khusus untuk pembangunan semata-mata, haram digunakan untuk utiliti/elaun.</li>
                <li>Fatwa Mufti Pahang: Hukum Penggunaan Wang Tabung Masjid Untuk Jamuan & Pengharaman Tajaan Umrah AJK.</li>
                <li>Fatwa Mufti Kerajaan Negeri Sembilan: Penggunaan Tabung Kebajikan/Am Untuk Maslahah Anak Kariah.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
