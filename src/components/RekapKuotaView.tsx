import React from 'react';
import { Participant, Category } from '../types';
import { Layers, Check, ShieldCheck } from 'lucide-react';

interface RekapKuotaViewProps {
  participants: Participant[];
  categories: Category[];
}

export default function RekapKuotaView({ participants, categories }: RekapKuotaViewProps) {
  
  // Calculate registration levels for active category groups
  const quotaCategories = categories.map(cat => {
    const activeRegistrationCount = cat.participantIds.length;
    
    // Choose pool limit based on bracket config (e.g., Single/Double usually 16, Group usually 8)
    const quotaLimit = cat.bracketType === 'Single' || cat.bracketType === 'Double' ? 16 : 8;
    const progressPercent = Math.round((activeRegistrationCount / quotaLimit) * 100);

    return {
      id: cat.id,
      name: cat.name,
      current: activeRegistrationCount,
      limit: quotaLimit,
      percentage: progressPercent,
      categoryType: cat.categoryType,
      ageGroup: cat.ageGroup
    };
  });

  return (
    <div className="space-y-6" id="kuota-rekap-panel">
      {/* Overview stats */}
      <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 uppercase">
            <Layers className="text-rose-500" /> Pengawasan Kuota Kelompok Tanding (Faksi Limit)
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Membatasi jumlah karateka terdaftar per kelas untuk menjamin kelayakan rapihnya bagan pertandingan. Kuota standar: 
            <strong> 16 Atlit</strong> untuk Bagan Gugur and <strong>8 Atlit</strong> untuk Group Stage kualifikasi.
          </p>
        </div>
      </div>

      {/* Quota limit progress list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quotaCategories.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center col-span-full">Belum ada kategori dibentuk.</p>
        ) : (
          quotaCategories.map(item => {
            const isFull = item.current >= item.limit;

            return (
              <div key={item.id} className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-slate-200 line-clamp-1 truncate">{item.name}</h4>
                    <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400 mt-1 inline-block">
                      {item.ageGroup} • {item.categoryType}
                    </span>
                  </div>

                  <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${
                    isFull
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {isFull ? 'CLOSED' : 'OPEN'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="w-full h-3 bg-slate-900 border border-slate-850 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${isFull ? 'bg-rose-600' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[11px] font-medium text-slate-400">
                    <span>Terdaftar: <strong>{item.current}</strong> dari max <strong>{item.limit}</strong></span>
                    <span className="font-bold text-white">{item.percentage}%</span>
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
