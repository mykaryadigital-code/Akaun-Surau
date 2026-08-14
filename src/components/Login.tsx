import React, { useState } from 'react';

const MosqueIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M2 21h20" />
    <path d="M12 2v2" />
    <path d="M12 4a5 5 0 0 1 5 5v4H7V9a5 5 0 0 1 5-5z" />
    <path d="M7 13v8" />
    <path d="M17 13v8" />
    <path d="M12 15a3 3 0 0 0-3 3v3h6v-3a3 3 0 0 0-3-3z" />
    <path d="M4 21V9l-1-2h2l-1 2" />
    <path d="M20 21V9l-1-2h2l-1 2" />
  </svg>
);

interface LoginProps {
  onLoginSuccess: () => void;
  orgName: string;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, orgName }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin2026') {
      onLoginSuccess();
    } else {
      setError('Nama pengguna atau kata laluan tidak sah');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MosqueIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Log Masuk</h2>
          <p className="text-slate-500 text-sm mt-2">{orgName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm text-center font-medium">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nama Pengguna
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-slate-50 focus:bg-white text-slate-900"
              placeholder="Masukkan nama pengguna"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Kata Laluan
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-slate-50 focus:bg-white text-slate-900"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition mt-4"
          >
            Log Masuk
          </button>
        </form>
      </div>
    </div>
  );
};
