import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, ShieldCheck } from 'lucide-react';

interface TournamentSettings {
  title: string;
  venue: string;
  date: string;
  tatamiCount: number;
  matchDurationSec: number;
  theme?: string;
}

interface PengaturanViewProps {
  onSettingsChange?: () => void;
}

export default function PengaturanView({ onSettingsChange }: PengaturanViewProps) {
  const [settings, setSettings] = useState<TournamentSettings>({
    title: 'Kejurda Karate FORKI 2026 Sumbar',
    venue: 'Kab. Pasaman - Sumbar',
    date: '26 s.d 28 Juni 2026',
    tatamiCount: 2,
    matchDurationSec: 180, // 3 minutes standard senior
    theme: 'midnight',
  });

  const [feedback, setFeedback] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('karate_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Force upgrade old defaults to the new Kabupaten Pasaman Sumbar details
        if (parsed.venue === 'GOR Bulungan, Jakarta Selatan' || parsed.date === '03 - 04 Juni 2026' || !parsed.venue || parsed.title === 'FORKINDO Karate Championship 2026') {
          const upgraded = {
            title: 'Kejurda Karate FORKI 2026 Sumbar',
            venue: 'Kab. Pasaman - Sumbar',
            date: '26 s.d 28 Juni 2026',
            tatamiCount: parsed.tatamiCount || 2,
            matchDurationSec: parsed.matchDurationSec || 180,
            theme: parsed.theme || 'midnight'
          };
          setSettings(upgraded);
          localStorage.setItem('karate_settings', JSON.stringify(upgraded));
          if (onSettingsChange) onSettingsChange();
        } else {
          setSettings(prev => ({
            ...prev,
            ...parsed,
            theme: parsed.theme || 'midnight'
          }));
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      const initialSettings = {
        title: 'Kejurda Karate FORKI 2026 Sumbar',
        venue: 'Kab. Pasaman - Sumbar',
        date: '26 s.d 28 Juni 2026',
        tatamiCount: 2,
        matchDurationSec: 180,
        theme: 'midnight'
      };
      localStorage.setItem('karate_settings', JSON.stringify(initialSettings));
      if (onSettingsChange) onSettingsChange();
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('karate_settings', JSON.stringify(settings));
    
    // Quick custom title update in browser headers for visual fidelity
    document.title = settings.title;
    
    setFeedback(true);
    setTimeout(() => setFeedback(false), 3000);

    // Call callback to let header and main layout update theme instantly
    if (onSettingsChange) {
      onSettingsChange();
    }
  };

  return (
    <div className="space-y-6" id="pengaturan-panel">
      
      <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800 max-w-xl mx-auto">
        <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5 border-b border-slate-850 pb-2 mb-6">
          <Settings className="text-rose-500 h-5 w-5 rotate-45" /> Pengaturan Konfigurasi Turnamen
        </h3>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Nama / Judul Kejuaraan *</label>
            <input
              type="text"
              value={settings.title}
              onChange={e => setSettings({ ...settings, title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-650"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Lokasi Gedung / Venue *</label>
            <input
              type="text"
              value={settings.venue}
              onChange={e => setSettings({ ...settings, venue: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-650"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Waktu Pelaksanaan *</label>
            <input
              type="text"
              value={settings.date}
              onChange={e => setSettings({ ...settings, date: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-650"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Jumlah Arena Tatami</label>
              <select
                value={settings.tatamiCount}
                onChange={e => setSettings({ ...settings, tatamiCount: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
              >
                <option value={1}>1 Tatami</option>
                <option value={2}>2 Tatami</option>
                <option value="3">3 Tatami</option>
                <option value="4">4 Tatami</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Durasi Kumite (Detik)</label>
              <input
                type="number"
                value={settings.matchDurationSec}
                onChange={e => setSettings({ ...settings, matchDurationSec: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* TEAM / THEME SELECTION BLOCK */}
          <div className="border-t border-slate-800/80 pt-4">
            <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2.5">Tema Warna Aplikasi (Mood Mode)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
              {[
                { 
                  id: 'midnight', 
                  name: 'Midnight Shogun', 
                  desc: 'Slate & Rose-Indigo (Klasik Forkindo)',
                  colorPreview: 'from-rose-600 to-indigo-600',
                },
                { 
                  id: 'emerald', 
                  name: 'Emerald Sensei', 
                  desc: 'Deep Forest & Gold Accent (Tradisional Dojo)',
                  colorPreview: 'from-emerald-600 to-amber-500', 
                },
                { 
                  id: 'crimson', 
                  name: 'Crimson Bushido', 
                  desc: 'High Contrast Carbon & Red Heat (Intensitas)',
                  colorPreview: 'from-red-600 to-orange-500',
                },
                { 
                  id: 'frost', 
                  name: 'Frost Tatami', 
                  desc: 'Ocean Blue & Ice Athletics (Kejuaraan)',
                  colorPreview: 'from-sky-505 to-sky-700',
                }
              ].map(themeItem => {
                const isSelected = (settings.theme || 'midnight') === themeItem.id;
                return (
                  <button
                    key={themeItem.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, theme: themeItem.id })}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                      isSelected 
                        ? 'border-rose-500 bg-slate-900 ring-2 ring-rose-500/20' 
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-755 hover:bg-slate-955'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 justify-between">
                      <span className={`text-[11px] font-bold ${isSelected ? 'text-rose-400' : 'text-slate-300 group-hover:text-white'}`}>
                        {themeItem.name}
                      </span>
                      <div className={`h-2 w-5 rounded-full bg-gradient-to-r ${themeItem.colorPreview}`} />
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-normal">{themeItem.desc}</p>
                    {isSelected && (
                      <div className="absolute top-0 right-0 h-2 w-2 bg-rose-500 rounded-bl" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {feedback && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold rounded-lg text-center flex items-center justify-center gap-1.5 transition">
              <ShieldCheck className="h-4 w-4" /> Pengaturan &amp; Tema disimpan dengan sukses!
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-505 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow shadow-indigo-950/40 cursor-pointer"
          >
            <Save className="h-4 w-4" /> Simpan Konfigurasi
          </button>
        </form>
      </div>

    </div>
  );
}
