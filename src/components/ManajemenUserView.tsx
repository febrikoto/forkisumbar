import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Key, ShieldCheck } from 'lucide-react';

interface Operator {
  id: string;
  name: string;
  role: 'Admin Utama' | 'Arbitrator Juri' | 'Operator Timbang' | 'Panitia Arena';
  username: string;
  password?: string;
}

export default function ManajemenUserView() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Admin Utama' | 'Arbitrator Juri' | 'Operator Timbang' | 'Panitia Arena'>('Panitia Arena');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('karate_operators');
    if (saved) {
      setOperators(JSON.parse(saved));
    } else {
      const initial: Operator[] = [
        { id: 'op1', name: 'Zcomput3r (Panitia Pelaksana)', role: 'Admin Utama', username: 'zcomput3r', password: '123' },
        { id: 'op2', name: 'Ahmad Faisal', role: 'Operator Timbang', username: 'faisal_weight', password: '123' },
        { id: 'op3', name: 'Sensei Hendra', role: 'Arbitrator Juri', username: 'hendra_juri', password: '123' }
      ];
      setOperators(initial);
      localStorage.setItem('karate_operators', JSON.stringify(initial));
    }
  }, []);

  const saveOps = (list: Operator[]) => {
    setOperators(list);
    localStorage.setItem('karate_operators', JSON.stringify(list));
  };

  const handleAddOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return alert('Mohon isi nama lengkap dan nama pengguna operator!');

    const exists = operators.find(op => op.username.toLowerCase() === username.toLowerCase());
    if (exists) return alert('Username sudah terpakai!');

    const newOp: Operator = {
      id: 'op_' + Math.random().toString(36).substr(2, 9),
      name,
      role,
      username: username.toLowerCase().replace(/\s+/g, ''),
      password: password || 'karate123'
    };

    const updated = [...operators, newOp];
    saveOps(updated);

    setName('');
    setUsername('');
    setPassword('');
  };

  const handleDeleteOperator = (id: string) => {
    if (operators.length <= 1) return alert('Gugur dibatalkan! Harus menyisakan minimal satu operator admin!');
    const updated = operators.filter(o => o.id !== id);
    saveOps(updated);
  };

  return (
    <div className="space-y-6" id="operator-user-panel">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Registration form */}
        <div className="lg:col-span-5 bg-slate-950/70 p-5 rounded-xl border border-slate-800 h-fit">
          <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5 border-b border-slate-850 pb-2 mb-4">
            <Key className="text-rose-500 h-5 w-5" /> Daftarkan Operator / Akun Kerja
          </h3>

          <form onSubmit={handleAddOperator} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Nama Operator *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Contoh: Panita Budi"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-650"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Nama Pengguna (Username) *</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Contoh: budi_arena"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-650"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Kata Sandi (Password) *</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Biarkan kosong untuk default: karate123"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-650"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Peran Akses (Role)</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Panitia Arena">Panitia Arena</option>
                <option value="Operator Timbang">Operator Timbang</option>
                <option value="Arbitrator Juri">Arbitrator Juri</option>
                <option value="Admin Utama">Admin Utama</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-505 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow shadow-indigo-950/40 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Daftarkan Akun
            </button>
          </form>
        </div>

        {/* User list list column */}
        <div className="lg:col-span-7 bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <Users className="text-indigo-400 h-5 w-5" /> Akun Dengan Hak Akses Aktif
          </h3>

          <div className="divide-y divide-slate-900">
            {operators.map(op => (
              <div key={op.id} className="py-3 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-300 font-bold">
                    O
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">{op.name}</p>
                    <p className="text-[10px] text-indigo-400 mt-0.5 font-bold">@{op.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                    op.role === 'Admin Utama'
                      ? 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                      : op.role === 'Arbitrator Juri'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-indigo-500/10 text-indigo-450 border-indigo-500/20'
                  }`}>
                    {op.role}
                  </span>
                  <button
                    onClick={() => handleDeleteOperator(op.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition duration-150"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
