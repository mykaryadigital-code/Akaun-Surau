import React, { useState, useEffect } from 'react';
import { AppSettings, Transaction, TransactionType, PaymentMethod } from '../types';
import { 
  PlusCircle, 
  MinusCircle, 
  CheckCircle,
  X 
} from 'lucide-react';

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
  const [formCategory, setFormCategory] = useState(settings.categoriesIn[0] || '');
  const [formAmount, setFormAmount] = useState('');
  const [formMethod, setFormMethod] = useState<PaymentMethod>('Tunai');
  const [formParty, setFormParty] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formAttachment, setFormAttachment] = useState<string | null>(null);

  useEffect(() => {
    if (editingTx) {
      setFormType(editingTx.type);
      setFormDate(editingTx.date);
      setFormRefNo(editingTx.refNo);
      setFormCategory(editingTx.category);
      setFormAmount(editingTx.amount.toString());
      setFormMethod(editingTx.paymentMethod);
      setFormParty(editingTx.partyName);
      setFormNotes(editingTx.notes);
      setFormAttachment(editingTx.attachmentUrl || null);
    } else if (initialTypeModal) {
      handleFormTypeChange(initialTypeModal);
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormAmount('');
      setFormParty('');
      setFormNotes('');
      setFormAttachment(null);
    }
  }, [editingTx, initialTypeModal]);

  const handleFormTypeChange = (type: TransactionType) => {
    setFormType(type);
    setFormCategory(type === 'IN' ? settings.categoriesIn[0] : settings.categoriesOut[0]);
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
    if (!formCategory || !formAmount) return;

    const tx: Transaction = {
      id: editingTx ? editingTx.id : crypto.randomUUID(),
      refNo: formRefNo,
      date: formDate,
      type: formType,
      category: formCategory,
      amount: parseFloat(formAmount),
      paymentMethod: formMethod,
      partyName: formParty,
      notes: formNotes,
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${formType === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {formType === 'IN' ? <PlusCircle className="w-5 h-5" /> : <MinusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingTx ? 'Kemaskini Transaksi' : formType === 'IN' ? 'Borang Duit Masuk (Penerimaan)' : 'Borang Duit Keluar (Perbelanjaan)'}
              </h3>
              <p className="text-xs text-slate-500">Isi maklumat kewangan dengan teliti untuk penjanaan resit & laporan</p>
            </div>
          </div>
          <button onClick={onCloseInitialModal} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!editingTx && (
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleFormTypeChange('IN')}
                className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${formType === 'IN' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                <PlusCircle className="w-4 h-4" /> Duit Masuk (+IN)
              </button>
              <button
                type="button"
                onClick={() => handleFormTypeChange('OUT')}
                className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${formType === 'OUT' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                <MinusCircle className="w-4 h-4" /> Duit Keluar (-OUT)
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">No Rujukan (Auto-Jana)</label>
              <input type="text" value={formRefNo} onChange={(e) => setFormRefNo(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold bg-slate-50 text-slate-800" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tarikh Transaksi</label>
              <input type="date" value={formDate} onChange={(e) => handleFormDateChange(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Penerimaan / Perbelanjaan</label>
              <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500">
                {(formType === 'IN' ? settings.categoriesIn : settings.categoriesOut).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jumlah (RM) *</label>
              <input type="number" step="0.01" placeholder="cth: 150.00" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kaedah Bayaran</label>
              <select value={formMethod} onChange={(e) => setFormMethod(e.target.value as PaymentMethod)} className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500">
                <option value="Pindahan Bank">Pindahan Bank</option>
                <option value="Tunai">Tunai</option>
                <option value="Cek">Cek</option>
                <option value="QR Pay">QR Pay</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {formType === 'IN' ? 'Nama Pembayar / Penyumbang' : 'Nama Penerima Bayaran / Syarikat'}
            </label>
            <input type="text" placeholder={formType === 'IN' ? 'cth: Haji Ahmad / Jemaah Solat' : 'cth: Tenaga Nasional Berhad'} value={formParty} onChange={(e) => setFormParty(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan / Penerangan Lanjut</label>
            <textarea rows={2} placeholder="Butiran mengenai transaksi ini..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lampiran Resit / Gambar Bukti (Opsional)</label>
            <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer" />
            {formAttachment && <div className="mt-2 flex items-center gap-2 text-emerald-700 font-semibold text-[11px]"><CheckCircle className="w-4 h-4" /> Fail resit telah dimuat naik</div>}
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onCloseInitialModal} className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Batal</button>
            <button type="submit" className={`px-5 py-2 font-bold text-white rounded-xl shadow-sm transition ${formType === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
              {editingTx ? 'Simpan Perubahan' : 'Rekod Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
