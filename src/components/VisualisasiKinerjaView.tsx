import React, { useState } from 'react';
import { Match, Participant, Category } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  AreaChart,
  Area
} from 'recharts';
import { 
  Trophy, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  Award, 
  Users, 
  Zap, 
  Sword, 
  Scale, 
  PieChart as PieChartIcon, 
  BarChart3, 
  HelpCircle 
} from 'lucide-react';

interface VisualisasiKinerjaViewProps {
  matches: Match[];
  participants: Participant[];
  categories: Category[];
}

export default function VisualisasiKinerjaView({ matches, participants, categories }: VisualisasiKinerjaViewProps) {
  const [activeVisualization, setActiveVisualization] = useState<'overview' | 'dojos' | 'athletes' | 'penalties'>('overview');

  // ==========================================
  // 1. DATA COMPUTATION: ATHLETE WIN-LOSS
  // ==========================================
  const athleteStatsMap: Record<string, {
    id: string;
    name: string;
    club: string;
    played: number;
    won: number;
    lost: number;
    totalPoints: number;
    highestScore: number;
  }> = {};

  // Initialize athletes
  participants.forEach(p => {
    athleteStatsMap[p.id] = {
      id: p.id,
      name: p.name,
      club: p.club,
      played: 0,
      won: 0,
      lost: 0,
      totalPoints: 0,
      highestScore: 0
    };
  });

  // Tally matches
  matches.forEach(m => {
    if (!m.isCompleted) return;

    if (m.akaId && athleteStatsMap[m.akaId]) {
      const stats = athleteStatsMap[m.akaId];
      stats.played += 1;
      stats.totalPoints += m.akaScore;
      if (m.akaScore > stats.highestScore) stats.highestScore = m.akaScore;

      if (m.winnerId === m.akaId) {
        stats.won += 1;
      } else if (m.winnerId === m.aoId) {
        stats.lost += 1;
      }
    }

    if (m.aoId && athleteStatsMap[m.aoId]) {
      const stats = athleteStatsMap[m.aoId];
      stats.played += 1;
      stats.totalPoints += m.aoScore;
      if (m.aoScore > stats.highestScore) stats.highestScore = m.aoScore;

      if (m.winnerId === m.aoId) {
        stats.won += 1;
      } else if (m.winnerId === m.akaId) {
        stats.lost += 1;
      }
    }
  });

  const athleteStatsList = Object.values(athleteStatsMap);

  // Compute Distribution
  const winDistribution = [
    { name: '0 Kemenangan', count: 0, description: 'Belum Pecah Telur' },
    { name: '1 Kemenangan', count: 0, description: 'Lolos Babak Pertama' },
    { name: '2 Kemenangan', count: 0, description: 'Finis Perempat Final/Semifinal' },
    { name: '3+ Kemenangan', count: 0, description: 'Elite Podium / Juara Kelas' }
  ];

  athleteStatsList.forEach(s => {
    if (s.played === 0) return; // Only count those who played
    if (s.won === 0) winDistribution[0].count++;
    else if (s.won === 1) winDistribution[1].count++;
    else if (s.won === 2) winDistribution[2].count++;
    else winDistribution[3].count++;
  });

  // Top athletes by points and win rate
  const eliteAthletes = [...athleteStatsList]
    .filter(a => a.played > 0)
    .sort((a, b) => b.won - a.won || b.totalPoints - a.totalPoints)
    .slice(0, 7);

  // ==========================================
  // 2. DATA COMPUTATION: DOJO POINTS EXHAUSTED
  // ==========================================
  const dojoPointsMap: Record<string, {
    club: string;
    pointsScored: number;
    athleteCount: number;
    matchesPlayed: number;
    pointsPerMatch: number;
  }> = {};

  participants.forEach(p => {
    if (!dojoPointsMap[p.club]) {
      dojoPointsMap[p.club] = {
        club: p.club,
        pointsScored: 0,
        athleteCount: 0,
        matchesPlayed: 0,
        pointsPerMatch: 0
      };
    }
    dojoPointsMap[p.club].athleteCount += 1;
  });

  matches.forEach(m => {
    if (m.akaId && athleteStatsMap[m.akaId]) {
      const club = athleteStatsMap[m.akaId].club;
      if (dojoPointsMap[club]) {
        dojoPointsMap[club].pointsScored += m.akaScore;
        if (m.isCompleted) dojoPointsMap[club].matchesPlayed += 0.5; // Shared match multiplier
      }
    }
    if (m.aoId && athleteStatsMap[m.aoId]) {
      const club = athleteStatsMap[m.aoId].club;
      if (dojoPointsMap[club]) {
        dojoPointsMap[club].pointsScored += m.aoScore;
        if (m.isCompleted) dojoPointsMap[club].matchesPlayed += 0.5;
      }
    }
  });

  const dojoPointsData = Object.values(dojoPointsMap)
    .map(d => {
      const matchesCount = Math.round(d.matchesPlayed);
      return {
        ...d,
        matchesPlayed: matchesCount,
        pointsPerMatch: matchesCount > 0 ? Number((d.pointsScored / matchesCount).toFixed(1)) : 0
      };
    })
    .sort((a, b) => b.pointsScored - a.pointsScored);

  // ==========================================
  // 3. DATA COMPUTATION: PENALTY FREQUENCY
  // ==========================================
  let totalC1 = 0;
  let totalC2 = 0;
  let totalHansoku = 0;
  let totalSenshu = 0;
  let totalMatchesHandled = 0;

  matches.forEach(m => {
    totalMatchesHandled++;
    if (m.akaPenalties) {
      totalC1 += m.akaPenalties.c1 || 0;
      totalC2 += m.akaPenalties.c2 || 0;
      if (m.akaPenalties.hansoku) totalHansoku++;
    }
    if (m.aoPenalties) {
      totalC1 += m.aoPenalties.c1 || 0;
      totalC2 += m.aoPenalties.c2 || 0;
      if (m.aoPenalties.hansoku) totalHansoku++;
    }
    if (m.akaSenshu) totalSenshu++;
    if (m.aoSenshu) totalSenshu++;
  });

  const penaltyFrequencies = [
    { name: 'C1 Technical (Pukulan Keras/Kasar)', value: totalC1, color: '#f43f5e' },
    { name: 'C2 Activity (Keluar Arena/Pelukan)', value: totalC2, color: '#f97316' },
    { name: 'Hansoku (Disdiskualifikasi Mutlak)', value: totalHansoku, color: '#991b1b' },
    { name: 'Senshu (Dominasi Poin Pertama)', value: totalSenshu, color: '#3b82f6' }
  ];

  const totalActions = totalC1 + totalC2 + totalHansoku + totalSenshu;

  // Pie colors helper
  const COLORS = ['#f43f5e', '#f97316', '#be123c', '#3b82f6'];

  // Radar metrics of dojo performance
  const top3Dojos = dojoPointsData.slice(0, 3);
  const radarData = top3Dojos.map((d, index) => {
    // Find medals count for this Dojo
    let golds = 0;
    let silvers = 0;
    participants.filter(p => p.club === d.club).forEach(p => {
      // Approximate victories count representing standard high performer
      const wonMatches = matches.filter(m => m.isCompleted && m.winnerId === p.id);
      if (wonMatches.length >= 3) golds++;
      else if (wonMatches.length === 2) silvers++;
    });

    return {
      name: d.club,
      PointScored: d.pointsScored * 5, // scaled for radar visibility
      Athletes: d.athleteCount * 12,
      MatchesPlayed: d.matchesPlayed * 15,
      PerformanceRatio: (golds * 25) + 30
    };
  });

  return (
    <div className="space-y-6" id="visualisasi-kinerja-flow">
      {/* HEADER HERO WIDGET */}
      <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="text-rose-500 h-5 w-5" />
            Arena Analytics &amp; Visualisasi Kinerja Turnamen
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Analisis data taktis perolehan skor, profil kemenangan atlet, dan statistik pelanggaran juri (WKF Standard compliant).
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0 overflow-x-auto">
          {[
            { id: 'overview', label: 'Ringkasan Kinerja', icon: Trophy },
            { id: 'dojos', label: 'Skor Dojo/Daftar', icon: Award },
            { id: 'athletes', label: 'Distribusi Atlet', icon: Users },
            { id: 'penalties', label: 'Log Pelanggaran', icon: ShieldAlert }
          ].map(btn => {
            const Icon = btn.icon;
            const active = activeVisualization === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setActiveVisualization(btn.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  active 
                    ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 bg-slate-950/30'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* QUICK SUMMARY METADATA BENTO GRIDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Pukulan/Poin Masuk</p>
              <h4 className="text-2xl font-black text-rose-500 mt-1">
                {dojoPointsData.reduce((acc, curr) => acc + curr.pointsScored, 0)}
              </h4>
            </div>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400"><Zap className="h-4 w-4" /></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">Senshu + Ippon + WazaAri + Yuko</p>
        </div>

        <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Akurasi Wasit / Pelanggaran</p>
              <h4 className="text-2xl font-black text-amber-500 mt-1">{totalC1 + totalC2}</h4>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Scale className="h-4 w-4" /></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">Total sanksi dicatat di arena</p>
        </div>

        <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sanksi Hansoku (Diskualifikasi)</p>
              <h4 className="text-2xl font-black text-red-600 mt-1">{totalHansoku}</h4>
            </div>
            <div className="p-2 bg-red-600/10 rounded-lg text-red-500"><ShieldAlert className="h-4 w-4" /></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">Pelanggaran kategori fatal &amp; KO</p>
        </div>

        <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Keuntungan Senshu</p>
              <h4 className="text-2xl font-black text-blue-500 mt-1">{totalSenshu}</h4>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Sword className="h-4 w-4" /></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">Pencetak poin pertama di partai kumite</p>
        </div>
      </div>

      {/* RENDER DYNAMIC VISUAL SECTION */}
      
      {activeVisualization === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="overview-charts-layout">
          
          {/* LEFT COLUMN: BAR CHART TO SHOW DOJO POINTS SCURED */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-855 col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="text-rose-500 h-4 w-4" /> Produktivitas Poin / Skor Tanding per Dojo (Top 10)
                </h4>
                <p className="text-[10px] text-slate-400">Total poin yang berhasil dikumpulkan oleh masing-masing perguruan dlm sirkuit tanding.</p>
              </div>
            </div>

            <div className="h-72 w-full text-xs font-semibold">
              {dojoPointsData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500">Belum ada tanding selesai dilaksanakan.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dojoPointsData.slice(0, 10)} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252528" />
                    <XAxis dataKey="club" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#f8fafc' }} />
                    <Bar name="Poin Masuk (Offensive Output)" dataKey="pointsScored" fill="#ef4444" radius={[4, 4, 0, 0]}>
                      {dojoPointsData.slice(0, 10).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#f43f5e' : index === 1 ? '#e11d48' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: DONUT PIE CHART TO SHOW PENALTY ALLOCATIONS */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-855 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <PieChartIcon className="text-indigo-400 h-4 w-4" /> Komparasi Sanksi &amp; Keuntungan Arena
              </h4>
              <p className="text-[10px] text-slate-400 mb-4">Distribusi total pelanggaran C1, C2, diskualifikasi, serta Senshu.</p>
            </div>

            <div className="h-48 w-full flex items-center justify-center">
              {totalActions === 0 ? (
                <div className="text-xs text-slate-550">Belum ada sanksi dicatatkan wasit</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={penaltyFrequencies}
                      cx="55%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {penaltyFrequencies.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="space-y-1.5 mt-2">
              {penaltyFrequencies.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate max-w-[170px]">{item.name}</span>
                  </div>
                  <span className="text-slate-250 font-mono">{item.value}x ({totalActions > 0 ? Math.round((item.value / totalActions) * 100) : 0}%)</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeVisualization === 'dojos' && (
        <div className="space-y-6" id="view-dojo-performance">
          {/* DOJO PERFORMANCE METRICS TABLE */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-855">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">Statistik Ofensif &amp; Defensif Perguruan Tinggi/Dojo</h4>
            <p className="text-[10px] text-slate-400 mb-6">Penilaian rasio kekuatan poin per partai pertandingan dari masing-masing kontingen.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="col-span-2 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-450 font-black uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Nama Dojo</th>
                      <th className="py-2.5 px-3 text-center">Total Atlet</th>
                      <th className="py-2.5 px-3 text-center">Partai Berjalan</th>
                      <th className="py-2.5 px-3 text-center text-rose-500">Nilai Skor Masuk</th>
                      <th className="py-2.5 px-3 text-center text-indigo-400">Rata Poin Per Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 font-medium">
                    {dojoPointsData.map((d, index) => (
                      <tr key={index} className="hover:bg-slate-900/40 text-slate-300">
                        <td className="py-3 px-3 font-bold text-slate-200">{d.club}</td>
                        <td className="py-3 px-3 text-center text-slate-400">{d.athleteCount} atlet</td>
                        <td className="py-3 px-3 text-center text-slate-400">{d.matchesPlayed || '-'} m</td>
                        <td className="py-3 px-3 text-center text-rose-400 font-extrabold text-sm">{d.pointsScored} pts</td>
                        <td className="py-3 px-3 text-center">
                          <span className="bg-indigo-950/50 text-indigo-400 px-2.5 py-1 rounded border border-indigo-900/20 font-mono font-bold">
                            {d.pointsPerMatch}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {dojoPointsData.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-500 text-xs">Belum ada kejuaraan tanding aktif.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ROTATIONAL MULTI-DIMENSION RADAR OF TOP DOJOS */}
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl relative flex flex-col items-center">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-4">Peta Kekuatan Kontingen Top 3</h5>
                <div className="h-56 w-full text-xs font-bold">
                  {top3Dojos.length < 2 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 text-[10px] text-center">
                      Butuh minimal 2 dojo bertanding untuk memperlihatkan radar multiparameter.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="#2c2c2f" />
                        <PolarAngleAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 9 }} />
                        <PolarRadiusAxis stroke="#64748b" tick={{ fontSize: 8 }} />
                        <Radar name="Poin Ofensif" dataKey="PointScored" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
                        <Radar name="Intensitas Skuad" dataKey="Athletes" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                        <Radar name="Tingkat Kompetisi" dataKey="MatchesPlayed" stroke="#eab308" fill="#eab308" fillOpacity={0.15} />
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '10px' }} />
                        <Legend wrapperStyle={{ fontSize: 9, paddingTop: 10 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeVisualization === 'athletes' && (
        <div className="space-y-6" id="view-athletes-distribution">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* DISTRIBUTIONS ANALYSIS PANEL */}
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-855 col-span-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">Sebaran Dominasi Atlet (Win-Loss Distribution)</h4>
              <p className="text-[10px] text-slate-400 mb-6">Grafik di bawah menggambarkan tren kemajuan pencapaian kemenangan atlet terdaftar di arena.</p>

              <div className="h-64 w-full text-xs font-bold">
                {athleteStatsList.filter(a => a.played > 0).length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-550">Belum ada partai tanding diselesaikan</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={winDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#252528" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
                      <Area type="monotone" name="Jumlah Atlet" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
                {winDistribution.map(dist => (
                  <div key={dist.name} className="p-3 bg-slate-950/80 border border-slate-900 rounded-lg">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{dist.name}</p>
                    <h5 className="text-lg font-black text-white mt-1">{dist.count} Atlet</h5>
                    <p className="text-[9px] text-slate-500 mt-1 leading-normal italic">{dist.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* TOP INDIVIDUAL PERFORMERS OF THE TOURNAMENT */}
            <div className="bg-slate-950/65 p-5 rounded-2xl border border-slate-855 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Trophy className="text-yellow-500 h-4 w-4" /> Bintang Tatami (Top Athletes)
                </h4>
                <p className="text-[10px] text-slate-500 mb-4">Atlet dengan performansi ofensif &amp; kemenangan tertinggi di turnamen.</p>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
                {eliteAthletes.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-550 italic py-12">Belum ada catatan tanding</div>
                ) : (
                  eliteAthletes.map((ath, idx) => (
                    <div key={ath.id} className="flex justify-between items-center bg-slate-950 border border-slate-900 p-2.5 rounded-xl hover:border-slate-800 transition">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black h-5 w-5 rounded-full bg-slate-900 text-amber-500 border border-slate-800 flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-slate-250 truncate">{ath.name}</p>
                          <p className="text-[9px] text-slate-500 uppercase tracking-tight">{ath.club}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-rose-500">{ath.won} W - {ath.lost} L</p>
                        <p className="text-[8px] text-indigo-400 font-mono font-bold mt-0.5">{ath.totalPoints} Pts (Max {ath.highestScore})</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeVisualization === 'penalties' && (
        <div className="bg-slate-950/65 p-5 rounded-2xl border border-slate-855">
          <div className="flex items-start gap-3 border-b border-slate-900 pb-4 mb-4">
            <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400"><ShieldAlert className="h-5 w-5" /></div>
            <div>
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest">Matriks Penilaian Disiplin &amp; Pelanggaran (Rules)</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Analisis tren pelanggaran berdasarkan Standard WKF (World Karate Federation) untuk Kategori Kumite.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-900/50 border border-slate-850 rounded-xl text-slate-300 space-y-1">
                <h5 className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                  Kategori 1 (C1): Pelanggaran Kontak Teknis
                </h5>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Mencakup teknik pukulan/tendangan berlebihan (excessive contact) yang menyebabkan cidera lawan, serangan membabi buta, serangan ke tenggorokan, alat vital, atau sapuan sapu kaki berbahaya.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/50 border border-slate-850 rounded-xl text-slate-300 space-y-1">
                <h5 className="text-[11px] font-bold text-orange-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  Kategori 2 (C2): Pelanggaran Perilaku &amp; Kontrol Arena
                </h5>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Mencakup berpura-pura cedera (feigning injury), keluar arena tanpa alasan (jogai), memeluk, mendorong, membuang-buang waktu pertandingan, atau selebrasi berlebih, serta mengabaikan instruksi wasit dewan juri.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/50 border border-slate-850 rounded-xl text-slate-300 space-y-1">
                <h5 className="text-[11px] font-bold text-red-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-red-700 rounded-full" />
                  Hansoku: Diskualifikasi Otomatis
                </h5>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Diberikan atas akumulasi sanksi berat (4x penalti kategori), tindakan kasar melanggar etika karateka, atau pencederaan fatal lawan yang diinstruksikan oleh dewan juri/kepala wasit tatami secara mutlak.
                </p>
              </div>
            </div>

            <div className="space-y-4 bg-slate-950 p-4 border border-slate-900 rounded-2xl">
              <div className="flex justify-between items-center text-[10px] tracking-wide text-slate-400 font-bold">
                <span>Rasio Kepatuhan Arena Juri</span>
                <span className="text-slate-300 font-mono">Frek. Pelanggaran: {totalC1 + totalC2} kali</span>
              </div>

              <div className="space-y-3.5">
                {[
                  { name: 'Peringatan Kontak Pukulan Keras (C1)', count: totalC1, fill: 'bg-rose-505', color: '#f43f5e' },
                  { name: 'Keluar Arena Matras / Jogai (C2)', count: totalC2, fill: 'bg-orange-500', color: '#f97316' },
                  { name: 'Hansoku (Pelanggaran Karakter)', count: totalHansoku, fill: 'bg-red-800', color: '#991b1b' }
                ].map(item => {
                  const maxVal = Math.max(totalC1, totalC2, totalHansoku, 1);
                  const widthPct = Math.round((item.count / maxVal) * 100);
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-400">{item.name}</span>
                        <span className="text-white font-mono">{item.count} Kejadian</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-900 border border-slate-850 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${widthPct}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] text-slate-500 font-bold leading-normal text-center italic mt-2">
                *Tercatat dari semua kategori karateka yang melangsungkan pertarungan aktif di seluruh arena tatami.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
