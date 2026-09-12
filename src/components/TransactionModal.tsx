import React, { useState, useEffect, useMemo } from 'react';
import { AppSettings, Transaction, TransactionType, PaymentMethod, FundCategory, AuditLogEntry } from '../types';
import { 
  PlusCircle, 
  MinusCircle, 
  CheckCircle,
  X,
  AlertTriangle,
  Sparkles,
  Edit3,
  RotateCcw,
  Scale
} from 'lucide-react';
import { 
  INCOME_SOURCES, 
  PURPOSE_EXAMPLES, 
  determineFundCategory,
  getTransactionFundCategory
} from '../utils/fundCategory';

const generateRefNo = (type: TransactionType, dateStr: string) => {
  const dateObj = new Date(dateStr);
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${type === 'IN' ? 'IN' : 'OUT'}-${yyyy}${mm}-${randomStr}`;
};

interface TransactionModalProps {
  settings: AppSettings;
  onAddTransaction?: (tx: Transaction) => void;
  onUpdateTransaction?: (tx: Transaction) => void;
  initialTypeModal: 'IN' | 'OUT' | null;
  onCloseInitialModal: () => void;
  editingTx?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  settings,
  onAddTransaction,
  onUpdateTransaction,
  initialTypeModal,
  onCloseInitialModal,
  editingTx
}) => {
  const [formType, setFormType] = useState<TransactionType>('IN');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formRefNo, setFormRefNo] = useState('');
  
  // Duit Masuk specific states
  const [formSource, setFormSource] = useState<string>(INCOME_SOURCES[0]);
  const [hasSpecificPurpose, setHasSpecificPurpose] = useState<boolean>(false);
  const [formPurpose, setFormPurpose] = useState<string>('');
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
  const [manualFundCategory, setManualFundCategory] = useState<FundCategory>('Tabung Am');

  // Duit Keluar category
  const [formExpenseCategory, setFormExpenseCategory] = useState<string>(settings.categoriesOut[0] || 'Lain-lain Perbelanjaan');

  // Common fields
  const [formAmount, setFormAmount] = useState('');
  const [formMethod, setFormMethod] = useState<PaymentMethod>('Tunai');
  const [formParty, setFormParty] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formAttachment, setFormAttachment] = useState<string | null>(null);

  // Auto-calculated category for Duit Masuk based on user specifications
  const autoDetermination = useMemo(() => {
    return determineFundCategory(formSource, hasSpecificPurpose, formPurpose);
  }, [formSource, hasSpecificPurpose, formPurpose]);

  const activeFundCategory: FundCategory = isManualOverride ? manualFundCategory : autoDetermination.category;
  const isOverriddenFromAuto = isManualOverride && manualFundCategory !== autoDetermination.category;

  // Check if source can have specific purpose option
  const canHaveSpecificPurpose = useMemo(() => {
    return [
      'Sumbangan YB / Kerajaan',
      'Sumbangan Individu',
      'Sumbangan Syarikat / NGO',
      'Sumbangan Orang Ramai',
      'Lain-lain',
      'Kutipan Khas',
    ].includes(formSource);
  }, [formSource]);

  useEffect(() => {
    if (editingTx) {
      setFormType(editingTx.type);
      setFormDate(editingTx.date);
      setFormRefNo(editingTx.refNo);
      setFormAmount(editingTx.amount.toString());
      setFormMethod(editingTx.paymentMethod);
      setFormParty(editingTx.partyName);
      setFormNotes(editingTx.notes);
      setFormAttachment(editingTx.attachmentUrl || null);

      if (editingTx.type === 'IN') {
        const resolvedFund = getTransactionFundCategory(editingTx);
        setFormSource(editingTx.source || INCOME_SOURCES[0]);
        setHasSpecificPurpose(!!editingTx.hasSpecificPurpose);
        setFormPurpose(editingTx.purpose || '');
        if (editingTx.isCategoryOverridden) {
          setIsManualOverride(true);
          setManualFundCategory(resolvedFund);
        } else {
          setIsManualOverride(false);
          setManualFundCategory(resolvedFund);
        }
      } else {
        setFormExpenseCategory(editingTx.category || settings.categoriesOut[0] || 'Lain-lain Perbelanjaan');
      }
    } else if (initialTypeModal) {
      handleFormTypeChange(initialTypeModal);
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormAmount('');
      setFormParty('');
      setFormNotes('');
      setFormAttachment(null);
      setFormSource(INCOME_SOURCES[0]);
      setHasSpecificPurpose(false);
      setFormPurpose('');
      setIsManualOverride(false);
      setManualFundCategory('Tabung Am');
    }
  }, [editingTx, initialTypeModal]);

  // When source changes, automatically reset or adjust specific purpose
  const handleSourceChange = (newSource: string) => {
    setFormSource(newSource);
    if (newSource === 'Kutipan Khas') {
      setHasSpecificPurpose(true);
    } else if (newSource === 'Sumbangan Pembangunan' || newSource === 'Kutipan Pembangunan' || newSource === 'Duit Tabung Surau' || newSource === 'Kutipan Jumaat') {
      setHasSpecificPurpose(false);
      setFormPurpose('');
    }
    // Reset manual override if user changes source so they get the fresh intelligent suggestion
    setIsManualOverride(false);
  };

  const handleFormTypeChange = (type: TransactionType) => {
    setFormType(type);
    setFormRefNo(generateRefNo(type, formDate));
  };

  const handleFormDateChange = (dateStr: string) => {
    setFormDate(dateStr);
    if (!editingTx) {
      setFormRefNo(generateRefNo(formType, dateStr));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || parseFloat(formAmount) <= 0) {
      alert('Sila masukkan jumlah wang yang sah.');
      return;
    }

    const txCategory = formType === 'IN' ? activeFundCategory : formExpenseCategory;
    const resolvedFundCategory = formType === 'IN' 
      ? activeFundCategory 
      : getTransactionFundCategory({ category: formExpenseCategory, type: 'OUT' } as any);

    // Audit log if overridden
    let existingLogs: AuditLogEntry[] = editingTx?.overrideAuditLog || [];
    if (formType === 'IN' && isOverriddenFromAuto) {
      const newAuditEntry: AuditLogEntry = {
        timestamp: Date.now(),
        date: new Date().toISOString(),
        action: 'MANUAL_OVERRIDE',
        originalSuggested: autoDetermination.category,
        chosenCategory: manualFundCategory,
        notes: `Bendahari menukar kategori dari cadangan sistem (${autoDetermination.category}) ke (${manualFundCategory}) untuk sumber "${formSource}".`
      };
      existingLogs = [...existingLogs, newAuditEntry];
    }

    const tx: Transaction = {
      id: editingTx ? editingTx.id : crypto.randomUUID(),
      refNo: formRefNo,
      date: formDate,
      type: formType,
      category: txCategory,
      fundCategory: resolvedFundCategory,
      source: formType === 'IN' ? formSource : undefined,
      hasSpecificPurpose: formType === 'IN' ? hasSpecificPurpose : undefined,
      purpose: formType === 'IN' && formPurpose ? formPurpose.trim() : undefined,
      fundName: formType === 'IN' && activeFundCategory === 'Dana Khas' ? (formPurpose.trim() || formSource) : undefined,
      isCategoryOverridden: formType === 'IN' ? isOverriddenFromAuto : false,
      overrideAuditLog: existingLogs.length > 0 ? existingLogs : undefined,
      amount: parseFloat(formAmount),
      paymentMethod: formMethod,
      partyName: formParty.trim(),
      notes: formNotes.trim(),
      attachmentUrl: formAttachment || undefined,
      createdAt: editingTx ? editingTx.createdAt : Date.now(),
    };

    if (editingTx && onUpdateTransaction) {
      onUpdateTransaction(tx);
    } else if (onAddTransaction) {
      onAddTransaction(tx);
    }

    onCloseInitialModal();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 700 * 1024) {
        alert('Saiz fail melebihi 700KB (Had Maksima Cloud Firestore). Sila pilih fail resit yang lebih kecil.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!initialTypeModal && !editingTx) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${formType === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {formType === 'IN' ? <PlusCircle className="w-5 h-5" /> : <MinusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingTx 
                  ? 'Kemaskini Transaksi' 
                  : formType === 'IN' 
                  ? 'Borang Duit Masuk (Penerimaan Sumbangan / Kutipan)' 
                  : 'Borang Duit Keluar (Perbelanjaan)'}
              </h3>
              <p className="text-xs text-slate-500">
                {formType === 'IN' 
                  ? 'Pilih sumber duit, sistem akan menentukan kategori tabung secara automatik' 
                  : 'Isi maklumat perbelanjaan surau dengan teliti'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onCloseInitialModal} 
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle (Masuk vs Keluar) */}
        {!editingTx && (
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => handleFormTypeChange('IN')}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                formType === 'IN' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" /> Duit Masuk (+IN)
            </button>
            <button
              type="button"
              onClick={() => handleFormTypeChange('OUT')}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                formType === 'OUT' 
                  ? 'bg-rose-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <MinusCircle className="w-4 h-4" /> Duit Keluar (-OUT)
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Metadata Row: Date & Ref No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tarikh Transaksi *</label>
              <input 
                type="date" 
                value={formDate} 
                onChange={(e) => handleFormDateChange(e.target.value)} 
                required 
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium" 
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">No Rujukan (Auto-Jana)</label>
              <input 
                type="text" 
                value={formRefNo} 
                onChange={(e) => setFormRefNo(e.target.value)} 
                required 
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold bg-slate-50 text-slate-800" 
              />
            </div>
          </div>

          {/* Duit Masuk Flow: Sumber Duit & Auto Category Determination */}
          {formType === 'IN' ? (
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3.5">
              
              {/* Field 1: Sumber Duit */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-800">
                    Sumber Duit *
                  </label>
                  <span className="text-[11px] text-slate-500">Pilih jenis kutipan / sumbangan</span>
                </div>
                <select 
                  value={formSource} 
                  onChange={(e) => handleSourceChange(e.target.value)} 
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 shadow-sm text-sm"
                >
                  {INCOME_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              {/* Automatic Category Indicator Label */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white border border-emerald-200/80 rounded-xl shadow-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-600 font-medium">Kategori Dana:</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wide ${
                    activeFundCategory === 'Tabung Pembangunan'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : activeFundCategory === 'Dana Khas'
                      ? 'bg-purple-100 text-purple-900 border border-purple-300'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    Kategori: {activeFundCategory}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  {!isManualOverride ? (
                    <>
                      <span className="text-emerald-700 italic">Diisi automatik oleh sistem</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualOverride(true);
                          setManualFundCategory(autoDetermination.category);
                        }}
                        className="text-slate-500 hover:text-slate-800 underline font-semibold flex items-center gap-1 ml-1"
                      >
                        <Edit3 className="w-3 h-3" /> Tukar Manual
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualOverride(false);
                      }}
                      className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200"
                    >
                      <RotateCcw className="w-3 h-3" /> Kembali ke Cadangan Sistem
                    </button>
                  )}
                </div>
              </div>

              {/* Manual Override Controls */}
              {isManualOverride && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-amber-950">Pilih Kategori Dana Secara Manual:</label>
                    <span className="text-[10px] text-amber-700 font-medium">(Mod Manual Diaktifkan)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Tabung Am', 'Tabung Pembangunan', 'Dana Khas'] as FundCategory[]).map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setManualFundCategory(cat)}
                        className={`py-2 px-3 rounded-lg font-bold text-xs transition border text-center ${
                          manualFundCategory === cat
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-100/50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Mandated Override Warning */}
                  {isOverriddenFromAuto && (
                    <div className="p-2.5 bg-amber-100/80 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-start gap-2 animate-in fade-in">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Amaran Perubahan Kategori:</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed">
                          Anda sedang mengubah kategori yang dicadangkan oleh sistem. Pastikan kategori baru sesuai dengan tujuan asal sumbangan.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Question: Adakah sumbangan ini mempunyai tujuan khusus? */}
              {canHaveSpecificPurpose && (
                <div className="pt-2 border-t border-slate-200 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <label className="font-semibold text-slate-800">
                      Adakah sumbangan ini mempunyai tujuan khusus?
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl w-fit">
                      <button
                        type="button"
                        onClick={() => {
                          setHasSpecificPurpose(false);
                          setFormPurpose('');
                        }}
                        className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                          !hasSpecificPurpose
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Tidak
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasSpecificPurpose(true)}
                        className={`px-3 py-1 rounded-lg font-bold transition text-xs ${
                          hasSpecificPurpose
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Ya
                      </button>
                    </div>
                  </div>

                  {/* If Ya: Tujuan Sumbangan & Quick Preset Chips */}
                  {hasSpecificPurpose && (
                    <div className="space-y-2 p-3 bg-white border border-slate-200 rounded-xl animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-800">
                          {formSource === 'Kutipan Khas' ? 'Nama Dana / Tujuan Khas *' : 'Tujuan Sumbangan *'}
                        </label>
                        <span className="text-[11px] text-slate-500">Pilih cadangan atau taip sendiri</span>
                      </div>

                      {/* Quick clickable preset pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {PURPOSE_EXAMPLES.map((ex) => (
                          <button
                            type="button"
                            key={ex}
                            onClick={() => setFormPurpose(ex === 'Lain-lain' ? '' : ex)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition border ${
                              formPurpose === ex
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {ex}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="cth: Baik pulih bumbung surau / Program Iftar Ramadan..."
                        value={formPurpose}
                        onChange={(e) => setFormPurpose(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500"
                      />

                      {/* Feedback guidance on suggested category */}
                      {formPurpose.trim() && (
                        <p className="text-[11px] text-slate-600">
                          {autoDetermination.category === 'Tabung Pembangunan' ? (
                            <span className="text-amber-700 font-semibold">
                              💡 Tujuan ini berkaitan pembangunan/fasiliti. Kategori dicadangkan: <strong>Tabung Pembangunan</strong>.
                            </span>
                          ) : (
                            <span className="text-purple-700 font-semibold">
                              💡 Tujuan ini khusus. Kategori dicadangkan: <strong>Dana Khas</strong> ({formPurpose}).
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            /* Duit Keluar flow */
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Perbelanjaan *</label>
              <select 
                value={formExpenseCategory} 
                onChange={(e) => setFormExpenseCategory(e.target.value)} 
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 font-semibold focus:ring-2 focus:ring-rose-500"
              >
                {settings.categoriesOut.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Contextual Islamic guidelines alerts */}
              {(formExpenseCategory.toLowerCase().includes('jamuan') || 
                formExpenseCategory.toLowerCase().includes('kenduri') || 
                formExpenseCategory.toLowerCase().includes('makan')) && (
                <div className="mt-2.5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-start gap-2">
                  <Scale className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Peringatan Syarak & Fatwa (JHEAINS Sabah, JAIS, PMWP):</span>
                    <span className="text-[11px] leading-relaxed">
                      Duit Tabung Pembangunan <strong>TIDAK BOLEH</strong> digunakan untuk kenduri/jamuan makan. Perbelanjaan kenduri hendaklah dibiayai daripada Tabung Am (secara berhemah tanpa israf) atau sumbangan khas jamuan.
                    </span>
                  </div>
                </div>
              )}

              {(formExpenseCategory.toLowerCase().includes('pembangunan') || 
                formExpenseCategory.toLowerCase().includes('baik pulih') || 
                formExpenseCategory.toLowerCase().includes('penyelenggaraan')) && (
                <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                  <Scale className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Panduan Syarak & Garis Panduan (JHEAINS / MIS Sarawak / JAIS):</span>
                    <span className="text-[11px] leading-relaxed">
                      Boleh dibiayai menggunakan Tabung Pembangunan atau Tabung Am (dengan kelulusan mesyuarat AJK). Sila patuhi had sebut harga dan kelulusan Pegawai Tadbir Agama Bahagian/Daerah (PTAD/PAID) jika melebihi had kuasa negeri.
                    </span>
                  </div>
                </div>
              )}

              {(formExpenseCategory.toLowerCase().includes('kebajikan') || 
                formExpenseCategory.toLowerCase().includes('asnaf') || 
                formExpenseCategory.toLowerCase().includes('anak yatim')) && (
                <div className="mt-2.5 p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs flex items-start gap-2">
                  <Scale className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Panduan Dana Khas Kebajikan:</span>
                    <span className="text-[11px] leading-relaxed">
                      Wang sumbangan anak yatim / fakir miskin wajib disalurkan 100% kepada hak penerima dan tidak boleh dipotong untuk bil atau operasi am surau.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Amount & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Jumlah (RM) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-slate-500 text-sm">RM</span>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0.01"
                  placeholder="0.00" 
                  value={formAmount} 
                  onChange={(e) => setFormAmount(e.target.value)} 
                  required 
                  className="w-full pl-11 pr-3 py-2.5 border border-slate-300 rounded-xl font-black text-slate-900 text-base focus:ring-2 focus:ring-emerald-500" 
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kaedah Bayaran</label>
              <select 
                value={formMethod} 
                onChange={(e) => setFormMethod(e.target.value as PaymentMethod)} 
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Tunai">Tunai</option>
                <option value="Pindahan Bank">Pindahan Bank</option>
                <option value="QR Pay">QR Pay</option>
                <option value="Cek">Cek</option>
              </select>
            </div>
          </div>

          {/* Party Name (Optional) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {formType === 'IN' ? 'Nama Pembayar / Penyumbang (Opsional)' : 'Nama Penerima Bayaran / Syarikat (Opsional)'}
            </label>
            <input 
              type="text" 
              placeholder={formType === 'IN' ? 'cth: Haji Ahmad / Jemaah Solat' : 'cth: Tenaga Nasional Berhad'} 
              value={formParty} 
              onChange={(e) => setFormParty(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500" 
            />
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan (Opsional)</label>
            <textarea 
              rows={2} 
              placeholder="Catatan tambahan mengenai transaksi ini..." 
              value={formNotes} 
              onChange={(e) => setFormNotes(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500" 
            />
          </div>

          {/* Attachment (Optional) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bukti / Resit / Gambar Dokumen (Opsional)</label>
            <input 
              type="file" 
              accept="image/*,.pdf" 
              onChange={handleFileUpload} 
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer" 
            />
            {formAttachment && (
              <div className="mt-2 flex items-center gap-2 text-emerald-700 font-semibold text-[11px]">
                <CheckCircle className="w-4 h-4" /> Fail resit telah dimuat naik
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onCloseInitialModal} 
              className="px-4 py-2.5 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className={`px-6 py-2.5 font-extrabold text-white rounded-xl shadow-sm transition flex items-center gap-2 ${
                formType === 'IN' 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {editingTx 
                ? 'Simpan Perubahan' 
                : formType === 'IN' 
                ? 'Simpan Duit Masuk' 
                : 'Simpan Duit Keluar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
