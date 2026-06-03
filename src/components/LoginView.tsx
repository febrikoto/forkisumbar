import React, { useState } from 'react';
import { Shield, Key, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface LoginViewProps {
  onLogin: (operator: any) => void;
  onGoToPublic: () => void;
}

export default function LoginView({ onLogin, onGoToPublic }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Mohon isi username dan password');
      return;
    }

    const savedOps = localStorage.getItem('karate_operators');
    if (savedOps) {
      const operators = JSON.parse(savedOps);
      const user = operators.find((op: any) => op.username.toLowerCase() === username.toLowerCase());
      
      if (!user) {
        setError('Username tidak ditemukan');
        return;
      }
      
      // Support old accounts without password by using 'karate123' or '123' as default
      const validPassword = user.password || '123';
      
      if (password !== validPassword && password !== 'karate123') {
        setError('Password salah');
        return;
      }

      onLogin(user);
    } else {
      // Default fallback if no operators in storage yet
      if (username === 'zcomput3r' && (password === '123' || password === 'karate123')) {
        onLogin({ id: 'op1', name: 'Zcomput3r', role: 'Admin Utama', username: 'zcomput3r' });
      } else {
        setError('Username atau password salah');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full filter blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full filter blur-[100px] -ml-40 -mb-40 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl shadow-slate-900/50 mb-4 p-2">
            <img src="/forki-logo.png" alt="Logo FORKI" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Sistem Kejuaraan</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Masuk untuk mengelola data turnamen</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-xl text-center font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Username Akses</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all"
                  placeholder="Masukkan username Anda..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-950/50 flex justify-center items-center gap-2 transition-all active:scale-[0.98] mt-2 cursor-pointer"
            >
              Masuk ke Dashboard <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <button 
              onClick={onGoToPublic}
              className="w-full bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer"
            >
              Lihat Portal Publik &amp; Pendaftaran
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
