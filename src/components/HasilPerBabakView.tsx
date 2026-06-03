import React, { useState } from 'react';
import { Match, Participant, Category } from '../types';
import { Medal, Search, Award, Check } from 'lucide-react';

interface HasilPerBabakViewProps {
  matches: Match[];
  participants: Participant[];
  categories: Category[];
}

export default function HasilPerBabakView({ matches, participants, categories }: HasilPerBabakViewProps) {
  const [filterCategory, setFilterCategory] = useState<string>('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  const completedMatches = matches.filter(m => m.isCompleted);

  const filtered = completedMatches.filter(m => {
    const category = categories.find(c => c.id === m.categoryId);
    const catName = category?.name || '';
    
    const aka = participants.find(p => p.id === m.akaId);
    const ao = participants.find(p => p.id === m.aoId);
    const athletes = `${aka?.name || ''} ${ao?.name || ''}`.toLowerCase();

    const matchesSearch = catName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          athletes.includes(searchTerm.toLowerCase()) ||
                          m.roundName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'Semua' || m.categoryId === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="hasil-babak-panel">
      {/* Search filters */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Cari atlet pemenang atau kelas..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Kategori:</span>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-white p-2 rounded-lg max-w-sm"
          >
            <option value="Semua">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results view */}
      <div className="bg-slate-950/50 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 text-xs font-bold uppercase">
              <th className="py-3.5 px-4 w-[60px] text-center">Match</th>
              <th className="py-3.5 px-4">Kategori / Divisi</th>
              <th className="py-3.5 px-4">Fase Babak</th>
              <th className="py-3.5 px-4">Aka (Merah)</th>
              <th className="py-3.5 px-4 text-center">Skor Akhir</th>
              <th className="py-3.5 px-4">Ao (Biru)</th>
              <th className="py-3.5 px-4 text-center">Pemenang Resmi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900 text-slate-200 text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                  Belum ada pertandingan diselesaikan di arena.
                </td>
              </tr>
            ) : (
              filtered.map(m => {
                const category = categories.find(c => c.id === m.categoryId);
                
                const aka = participants.find(p => p.id === m.akaId);
                const ao = participants.find(p => p.id === m.aoId);
                const winner = participants.find(p => p.id === m.winnerId);

                const isAkaWinner = m.winnerId === m.akaId;

                return (
                  <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 text-center text-xs font-mono font-bold text-slate-400">#{m.matchNumber}</td>
                    
                    <td className="py-3.5 px-4 font-bold text-xs max-w-[200px] truncate">{category?.name || 'Class Division'}</td>
                    
                    <td className="py-3.5 px-4 text-xs">
                      <span className="bg-slate-900 text-indigo-400 px-2 py-0.5 rounded border border-slate-800 uppercase font-black text-[10px]">
                        {m.roundName}
                      </span>
                    </td>
                    
                    <td className={`py-3.5 px-4 text-xs font-semibold ${isAkaWinner ? 'text-rose-400 font-extrabold' : 'text-slate-400'}`}>
                      🔴 {aka?.name || 'Aka'} <span className="text-[10px] text-slate-500">({aka?.club || '-'})</span>
                    </td>
                    
                    <td className="py-3.5 px-4 text-center font-black text-white text-base bg-slate-950/20">
                      <span className="text-rose-500">{m.akaScore}</span>
                      <span className="text-slate-500 mx-1.5">-</span>
                      <span className="text-indigo-500">{m.aoScore}</span>
                    </td>
                    
                    <td className={`py-3.5 px-4 text-xs font-semibold ${!isAkaWinner ? 'text-indigo-400 font-extrabold' : 'text-slate-400'}`}>
                      🔵 {ao?.name || 'Ao'} <span className="text-[10px] text-slate-500">({ao?.club || '-'})</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <Check className="h-3 w-3" /> {winner?.name || 'No Award'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
