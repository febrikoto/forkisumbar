import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Bell, ShieldAlert, Info } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  body: string;
  severity: 'Info' | 'Penting' | 'Darurat';
  timestamp: string;
}

export default function PengumumanView() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [severity, setSeverity] = useState<'Info' | 'Penting' | 'Darurat'>('Info');

  useEffect(() => {
    const saved = localStorage.getItem('karate_notices');
    if (saved) {
      setNotices(JSON.parse(saved));
    } else {
      const initial: Notice[] = [
        { id: '1', title: 'Pemanggilan Kumite -63kg Putra', body: 'Harap semua atlet kelas Kumite -63kg Putra senior segera bersiap di belakang Tatami 1.', severity: 'Penting', timestamp: '08:15' },
        { id: '2', title: 'Break Sesi Istirahat Siang', body: 'Pertandingan semua tatami dihentikan sementara pukul 12:00 - 13:00 untuk istirahat siang.', severity: 'Info', timestamp: '11:45' },
      ];
      setNotices(initial);
      localStorage.setItem('karate_notices', JSON.stringify(initial));
    }
  }, []);

  const saveNotices = (list: Notice[]) => {
    setNotices(list);
    localStorage.setItem('karate_notices', JSON.stringify(list));
  };

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return alert('Mohon lengkapi judul dan rincian pengumuman!');

    const timeString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const newNotice: Notice = {
      id: 'not_' + Math.random().toString(36).substr(2, 9),
      title,
      body,
      severity,
      timestamp: timeString
    };

    const updated = [newNotice, ...notices];
    saveNotices(updated);
    setTitle('');
    setBody('');
  };

  const handleDeleteNotice = (id: string) => {
    const updated = notices.filter(n => n.id !== id);
    saveNotices(updated);
  };

  return (
    <div className="space-y-6" id="pengumuman-panel">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Board Creation Form (Left column) */}
        <div className="lg:col-span-5 bg-slate-950/70 p-5 rounded-xl border border-slate-800 h-fit">
          <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5 border-b border-slate-850 pb-2 mb-4">
            <Megaphone className="text-rose-500 h-5 w-5 animate-pulse" /> Buat Pengumuman Siaran Baru
          </h3>

          <form onSubmit={handleAddNotice} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Judul Ringkas *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Contoh: Pemanggilan Tatami 2"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-650"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Kategori Kepentingan</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Info">Informasi Umum</option>
                <option value="Penting">Penting / Panggilan</option>
                <option value="Darurat">Darurat / Delay</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Rincian Detail Pengumuman *</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={3}
                placeholder="Tuliskan detail lokasi atau instruksi bagi dojo/atlet..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-650"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-505 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow shadow-indigo-950/40 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Pasang Pengumuman
            </button>
          </form>
        </div>

        {/* Live Notices Broadcast Board (Right column) */}
        <div className="lg:col-span-7 bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <Bell className="text-indigo-400 h-5 w-5" />
            Papan Siaran Digital Terkini (Live Feed Board)
          </h3>

          <div className="space-y-3">
            {notices.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">Belum ada pengumuman disiarkan hari ini.</p>
            ) : (
              notices.map(n => (
                <div 
                  key={n.id} 
                  className={`p-4 rounded-xl border flex gap-3.5 relative shadow-sm transition-all hover:scale-[1.005] ${
                    n.severity === 'Darurat'
                      ? 'bg-red-500/5 text-red-100 border-red-550/20'
                      : n.severity === 'Penting'
                      ? 'bg-amber-500/5 text-amber-100 border-amber-550/20'
                      : 'bg-indigo-500/5 text-indigo-100 border-indigo-550/15'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {n.severity === 'Darurat' ? (
                      <ShieldAlert className="h-5 w-5 text-red-500" />
                    ) : (
                      <Info className={`h-5 w-5 ${n.severity === 'Penting' ? 'text-amber-500' : 'text-indigo-400'}`} />
                    )}
                  </div>
                  <div className="space-y-1 pr-8">
                    <p className="text-xs font-black uppercase tracking-wider">{n.title}</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{n.body}</p>
                    <span className="text-[10px] text-slate-500 font-mono inline-block mt-1">🕒 Disiarkan pukul {n.timestamp}</span>
                  </div>

                  {/* Delete btn */}
                  <button
                    onClick={() => handleDeleteNotice(n.id)}
                    className="absolute top-4 right-4 p-1 text-slate-500 hover:text-rose-400 rounded"
                    title="Remove notice"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
