import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, CheckCircle2, Award, Zap } from 'lucide-react';

interface Referee {
  id: string;
  name: string;
  license: string; // e.g. "WKF Referee A", "WKF Judge B", "National Ref", "Asian Judge"
  location: 'Tatami 1' | 'Tatami 2' | 'Tatami 3' | 'Tatami 4' | 'Cadangan';
}

export default function ManajemenWasitView() {
  const [referees, setReferees] = useState<Referee[]>([]);
  const [name, setName] = useState('');
  const [license, setLicense] = useState('WKF Referee A');
  const [location, setLocation] = useState<'Tatami 1' | 'Tatami 2' | 'Tatami 3' | 'Tatami 4' | 'Cadangan'>('Tatami 1');

  // Hantei Simulator States
  const [j1, setJ1] = useState<'Aka' | 'Ao' | null>(null);
  const [j2, setJ2] = useState<'Aka' | 'Ao' | null>(null);
  const [j3, setJ3] = useState<'Aka' | 'Ao' | null>(null);
  const [j4, setJ4] = useState<'Aka' | 'Ao' | null>(null);
  const [simWinner, setSimWinner] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('karate_referees');
    if (saved) {
      setReferees(JSON.parse(saved));
    } else {
      const initial: Referee[] = [
        { id: 'ref1', name: 'Sensei Hendra Wijaya', license: 'WKF Referee A', location: 'Tatami 1' },
        { id: 'ref2', name: 'Sensei Maria Ulfa', license: 'WKF Judge B', location: 'Tatami 1' },
        { id: 'ref3', name: 'Sensei Agus Prasetyo', license: 'Asian Referee', location: 'Tatami 2' },
        { id: 'ref4', name: 'Sensei Linda Astuti', license: 'National Referee A', location: 'Tatami 3' },
        { id: 'ref5', name: 'Sensei Robert Sitorus', license: 'National Judge B', location: 'Cadangan' },
      ];
      setReferees(initial);
      localStorage.setItem('karate_referees', JSON.stringify(initial));
    }
  }, []);

  const saveRefs = (list: Referee[]) => {
    setReferees(list);
    localStorage.setItem('karate_referees', JSON.stringify(list));
  };

  const handleAddReferee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Mohon isi nama juri / wasit!');

    const newRef: Referee = {
      id: 'ref_' + Math.random().toString(36).substr(2, 9),
      name,
      license,
      location
    };

    const updated = [...referees, newRef];
    saveRefs(updated);
    setName('');
  };

  const handleDeleteReferee = (id: string) => {
    const updated = referees.filter(r => r.id !== id);
    saveRefs(updated);
  };

  const handleSimulateHantei = () => {
    const votes = [j1, j2, j3, j4].filter(v => v !== null);
    if (votes.length < 4) {
      return alert('Harap berikan suara untuk keempat juri (J-1 s/d J-4)!');
    }

    const akaCount = votes.filter(v => v === 'Aka').length;
    const aoCount = votes.filter(v => v === 'Ao').length;

    if (akaCount > aoCount) {
      setSimWinner('AKA (MERAH)');
    } else if (aoCount > akaCount) {
      setSimWinner('AO (BIRU)');
    } else {
      setSimWinner('SERI (Dua juri Aka, dua juri Ao - Diperlukan keputusan Wasit Kepala / Kansa)');
    }
  };

  return (
    <div className="space-y-6" id="wasit-panel">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Registration Form (Left) */}
        <div className="lg:col-span-5 bg-slate-950/70 p-5 rounded-xl border border-slate-800 h-fit">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="text-rose-500 h-5 w-5" />
            Pendaftaran Wasit / Dewan Juri
          </h3>

          <form onSubmit={handleAddReferee} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Nama Wasit/Juri *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Contoh: Sensei Donny Karat"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-600"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Lisensi/Gelar</label>
                <select
                  value={license}
                  onChange={e => setLicense(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="WKF Referee A">WKF Referee A</option>
                  <option value="WKF Judge B">WKF Judge B</option>
                  <option value="Asian Referee">Asian Referee</option>
                  <option value="Asian Judge">Asian Judge</option>
                  <option value="National Referee A">National Referee A</option>
                  <option value="National Judge B">National Judge B</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Lokasi Tatami</label>
                <select
                  value={location}
                  onChange={e => setLocation(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Tatami 1">Tatami 1</option>
                  <option value="Tatami 2">Tatami 2</option>
                  <option value="Tatami 3">Tatami 3</option>
                  <option value="Tatami 4">Tatami 4</option>
                  <option value="Cadangan">Cadangan</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-950/40 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Tambah Wasit
            </button>
          </form>

          {/* Interactive Hantei simulation panel */}
          <div className="mt-8 pt-6 border-t border-slate-850 space-y-4">
            <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Zap className="h-4 w-4 animate-bounce" /> Simulator Hantei (Keputusan Juri)
            </h4>
            <p className="text-[11px] text-slate-400">Gunakan simulator ini untuk membulatkan mufakat suara juri dalam keadaan skor seri.</p>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: 'Juri 1', getter: j1, setter: setJ1 },
                { label: 'Juri 2', getter: j2, setter: setJ2 },
                { label: 'Juri 3', getter: j3, setter: setJ3 },
                { label: 'Juri 4', getter: j4, setter: setJ4 },
              ].map((jury, idx) => (
                <div key={idx} className="bg-slate-900 p-2 border border-slate-850 rounded">
                  <p className="font-bold text-slate-300 mb-1.5 text-center">{jury.label}</p>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => jury.setter('Aka')}
                      className={`flex-1 text-[10px] font-bold py-1 rounded text-center transition ${
                        jury.getter === 'Aka' ? 'bg-rose-600 text-white' : 'bg-slate-850 text-rose-500 hover:bg-slate-800'
                      }`}
                    >
                      Aka
                    </button>
                    <button
                      type="button"
                      onClick={() => jury.setter('Ao')}
                      className={`flex-1 text-[10px] font-bold py-1 rounded text-center transition ${
                        jury.getter === 'Ao' ? 'bg-indigo-600 text-white' : 'bg-slate-850 text-indigo-400 hover:bg-slate-800'
                      }`}
                    >
                      Ao
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSimulateHantei}
              className="w-full bg-slate-800 hover:bg-slate-750 text-amber-300 text-xs font-bold py-2 rounded-lg border border-amber-500/20 cursor-pointer"
            >
              Hitung Voting Juri
            </button>

            {simWinner && (
              <div className="bg-slate-950 p-3 rounded border border-amber-500/20 text-center animate-fade-in text-xs font-bold text-amber-400 mt-2">
                PEMENANG TIMBUL: <strong className="text-white block mt-1">{simWinner}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Referee List (Right) */}
        <div className="lg:col-span-7 bg-slate-950/40 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mb-4">
            <Award className="text-indigo-400 h-5 w-5" />
            Alokasi Dewan Juri &amp; Sektor Tatami Arena
          </h3>

          <div className="divide-y divide-slate-900">
            {referees.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">Belum ada wasit tanding terdaftar.</p>
            ) : (
              referees.map(r => (
                <div key={r.id} className="py-3 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-300 font-bold">
                      W
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">{r.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{r.license}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                      r.location === 'Cadangan'
                        ? 'bg-slate-900 border border-slate-800 text-slate-400'
                        : 'bg-indigo-950 border border-indigo-900 text-indigo-300'
                    }`}>
                      {r.location}
                    </span>
                    <button
                      onClick={() => handleDeleteReferee(r.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-955 rounded transition duration-150"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
