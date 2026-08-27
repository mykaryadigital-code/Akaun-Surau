import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';

const MosqueIcon = ({ className }: { className?: string }) => (

  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 2v20" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

interface LoginProps {
  onLoginSuccess: () => void;
  orgName: string;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, orgName }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    setResetMessage('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider);
      onLoginSuccess();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      const errMsg = err?.message || '';
      const errCode = err?.code || '';

      if (errCode === 'auth/popup-closed-by-user' || errMsg.includes('closed-by-user')) {
        setError('Tetingkap log masuk Google telah ditutup sebelum selesai.');
      } else if (errCode === 'auth/cancelled-popup-request') {
        setError('Permintaan log masuk Google telah dibatalkan.');
      } else if (errCode === 'auth/unauthorized-domain' || errMsg.includes('unauthorized-domain')) {
        setError('Domain akaun-surau.vercel.app belum ditambah dalam Authorized Domains di Firebase Console.');
      } else if (errMsg.includes('closing') || errMsg.includes('hidden') || errMsg.includes('IndexedDB') || errCode === 'auth/popup-blocked') {
        setError('Sesi pelayar telefon ditutup sementara. Sila tekan "Lupa Kata Laluan" di bawah untuk menggunakan log masuk E-mel.');
      } else {
        setError(err.message || 'Ralat log masuk dengan Google. Sila cuba log masuk E-mel di bawah.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Log masuk E-mel/Kata Laluan belum diaktifkan di Firebase Console.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('E-mel atau kata laluan tidak sah / akaun tidak dijumpai.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Alamat e-mel ini telah didaftarkan. Sila log masuk.');
      } else if (err.code === 'auth/weak-password') {
        setError('Kata laluan terlalu pendek (minimum 6 aksara).');
      } else if (err.code === 'auth/invalid-email') {
        setError('Format e-mel tidak sah.');
      } else {
        setError(err.message || 'Ralat pengesahan');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Sila masukkan alamat e-mel anda dahulu di ruangan atas untuk tetapkan semula kata laluan.');
      return;
    }
    setError('');
    setResetMessage('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage(`Pautan tetapan semula kata laluan telah dihantar ke ${email}. Sila semak peti masuk anda.`);
    } catch (err: any) {
      console.error('Reset Password Error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Alamat e-mel ini tidak dijumpai dalam pangkalan data.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Format e-mel tidak sah.');
      } else {
        setError(err.message || 'Ralat semasa menghantar e-mel tetapan semula.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4">
            <img 
              src="/ikon.png" 
              alt="Logo Masjid" 
              className="w-full h-full object-contain drop-shadow-sm rounded-[24px]"
              onError={(e) => {
                // Fallback to a styled div if image is not yet uploaded to public folder
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-slate-900 text-white rounded-[24px] flex items-center justify-center shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>';
              }}
            />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Log Masuk Masjid/Surau</h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Sistem Pengurusan Kewangan</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl shadow-sm border border-slate-200 transition flex items-center justify-center gap-3 mb-6"
        >
          <GoogleIcon className="w-5 h-5" />
          Teruskan dengan Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Atau E-mel</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm text-center font-medium">
              {error}
            </div>
          )}
          {resetMessage && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm text-center font-medium">
              {resetMessage}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Alamat E-mel
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-slate-50 focus:bg-white text-slate-900"
              placeholder="admin@surau.com"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Kata Laluan
              </label>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Lupa Kata Laluan?
                </button>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-slate-50 focus:bg-white text-slate-900"
              placeholder="••••••••"
              required={!resetMessage}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition mt-2 disabled:opacity-70"
          >
            {loading ? 'Sila Tunggu...' : (isRegistering ? 'Daftar Akaun Baru' : 'Log Masuk E-mel')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            {isRegistering ? 'Sudah ada akaun? Log masuk' : 'Belum ada akaun? Daftar di sini'}
          </button>
        </div>
      </div>
    </div>
  );
};
