import React, { useState } from 'react';
import { Match, Participant, Category } from '../types';
import { Calendar, Clock, MapPin, Search } from 'lucide-react';

interface JadwalTandingViewProps {
  matches: Match[];
  participants: Participant[];
  categories: Category[];
  onUpdateMatch: (updated: Match) => void;
}

export default function JadwalTandingView({ matches, participants, categories, onUpdateMatch }: JadwalTandingViewProps) {
  const [filterTatami, setFilterTatami] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  const activeMatches = matches.filter(m => m.akaId || m.aoId); // Skip fully unassigned slot places

  const handleAssignTatami = (matchId: string, tatami: number) => {
    const match = matches.find(m => m.id === matchId);
    if (match) {
      onUpdateMatch({
        ...match,
        tatamiNumber: tatami
      });
    }
  };

  const handleAssignTime = (matchId: string, time: string) => {
    const match = matches.find(m => m.id === matchId);
    if (match) {
      onUpdateMatch({
        ...match,
        scheduledTime: time
      });
    }
  };

  const filteredMatches = activeMatches.filter(m => {
    const category = categories.find(c => c.id === m.categoryId);
    const categoryName = category?.name || '';
    
    const akaPart = participants.find(p => p.id === m.akaId);
    const aoPart = participants.find(p => p.id === m.aoId);
    const athleteNames = `${akaPart?.name || ''} ${aoPart?.name || ''}`.toLowerCase();

    const matchesSearch = categoryName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          athleteNames.includes(searchTerm.toLowerCase()) ||
                          m.roundName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTatami = filterTatami === 'Semua' || 
                          (filterTatami === 'Belum' && !m.tatamiNumber) || 
                          m.tatamiNumber === parseInt(filterTatami);

    const matchesStatus = filterStatus === 'Semua' || 
                          (filterStatus === 'Selesai' && m.isCompleted) || 
                          (filterStatus === 'Berjalan' && !m.isCompleted && m.isCompleted === false) ||
                          (filterStatus === 'Menunggu' && !m.isCompleted);

    return matchesSearch && matchesTatami && matchesStatus;
  });

  return (
    <div className="space-y-6" id="jadwal-tanding-panel">
      {/* Filtering area */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Cari kelas, babak, atau atlet..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">Arena Tatami:</span>
            <select
              value={filterTatami}
              onChange={e => setFilterTatami(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-white p-2 rounded-lg"
            >
              <option value="Semua">Semua Tatami</option>
              <option value="1">Tatami 1</option>
              <option value="2">Tatami 2</option>
              <option value="3">Tatami 3</option>
              <option value="4">Tatami 4</option>
              <option value="Belum">Belum Dialokasikan</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">Status:</span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-white p-2 rounded-lg"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid listing of matches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMatches.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-950/20 border border-slate-850 rounded-2xl">
            <Calendar className="h-12 w-12 text-slate-800 mx-auto mb-2 animate-pulse" />
            <p className="text-xs text-slate-500">Kapasitas kosong. Silahkan generasikan bagan pertandingan di tab "Kategori" terlebih dahulu.</p>
          </div>
        ) : (
          filteredMatches.map(m => {
            const category = categories.find(c => c.id === m.categoryId);
            const rName = m.roundName;
            
            const akaPart = participants.find(p => p.id === m.akaId);
            const aoPart = participants.find(p => p.id === m.aoId);

            return (
              <div key={m.id} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition">
                {/* Match title header bar */}
                <div className="flex justify-between items-start border-b border-slate-850 pb-2 mb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded mr-2">
                      M - {m.matchNumber}
                    </span>
                    <span className="text-xs font-bold text-white line-clamp-1 truncate inline-block max-w-[150px]">
                      {category?.name || 'Class Match'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                    m.isCompleted 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                  }`}>
                    {m.isCompleted ? 'SELESAI' : 'MENUNGGU'}
                  </span>
                </div>

                {/* Combantants view */}
                <div className="grid grid-cols-5 gap-2 items-center text-xs py-2">
                  <div className="col-span-2 text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-red-650 text-white tracking-widest mb-1.5">Aka</span>
                    <p className="font-bold text-slate-200 line-clamp-1 truncate">{akaPart?.name || 'Menunggu...'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{akaPart?.club || '-'}</p>
                    {m.isCompleted && <p className="text-md font-extrabold text-red-500 mt-1">{m.akaScore} pt</p>}
                  </div>

                  <div className="col-span-1 text-center font-bold text-slate-500 text-sm">vs</div>

                  <div className="col-span-2 text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-blue-650 text-white tracking-widest mb-1.5">Ao</span>
                    <p className="font-bold text-slate-200 line-clamp-1 truncate">{aoPart?.name || 'Menunggu...'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{aoPart?.club || '-'}</p>
                    {m.isCompleted && <p className="text-md font-extrabold text-indigo-500 mt-1">{m.aoScore} pt</p>}
                  </div>
                </div>

                {/* Allocation row */}
                <div className="border-t border-slate-850 mt-3 pt-3 flex flex-wrap justify-between items-center gap-2 text-xs">
                  {/* Tatami assign */}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                    <select
                      value={m.tatamiNumber || ''}
                      onChange={e => handleAssignTatami(m.id, parseInt(e.target.value))}
                      className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-bold p-1 rounded focus:outline-none"
                    >
                      <option value="">Set Arena</option>
                      <option value="1">Tatami 1</option>
                      <option value="2">Tatami 2</option>
                      <option value="3">Tatami 3</option>
                      <option value="4">Tatami 4</option>
                    </select>
                  </div>

                  {/* Scheduled clock */}
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-indigo-400" />
                    <input
                      type="time"
                      value={m.scheduledTime || ''}
                      onChange={e => handleAssignTime(m.id, e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-bold p-1 rounded text-center focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
