import React from 'react';
import { Match, Participant, Category } from '../types';
import { Award, Flag, TrendingUp, Trophy } from 'lucide-react';

interface DashboardKontingenViewProps {
  matches: Match[];
  participants: Participant[];
  categories: Category[];
}

interface ClubMedalRow {
  clubName: string;
  gold: number;
  silver: number;
  bronze: number;
  totalAthletes: number;
  points: number; // Gold=5, Silver=3, Bronze=1
}

export default function DashboardKontingenView({ matches, participants, categories }: DashboardKontingenViewProps) {
  
  // Extract all unique clubs / Dojo
  const clubs = Array.from(new Set(participants.map(p => p.club)));

  const clubStandings: ClubMedalRow[] = clubs.map(club => {
    let gold = 0;
    let silver = 0;
    let bronze = 0;

    // Filter participants of this club
    const clubParts = participants.filter(p => p.club === club);
    const clubPartIds = clubParts.map(p => p.id);

    // Calculate medals from completed matches of active category classes
    categories.forEach(cat => {
      const catMatches = matches.filter(m => m.categoryId === cat.id && m.isCompleted);
      
      // 1. Single Elimination Medals
      if (cat.bracketType === 'Single') {
        const finalMatch = catMatches.find(m => m.roundName.includes('Final') && !m.isBronzeMatch);
        if (finalMatch) {
          if (finalMatch.winnerId && clubPartIds.includes(finalMatch.winnerId)) {
            gold++;
          }
          const loserId = finalMatch.winnerId === finalMatch.akaId ? finalMatch.aoId : finalMatch.akaId;
          if (loserId && clubPartIds.includes(loserId)) {
            silver++;
          }
        }

        const bronzeMatch = catMatches.find(m => m.isBronzeMatch);
        if (bronzeMatch && bronzeMatch.winnerId && clubPartIds.includes(bronzeMatch.winnerId)) {
          bronze++;
        }
      }

      // 2. Double Elimination Medals
      else if (cat.bracketType === 'Double') {
        const grandFinal = catMatches.find(m => m.roundName.includes('Grand Final'));
        if (grandFinal) {
          if (grandFinal.winnerId && clubPartIds.includes(grandFinal.winnerId)) {
            gold++;
          }
          const loserId = grandFinal.winnerId === grandFinal.akaId ? grandFinal.aoId : grandFinal.akaId;
          if (loserId && clubPartIds.includes(loserId)) {
            silver++;
          }
        }
      }

      // 3. Round Robin / Group Stage
      else if (cat.bracketType === 'RoundRobin' || cat.bracketType === 'Group') {
        // Simple mock winners based on match completions
        const catWinners = catMatches.filter(m => m.winnerId !== null);
        if (catWinners.length > 0) {
          const goldWinnerId = catWinners[catWinners.length - 1]?.winnerId;
          if (goldWinnerId && clubPartIds.includes(goldWinnerId)) {
            gold++;
          }
        }
      }
    });

    // Weighted point calculations: Gold=5, Silver=3, Bronze=1
    const points = (gold * 5) + (silver * 3) + (bronze * 1);

    return {
      clubName: club,
      gold,
      silver,
      bronze,
      totalAthletes: clubParts.length,
      points
    };
  });

  // Sort standings by points descending, then by gold descending
  const sortedStandings = clubStandings.sort((a, b) => b.points - a.points || b.gold - a.gold);

  // Highest values for our beautiful pure SVG chart
  const maxPoints = Math.max(...sortedStandings.map(s => s.points), 1);

  return (
    <div className="space-y-6" id="kontingen-view">
      
      {/* Visual Chart Panel */}
      <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-6">
          <TrendingUp className="text-rose-500 h-5 w-5" />
          Kekuatan Perolehan Poin Kontingen Daerah
        </h3>

        {sortedStandings.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Belum ada data atlet terdaftar.</p>
        ) : (
          <div className="space-y-4">
            {sortedStandings.slice(0, 5).map(club => {
              const percentage = Math.round((club.points / maxPoints) * 100);
              return (
                <div key={club.clubName} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">{club.clubName} ({club.totalAthletes} Atlet)</span>
                    <span className="font-extrabold text-amber-400">{club.points} Poin</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-900 border border-slate-850 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-600 to-rose-600 rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tally list Table */}
      <div className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-500" /> Klasemen Juara Umum Kontingen (Medals Table)
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-900 px-2 py-1 rounded border border-slate-800">
            Gold=5pt • Silver=3pt • Bronze=1pt
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-850 text-slate-400 text-xs font-bold uppercase">
              <th className="py-3 px-4 text-center w-12">Peringkat</th>
              <th className="py-3 px-4">Kontingen / Dojo</th>
              <th className="py-3 px-4 text-center">Total Atlet</th>
              <th className="py-3 px-4 text-center text-yellow-500">🏆 Emas (G)</th>
              <th className="py-3 px-4 text-center text-slate-300">🥈 Perak (S)</th>
              <th className="py-3 px-4 text-center text-amber-600">🥉 Perunggu (B)</th>
              <th className="py-3 px-4 text-center text-rose-400">Total Poin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900 text-slate-200 text-sm">
            {sortedStandings.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-500 text-xs">
                  Belum ada klub atau dojo yang terdaftar.
                </td>
              </tr>
            ) : (
              sortedStandings.map((c, idx) => (
                <tr key={c.clubName} className="hover:bg-slate-900/30 transition-colors">
                  <td className="py-3.5 px-4 text-center font-black">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                  </td>
                  <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                    <Flag className="h-4 w-4 text-indigo-400" />
                    {c.clubName}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-400">{c.totalAthletes}</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-yellow-500 bg-yellow-500/5">{c.gold}</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-slate-300 bg-slate-300/5">{c.silver}</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-amber-600 bg-amber-600/5">{c.bronze}</td>
                  <td className="py-3.5 px-4 text-center font-black text-white text-base bg-gradient-to-r from-indigo-950/30 to-rose-950/30">{c.points}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
