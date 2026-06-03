import React, { useState, useMemo } from 'react';
import { Participant, Category, Match, PaymentSettings } from '../types';
import { 
  Trophy, Search, Calendar, Award, User, RefreshCw, 
  MapPin, Clock, ArrowLeft, ArrowRight, Shield, Layers,
  Activity, Users, Megaphone, Check, ChevronRight, Eye, Star, Sparkles, UserPlus, UserCheck, Printer
} from 'lucide-react';
import SelfServicePortal from './SelfServicePortal';

interface PublicPortalViewProps {
  participants: Participant[];
  categories: Category[];
  matches: Match[];
  onClose: () => void;
  onAddParticipant?: (participant: Participant) => void;
  onUpdateParticipant?: (participant: Participant) => void;
  paymentSettings?: PaymentSettings;
}

const AVATAR_FALLBACKS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=120',
];

export default function PublicPortalView({ participants, categories, matches, onClose, onAddParticipant, onUpdateParticipant, paymentSettings }: PublicPortalViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'arena' | 'brackets' | 'athletes' | 'announcements' | 'register'>('overview');
  
  // States
  const [athleteQuery, setAthleteQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [selectedTatami, setSelectedTatami] = useState<number>(1);

  // Dynamic Medal Leaderboard Calculator
  const medalStandings = useMemo(() => {
    const stands: { [club: string]: { gold: number; silver: number; bronze: number; total: number } } = {};
    
    // Initialize for all known clubs from participants
    participants.forEach(p => {
      if (p.club && !stands[p.club]) {
        stands[p.club] = { gold: 0, silver: 0, bronze: 0, total: 0 };
      }
    });

    // Detect winners of finals & bronze matches for each category
    categories.forEach(cat => {
      const catMatches = matches.filter(m => m.categoryId === cat.id);
      
      // 1. Final Gold / Silver
      const finalMatch = catMatches.find(m => 
        m.roundName.toLowerCase() === 'final' || 
        m.roundName.toLowerCase().includes('perebutan juara 1')
      );
      if (finalMatch && finalMatch.isCompleted && finalMatch.winnerId) {
        const winner = participants.find(p => p.id === finalMatch.winnerId);
        const loserId = finalMatch.winnerId === finalMatch.akaId ? finalMatch.aoId : finalMatch.akaId;
        const loser = participants.find(p => p.id === loserId);

        if (winner && winner.club) {
          stands[winner.club].gold += 1;
        }
        if (loser && loser.club) {
          stands[loser.club].silver += 1;
        }
      }

      // 2. Bronze
      const bronzeMatches = catMatches.filter(m => 
        m.isBronzeMatch || 
        m.roundName.toLowerCase().includes('perebutan juara 3') ||
        m.roundName.toLowerCase().includes('bronze')
      );
      bronzeMatches.forEach(bm => {
        if (bm.isCompleted && bm.winnerId) {
          const winner = participants.find(p => p.id === bm.winnerId);
          if (winner && winner.club) {
            stands[winner.club].bronze += 1;
          }
        }
      });
    });

    // Convert to sorted array
    const sorted = Object.entries(stands).map(([club, medals]) => ({
      club,
      ...medals,
      total: medals.gold + medals.silver + medals.bronze
    }));

    // Sort by gold desc, then silver desc, then bronze desc
    return sorted.sort((a, b) => {
      if (b.gold !== a.gold) return b.gold - a.gold;
      if (b.silver !== a.silver) return b.silver - a.silver;
      return b.bronze - a.bronze;
    });
  }, [participants, categories, matches]);

  // Selected Bracket view configuration
  const activeCategory = useMemo(() => {
    return categories.find(c => c.id === selectedCatId) || categories[0] || null;
  }, [categories, selectedCatId]);

  const activeCatMatches = useMemo(() => {
    if (!activeCategory) return [];
    return matches.filter(m => m.categoryId === activeCategory.id);
  }, [activeCategory, matches]);

  // Group matches by round for bracket view
  const roundsMap = useMemo(() => {
    if (!activeCategory || activeCategory.bracketType === 'RoundRobin') return {};
    
    const map: { [round: number]: { roundName: string; matches: Match[] } } = {};
    activeCatMatches.forEach(m => {
      if (!m.isLosersBracket) {
        if (!map[m.round]) {
          map[m.round] = { roundName: m.roundName, matches: [] };
        }
        map[m.round].matches.push(m);
      }
    });

    // Sort matches in each round by matchNumber
    Object.keys(map).forEach(r => {
      map[parseInt(r)].matches.sort((a, b) => a.matchNumber - b.matchNumber);
    });

    return map;
  }, [activeCategory, activeCatMatches]);

  const maxRound = useMemo(() => {
    const rounds = Object.keys(roundsMap).map(Number);
    return rounds.length > 0 ? Math.max(...rounds) : 0;
  }, [roundsMap]);

  // Filtered participants list for lookup tab
  const filteredAthletes = useMemo(() => {
    if (!athleteQuery.trim()) return [];
    return participants.filter(p => 
      p.name.toLowerCase().includes(athleteQuery.toLowerCase()) ||
      p.club.toLowerCase().includes(athleteQuery.toLowerCase())
    ).slice(0, 15);
  }, [participants, athleteQuery]);

  // Active Live Matches Across Tatamis
  const liveMatches = useMemo(() => {
    return matches.filter(m => !m.isCompleted && (m.akaId && m.aoId));
  }, [matches]);

  // Announcements list (built-in fallback lists)
  const announcements = [
    {
      id: '1',
      title: 'TIMBANG BADAN RESMI DI BUKA',
      content: 'Timbang badan bagi seluruh Karateka kelas Cadet dan Junior di GOR Sasana Pasaman berlangsung mulai Pukul 14.00 WIB s.d 17.00 WIB. Harap membawa dokumen asli.',
      date: 'Hari ini, 08:30',
      tag: 'Timbangan'
    },
    {
      id: '2',
      title: 'REFRESHING PENATARAN DAN UJIAN WASIT JURI',
      content: 'Sesi penataran wasit juri oleh dewan wasit FORKI SUMBAR dilaksanakan di Aula Wisma Pasaman malam ini Pukul 19.30 WIB.',
      date: 'Kemarin',
      tag: 'Wasit Juri'
    },
    {
      id: '3',
      title: 'PENCATATAN DATA PESERTA VIA PORTAL MANDIRI',
      content: 'Para official kontingen dipersilakan memanfaatkan Kiosk Self-Service di depan lobby utama untuk cetak bukti identitas karateka dan check-in timbangan secara mandiri.',
      date: '3 Hari Lalu',
      tag: 'Sistem'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      
      {/* PUBLIC PORTAL HEADER HERO */}
      <div className="relative bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 border-b border-slate-800 p-5 md:p-6 shadow-xl overflow-hidden">
        
        {/* Background Grid Accent & Particle light */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full filter blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          
          <div className="flex items-center gap-4 text-center md:text-left self-start">
            <div className="h-14 w-14 bg-slate-900 rounded-2xl border border-rose-500/20 shadow-2xl p-1 shrink-0 flex items-center justify-center animate-pulse">
              {/* Dynamic CSS WKF Style Emblem */}
              <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white font-black text-md shadow-inner">
                F
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/20 rounded">
                  🟢 LIVE BOARD
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 px-2 py-0.5 border border-rose-500/20 rounded">
                  🔴 AKA
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 px-2 py-0.5 border border-blue-500/20 rounded">
                  🔵 AO
                </span>
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white mt-1">
                PORTAL INFORMASI PUBLIK KEJURDA
              </h1>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Kejuaraan Daerah Karate FORKI Sumatera Barat 2026 • GOR Pasaman
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-right hidden lg:block">
              <span className="text-[9.5px] uppercase font-black text-slate-500 block">Server Realtime</span>
              <span className="text-xs font-mono font-extrabold text-amber-400 flex items-center gap-1.5 justify-end">
                <span className="h-2 w-2 bg-emerald-400 rounded-full animate-ping"></span> Sync OK
              </span>
            </div>
            
            <button 
              onClick={onClose}
              className="flex items-center gap-2 text-xs font-bold bg-slate-900 hover:bg-slate-850 text-rose-400 hover:text-rose-300 border border-slate-800 px-4 py-3 rounded-xl transition duration-200 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Admin
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TABS SELECTOR DECK (spectator specific navigation) */}
      <div className="bg-slate-950 border-b border-slate-900 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap gap-2 justify-center md:justify-start">
          {[
            { id: 'overview', label: 'Dashboard & Klasemen', icon: Trophy },
            { id: 'arena', label: 'Monitor Live Arena / Tatami', icon: Activity },
            { id: 'brackets', label: 'Papan Bagan Interaktif', icon: Award },
            { id: 'athletes', label: 'Pencarian Atlet & Berat', icon: Search },
            { id: 'announcements', label: 'Pengumuman Resmi', icon: Megaphone },
            { id: 'register', label: 'Absensi & Pendaftaran', icon: UserCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  active 
                    ? 'bg-rose-500 text-white font-black shadow-lg shadow-rose-950/40 scale-[1.03]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        
        {/* PUBLIC BANNER REPAIR (ALWAYS ACTIVE AND GORGEOUS) */}
        {activeTab === 'overview' && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 rounded-2xl p-6 md:p-8 border border-rose-500/10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full filter blur-3xl -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl -ml-20 -mb-20"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                <div className="hidden sm:block shrink-0 bg-white p-2 rounded-xl border-4 border-amber-500/30 shadow-xl shadow-amber-900/20 self-start md:self-center">
                  <img src="https://upload.wikimedia.org/wikipedia/id/5/5f/Logo_FORKI_%28Federasi_Olahraga_Karate-Do_Indonesia%29.png" alt="FORKI Logo" className="w-16 h-16 md:w-24 md:h-24 object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-extrabold uppercase py-1 px-3 rounded-full tracking-wider animate-pulse flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" /> OFFICIAL SPECTATOR HUB
                    </span>
                    <span className="text-slate-400 text-xs hidden sm:inline">• Kejuaraan Daerah Karate FORKI Sumatera Barat 2026</span>
                  </div>
                  
                  <h2 className="text-3xl font-black text-white tracking-tight leading-none md:text-5xl uppercase">
                    PAPAN SKOR DIGITAL <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-400 to-indigo-400">
                      &amp; BRACKET TERPADU
                    </span>
                  </h2>
                </div>
                
                <p className="text-slate-300 mt-4 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
                  Pantau bagan pertandingan, hasil kelas tanding, status check-in berat badan atlet, dewan juri yang bertugas secara transparan langsung di layar gawai Anda secara real-time.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 max-w-4xl">
                  <div className="text-center p-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Atlet Terdaftar</span>
                    <span className="text-xl font-black text-rose-400 mt-1 block">{participants.length}</span>
                  </div>
                  <div className="text-center p-2 border-l border-slate-900">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Atlet Hadir (Checked)</span>
                    <span className="text-xl font-black text-emerald-400 mt-1 block">
                      {participants.filter(p => p.isCheckedIn).length}
                    </span>
                  </div>
                  <div className="text-center p-2 border-l border-slate-900">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Divisi Kategori</span>
                    <span className="text-xl font-black text-indigo-400 mt-1 block">{categories.length}</span>
                  </div>
                  <div className="text-center p-2 border-l border-slate-900">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Kecocokan Medali</span>
                    <span className="text-xl font-black text-amber-400 mt-1 block">
                      {categories.filter(c => c.isLocked).length} / {categories.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB INDEX 1: OVERVIEW & LEAD_BOARD */}
        {activeTab === 'overview' && (
          <>
            {/* ACTION BUTTONS (DAFTAR & DAFTAR HADIR) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => {
                  window.history.pushState({}, '', '?register=new');
                  setActiveTab('register');
                }}
                className="bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 p-5 md:p-6 rounded-2xl flex items-center justify-start text-left gap-4 transition-all cursor-pointer group shadow-lg shadow-indigo-900/10"
              >
                <div className="bg-indigo-500/20 p-4 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform border border-indigo-500/30 flex-shrink-0">
                  <UserPlus className="h-8 w-8 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">Pendaftaran Peserta</h3>
                  <p className="text-indigo-200/70 text-[10px] md:text-xs mt-1 font-semibold leading-relaxed">Daftarkan atlet baru untuk turnamen ini</p>
                </div>
              </button>

              <button
                onClick={() => {
                  window.history.pushState({}, '', '?register=checkin');
                  setActiveTab('register');
                }}
                className="bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 p-5 md:p-6 rounded-2xl flex items-center justify-start text-left gap-4 transition-all cursor-pointer group shadow-lg shadow-emerald-900/10"
              >
                <div className="bg-emerald-500/20 p-4 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform border border-emerald-500/30 flex-shrink-0">
                  <UserCheck className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">Daftar Hadir (Absen)</h3>
                  <p className="text-emerald-200/70 text-[10px] md:text-xs mt-1 font-semibold leading-relaxed">Timbang badan ulang &amp; kehadiran atlet</p>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col: Medal Stands */}
            <div className="lg:col-span-8 bg-slate-950/50 rounded-2xl p-5 border border-slate-900">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-900">
                <h3 className="text-md font-extrabold text-white flex items-center gap-2">
                  <Trophy className="text-amber-400 h-5 w-5" />
                  KLASEMEN PEROLEHAN MEDALI DEMENTARA
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Daftar Kontingen Berjaya</span>
              </div>

              {medalStandings.length === 0 ? (
                <div className="py-12 text-center text-slate-500 italic">
                  Belum ada medali terbagi. Hasil final per babak akan didistribusikan saat pertandingan final kategori ditutup.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-2 text-center w-12">No</th>
                        <th className="py-3 px-2">Kontingen Dojo / Club</th>
                        <th className="py-3 px-2 text-center w-16">🥇 Emas</th>
                        <th className="py-3 px-2 text-center w-16">🥈 Perak</th>
                        <th className="py-3 px-2 text-center w-16">🥉 Perunggu</th>
                        <th className="py-3 px-2 text-center bg-slate-950 w-20">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 font-semibold text-slate-200">
                      {medalStandings.map((row, idx) => (
                        <tr key={row.club} className="hover:bg-slate-900/30 transition">
                          <td className="py-3.5 px-2 text-center">
                            {idx + 1 === 1 ? (
                              <span className="inline-flex h-6 w-6 rounded-lg bg-amber-500/10 text-amber-500 items-center justify-center font-bold">1</span>
                            ) : idx + 1 === 2 ? (
                              <span className="inline-flex h-6 w-6 rounded-lg bg-slate-300/10 text-slate-300 items-center justify-center font-bold">2</span>
                            ) : idx + 1 === 3 ? (
                              <span className="inline-flex h-6 w-6 rounded-lg bg-amber-700/10 text-amber-700 items-center justify-center font-bold">3</span>
                            ) : idx + 1}
                          </td>
                          <td className="py-3.5 px-2 text-sm text-white font-extrabold">{row.club}</td>
                          <td className="py-3.5 px-2 text-center text-amber-400 text-sm font-black">{row.gold}</td>
                          <td className="py-3.5 px-2 text-center text-slate-300 text-sm font-black">{row.silver}</td>
                          <td className="py-3.5 px-2 text-center text-amber-700 text-sm font-black">{row.bronze}</td>
                          <td className="py-3.5 px-2 text-center text-rose-400 text-sm font-extrabold bg-slate-900/30">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Col: Announcements & Info feed */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-900">
                <h3 className="text-md font-extrabold text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-900">
                  <Megaphone className="text-rose-500 h-5 w-5" />
                  PAPAN WARTA &amp; PENGUMUMAN
                </h3>

                <div className="space-y-4">
                  {announcements.map(item => (
                    <div key={item.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-900 space-y-1.5 hover:border-slate-800 transition">
                      <div className="flex justify-between items-center">
                        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold px-2 py-0.5 rounded">
                          {item.tag}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{item.date}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-200 uppercase">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">{item.content}</p>
                    </div>
                  ))}
                </div>
              </div>



              {/* Quick instructions widget */}
              <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-900">
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-3 uppercase">
                  <Shield className="text-indigo-400 h-4.5 w-4.5" />
                  SISTEM WKF COMPLIANT
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Sistem skoring tanding melacak Senshu (Advantage nilai pertama), penalti C1 / C2, Hansoku (Disqualification), dan Hantei (Keputusan wasit). Seluruh bagan dirakit secara transparan.
                </p>
                <div className="mt-3 text-[10px] text-slate-500 flex justify-between">
                  <span>FORKI INDONESIA v2.0</span>
                  <span className="text-rose-400 font-bold">Paperless &amp; Instant</span>
                </div>
              </div>

            </div>

          </div>
          </>
        )}

        {/* TAB INDEX 2: MONITOR ARENA & LIVE SHIELD */}
        {activeTab === 'arena' && (
          <div className="space-y-6">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-900 flex flex-wrap gap-2 items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Activity className="text-emerald-400 h-5 w-5 animate-pulse" />
                  MONITOR PERTANDINGAN LIVE SEDANG BERLANGSUNG
                </h3>
                <p className="text-xs text-slate-400">Pilih Tatami / Arena untuk memonitor jalannya poin dari detik ke detik.</p>
              </div>

              <div className="flex gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {[1, 2, 3].map(tatami => (
                  <button
                    key={tatami}
                    onClick={() => setSelectedTatami(tatami)}
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      selectedTatami === tatami 
                        ? 'bg-rose-500 text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    TATAMI {tatami}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Board Grid filter by Tatami */}
            {(() => {
              const tatamiMatches = liveMatches.filter(m => (m.tatamiNumber || 1) === selectedTatami);
              
              if (tatamiMatches.length === 0) {
                return (
                  <div className="py-24 text-center text-slate-500 bg-slate-950/20 rounded-2xl border border-slate-900">
                    <Activity className="h-14 w-14 text-slate-800 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-white">Tidak ada pertarungan aktif di Tatami {selectedTatami}</h3>
                    <p className="text-xs text-slate-500 mt-1">Seluruh pertandingan selesai, ditangguhkan, atau belum dipanggil oleh wasit meja.</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tatamiMatches.map(match => {
                    const aka = participants.find(p => p.id === match.akaId);
                    const ao = participants.find(p => p.id === match.aoId);
                    const category = categories.find(c => c.id === match.categoryId);

                    return (
                      <div key={match.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                        
                        {/* Upper Header strip */}
                        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-850 flex justify-between items-center text-xs">
                          <span className="font-extrabold text-indigo-400 uppercase tracking-widest bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/30">
                            {category ? category.name : 'Kumite Kategori'}
                          </span>
                          <span className="font-mono text-slate-400 font-bold bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
                            Tatami {selectedTatami} • M-{match.matchNumber}
                          </span>
                        </div>

                        {/* Main Scoring visual board */}
                        <div className="p-4 grid grid-cols-11 gap-4 items-center">
                          
                          {/* AKA SIDE */}
                          <div className="col-span-4 text-center space-y-2">
                            <div className="h-16 w-16 mx-auto rounded-full overflow-hidden border-2 border-rose-500 bg-slate-950 shadow-lg shadow-rose-950/20">
                              <img src={aka?.photoUrl || AVATAR_FALLBACKS[0]} alt="aka" className="h-full w-full object-cover" />
                            </div>
                            <div>
                              <p className="font-black text-rose-500 text-md truncate leading-tight">{aka?.name || 'Aka'}</p>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{aka?.club || 'CLUB'}</span>
                            </div>
                          </div>

                          {/* VS / SCORE */}
                          <div className="col-span-3 text-center">
                            <div className="flex justify-center items-center gap-1 bg-slate-950/80 rounded-xl p-3 border border-slate-800/60">
                              <span className="text-3xl font-black text-rose-500">{match.akaScore}</span>
                              <span className="text-slate-600 font-bold text-xs px-1">:</span>
                              <span className="text-3xl font-black text-blue-500">{match.aoScore}</span>
                            </div>
                            <span className="text-[9px] font-black uppercase text-amber-500 block mt-2 tracking-widest animate-pulse">
                              {match.roundName}
                            </span>
                          </div>

                          {/* AO SIDE */}
                          <div className="col-span-4 text-center space-y-2">
                            <div className="h-16 w-16 mx-auto rounded-full overflow-hidden border-2 border-blue-500 bg-slate-950 shadow-lg shadow-blue-950/20">
                              <img src={ao?.photoUrl || AVATAR_FALLBACKS[1]} alt="ao" className="h-full w-full object-cover" />
                            </div>
                            <div>
                              <p className="font-black text-blue-500 text-md truncate leading-tight">{ao?.name || 'Ao'}</p>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{ao?.club || 'CLUB'}</span>
                            </div>
                          </div>

                        </div>

                        {/* Status tracker bar */}
                        <div className="bg-slate-950/40 p-2.5 border-t border-slate-850 text-[10px] text-slate-400 flex justify-between px-4">
                          <div className="flex gap-1">
                            {match.akaSenshu && <span className="bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20 rounded px-1">AKA SENSHU</span>}
                            <span>C1: {match.akaPenalties.c1 || 0} • C2: {match.akaPenalties.c2 || 0}</span>
                          </div>
                          <div className="flex gap-1 text-right">
                            {match.aoSenshu && <span className="bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20 rounded px-1">AO SENSHU</span>}
                            <span>C1: {match.aoPenalties.c1 || 0} • C2: {match.aoPenalties.c2 || 0}</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Upcoming Pool list */}
            <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-900">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-rose-500" />
                Antrean &amp; Jadwal Tanding Berikutnya
              </h3>

              <div className="divide-y divide-slate-900 border border-slate-900 rounded-lg overflow-hidden text-xs">
                {(() => {
                  const pendingMatches = matches.filter(m => !m.isCompleted && (!m.akaId || !m.aoId || (m.akaId && m.aoId))).slice(0, 8);
                  
                  if (pendingMatches.length === 0) {
                    return <p className="py-4 text-center text-slate-500 bg-slate-950/20">Belum ada antrean jadwal berikutnya.</p>;
                  }

                  return pendingMatches.map(m => {
                    const aka = participants.find(p => p.id === m.akaId);
                    const ao = participants.find(p => p.id === m.aoId);
                    const category = categories.find(c => c.id === m.categoryId);

                    return (
                      <div key={m.id} className="p-3 bg-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500 uppercase tracking-widest font-black text-[9px] bg-slate-900 px-2.5 py-1 rounded border border-slate-850">
                            M-{m.matchNumber}
                          </span>
                          <div>
                            <p className="font-bold text-white text-xs leading-none">
                              {category ? category.name : 'Kumite Kategori'}
                            </p>
                            <span className="text-[9.5px] text-slate-400 font-semibold uppercase">{m.roundName}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-bold md:mr-12">
                          <span className={`text-rose-400 truncate max-w-[140px] ${aka ? 'font-black' : 'italic text-slate-500'}`}>
                            🔴 {aka ? aka.name : 'Pemenang Match Sebelumnya'}
                          </span>
                          <span className="text-slate-600 font-bold">vs</span>
                          <span className={`text-blue-400 truncate max-w-[140px] ${ao ? 'font-black' : 'italic text-slate-500'}`}>
                            🔵 {ao ? ao.name : 'Pemenang Match Sebelumnya'}
                          </span>
                        </div>

                        <div className="text-right text-[10px] text-slate-400 font-semibold uppercase">
                          Tatami {m.tatamiNumber || 1} • {m.scheduledTime || '--:--'}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

          </div>
        )}

        {/* TAB INDEX 3: INTERACTIVE EXPANDABLE BRACKETS */}
        {activeTab === 'brackets' && (
          <div className="space-y-6">
            
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-900 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h3 className="text-md font-extrabold text-white flex items-center gap-2">
                  <Award className="text-indigo-400 h-5 w-5" />
                  EKSPLORASI BAGAN PERTANDINGAN DIVISI
                </h3>
                <p className="text-xs text-slate-400">Pilih salah satu divisi di bawah untuk melihat rincian pertarungan bagan gugur / klasemen.</p>
              </div>

              <select
                id="select-active-category-board-public"
                value={selectedCatId}
                onChange={e => setSelectedCatId(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs font-bold text-white px-3 py-2 rounded-lg max-w-sm focus:outline-none"
              >
                <option value="">-- Silahkan Pilih Kelas Tanding --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {!activeCategory ? (
              <div className="py-24 text-center text-slate-500 bg-slate-950/20 rounded-2xl border border-slate-900">
                <Layers className="h-14 w-14 text-slate-800 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white">Belum ada kelas pertandingan dipilih</h3>
                <p className="text-xs text-slate-500 mt-1">Gunakan drop-down filter di atas untuk menampilkan bagan dan hasil terbaru kelas.</p>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 relative overflow-x-auto">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-900">
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Divisi Aktif</span>
                    <h4 className="text-md font-black text-white">{activeCategory.name}</h4>
                    <p className="text-xs text-rose-400 font-semibold mt-0.5">Sistem Bagan: {activeCategory.bracketType} Elimination</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-right font-mono text-[10px] font-bold text-slate-400">
                    STATUS: {activeCategory.isLocked ? '🟠 BERJALAN' : '⚪ DESAIN'}
                  </div>
                </div>

                {/* If brackets have not been drawn/randomized inside admin panel */}
                {!activeCategory.isLocked ? (
                  <div className="py-16 text-center text-slate-500 bg-slate-900/10 rounded-xl border border-slate-900">
                    <Star className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-white uppercase">Bagan belum diluncurkan</h4>
                    <p className="not-italic text-[11px] text-slate-500 mt-1">Roster nama karateka sudah terdaftar. Menunggu dewan panitia mengacak &amp; meluncurkan bagan resmi.</p>
                  </div>
                ) : activeCategory.bracketType === 'RoundRobin' ? (
                  // Spectator Round robin layout
                  <div className="space-y-6">
                    <p className="text-xs font-bold text-yellow-500">Sistem Setengah Kompetisi Pool - Seluruh karateka saling bertemu.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeCatMatches.map(m => {
                        const aka = participants.find(p => p.id === m.akaId);
                        const ao = participants.find(p => p.id === m.aoId);
                        
                        return (
                          <div key={m.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-805 text-xs flex justify-between items-center">
                            <div>
                              <span className="text-[9px] font-black text-slate-500 uppercase">{m.roundName}</span>
                              <div className="mt-1 space-y-1">
                                <p className={`font-semibold ${m.winnerId === m.akaId ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>🔴 {aka?.name || 'TBD'}</p>
                                <p className={`font-semibold ${m.winnerId === m.aoId ? 'text-blue-400 font-bold' : 'text-slate-300'}`}>🔵 {ao?.name || 'TBD'}</p>
                              </div>
                            </div>
                            <div className="bg-slate-950 p-2 rounded text-right font-mono text-sm leading-tight font-black">
                              {m.isCompleted ? (
                                <div>
                                  <span className="text-rose-500">{m.akaScore}</span>
                                  <span className="text-slate-600 text-xs px-1">-</span>
                                  <span className="text-blue-500">{m.aoScore}</span>
                                </div>
                              ) : (
                                <span className="text-amber-500 text-xs font-sans">MENUNGGU</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  // Elimination system horizontal rounds
                  <div className="flex gap-8 py-4 px-2 min-w-[700px]">
                    {Object.keys(roundsMap).map(rKey => {
                      const roundNum = parseInt(rKey);
                      const roundData = roundsMap[roundNum];

                      return (
                        <div key={roundNum} className="flex-1 flex flex-col justify-around space-y-4">
                          <div className="text-center border-b border-slate-900 pb-2 mb-2">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                              {roundData.roundName}
                            </span>
                          </div>

                          {roundData.matches.map(m => {
                            const aka = participants.find(p => p.id === m.akaId);
                            const ao = participants.find(p => p.id === m.aoId);
                            const wasCompleted = m.isCompleted;

                            return (
                              <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md text-xs relative select-none">
                                <span className="absolute top-1.5 right-2 font-mono text-[8px] text-slate-500 font-bold">M-{m.matchNumber}</span>
                                
                                <div className="space-y-1.5 mt-1">
                                  {/* AKA RED */}
                                  <div className={`flex items-center justify-between p-1 rounded ${m.winnerId === m.akaId && wasCompleted ? 'bg-rose-950/20 font-bold border-l-2 border-rose-500' : ''}`}>
                                    <span className={`truncate max-w-[150px] ${aka ? 'text-rose-400' : 'text-slate-500 italic'}`}>
                                      🔴 {aka ? aka.name : 'Menunggu Pemenang'}
                                    </span>
                                    <span className="font-black text-slate-300 font-mono">{wasCompleted ? m.akaScore : '-'}</span>
                                  </div>

                                  {/* AO BLUE */}
                                  <div className={`flex items-center justify-between p-1 rounded ${m.winnerId === m.aoId && wasCompleted ? 'bg-indigo-950/20 font-bold border-l-2 border-indigo-500' : ''}`}>
                                    <span className={`truncate max-w-[150px] ${ao ? 'text-blue-400' : 'text-slate-500 italic'}`}>
                                      🔵 {ao ? ao.name : 'Menunggu Pemenang'}
                                    </span>
                                    <span className="font-black text-slate-300 font-mono">{wasCompleted ? m.aoScore : '-'}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* TAB INDEX 4: ATHLETE DIRECTORY SEARCH & STATUS */}
        {activeTab === 'athletes' && (
          <div className="space-y-6">
            
            <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-900 space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Search className="text-rose-500 h-5 w-5" />
                  PENCIDIKAN DAN CARI STATUS KARATEKA
                </h3>
                <p className="text-xs text-slate-400">Hubungkan data di sini untuk mencari Dojo, Kontingen, Absensi Timbangan dan Riwayat Kelas Atlet.</p>
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4.5 w-4.5 text-slate-500" />
                </span>
                <input
                  type="text"
                  id="athlete-pub-search"
                  value={athleteQuery}
                  onChange={e => setAthleteQuery(e.target.value)}
                  placeholder="Ketik minimal 2 karakter (misal nama atau dojo tim)..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/80 font-semibold"
                />
              </div>
            </div>

            {/* Suggestions view */}
            {athleteQuery.trim() !== '' && filteredAthletes.length === 0 ? (
              <div className="py-16 text-center text-slate-500 bg-slate-950/20 rounded-2xl border border-slate-900">
                <Users className="h-10 w-10 text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-bold text-white">Tidak ada nama karateka yang serasi</p>
                <p className="text-[11px] text-slate-500 mt-1">Coretan kata kunci salah atau atlet belum mendaftar di sistem kesekretariatan.</p>
              </div>
            ) : filteredAthletes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAthletes.map(p => (
                  <div key={p.id} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-850 hover:border-slate-700 transition space-y-3 relative overflow-hidden">
                    
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-750 bg-slate-950 p-0.5 shrink-0">
                        <img src={p.photoUrl || AVATAR_FALLBACKS[0]} alt="karateka" className="h-full w-full object-cover rounded-lg" />
                      </div>
                      <div className="truncate">
                        <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest bg-rose-505/5 border border-rose-500/10 px-2 py-0.5 rounded">
                          {p.club}
                        </span>
                        <h4 className="font-extrabold text-white text-xs mt-1 truncate leading-tight uppercase">{p.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">{p.gender} • {p.ageGroup}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/50 p-2.5 rounded-xl border border-slate-850/40">
                      <div>
                        <span className="text-[9px] text-slate-500 font-black uppercase block">Tipe Tanding</span>
                        <span className="font-bold text-slate-300">{p.categoryType} ({p.division})</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-black uppercase block">Status Absensi</span>
                        {p.isCheckedIn ? (
                          <span className="text-emerald-400 font-extrabold">✓ HADIR</span>
                        ) : (
                          <span className="text-slate-500">⚪ BELUM HADIR</span>
                        )}
                      </div>
                    </div>

                    {/* Weight status details */}
                    <div className="flex justify-between items-center text-[10px] border-t border-slate-850 pt-2 text-slate-400">
                      <span>Timbang Sasaran: <strong>{p.weight ? `${p.weight} kg` : '-'}</strong></span>
                      <span>Aktual Timbang: <strong className={p.weighInStatus === 'Pass' ? 'text-emerald-400' : p.weighInStatus === 'Overweight' ? 'text-rose-400 animate-pulse' : 'text-slate-300'}>{p.actualWeight ? `${p.actualWeight} kg` : '-'}</strong></span>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                <Search className="h-10 w-10 text-slate-850 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">Ketikkan kata kunci di atas untuk memulai pemantauan peserta</p>
                <p className="text-[10px] text-slate-500">Mencakup nama lengkap karateka, asal dojo, nomor tanding kontingen.</p>
              </div>
            )}

          </div>
        )}

        {/* TAB INDEX 5: OFFICIAL BOARD INFO SUMMARY */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-900 space-y-4">
              <div className="flex items-center gap-2">
                <Megaphone className="text-rose-500 h-5 w-5 animate-bounce" />
                <div>
                  <h3 className="text-base font-extrabold text-white">DOKUMEN RESMI DAN INFORMASI PANITIA PELAKSANA</h3>
                  <p className="text-xs text-slate-400">Hub komunikasi dan rilis berita dari dewan hakim dan pengawas FORKI SUMBAR.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {announcements.map(item => (
                <div key={item.id} className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition duration-300 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[9px] font-black px-3 py-1 uppercase rounded-full">
                      📍 {item.tag}
                    </span>
                    <span className="text-xs text-slate-500 font-mono font-bold">{item.date}</span>
                  </div>
                  
                  <h4 className="text-md font-black text-white hover:text-rose-400 transition cursor-pointer uppercase tracking-tight">
                    {item.title}
                  </h4>
                  
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    {item.content}
                  </p>

                  <div className="pt-3 border-t border-slate-850/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Oleh: Panitia Pelaksana GOR Pasaman</span>
                    <span className="text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5">
                      Lihat Rincian <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB INDEX 6: REGISTRATION */}
        {activeTab === 'register' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-2 md:p-6 shadow-2xl">
            <SelfServicePortal 
              participants={participants}
              onUpdateParticipant={onUpdateParticipant || (() => {})}
              onAddParticipant={onAddParticipant || (() => {})}
              standalone={false}
              paymentSettings={paymentSettings}
            />
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-6 bg-slate-950 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-400">
            SISTEM KESEKRETARIATAN REALTIME • FORKI SUMBAR TURNAMEN INDONESIA
          </p>
          <p className="text-[10px] text-slate-500">
            Platform digagas untuk kemudahan panitia pelaksana, dewan wasit juri, official kontingen, dan pendukung pertarungan Karate.
          </p>
        </div>
      </footer>

    </div>
  );
}
