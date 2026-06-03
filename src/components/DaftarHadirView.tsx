import React, { useState } from 'react';
import { Participant } from '../types';
import { Printer, Check, Search, Download } from 'lucide-react';

interface DaftarHadirViewProps {
  participants: Participant[];
}

export default function DaftarHadirView({ participants }: DaftarHadirViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const presentAthletes = participants.filter(p => p.isCheckedIn);

  const filtered = presentAthletes.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.club.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.division.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrintList = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="daftar-hadir-panel">
      {/* Header operations */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h3 className="text-sm font-bold text-white uppercase">Daftar Hadir Resmi &amp; Hasil Timbang</h3>
          <p className="text-xs text-slate-400 mt-1">Dokumen resmi pemeriksaan kehadiran and verifikasi timbang berat badan karateka.</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handlePrintList}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Cetak Berkas Sesi
          </button>
        </div>
      </div>

      {/* Printable header */}
      <div className="hidden print:block text-neutral-950 mb-6 font-serif">
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          <h1 className="text-xl font-bold uppercase">DAFTAR HADIR DAN BERKAS LOG TIMBANG BADAN RESMI</h1>
          <h2 className="text-md uppercase mt-1">FORKINDO Karate Championship</h2>
          <p className="text-xs text-neutral-600">Dicetak otomatis: {new Date().toLocaleString('id-ID')}</p>
        </div>
        <div className="grid grid-cols-3 text-xs gap-4 mb-6">
          <div><strong>Total Hadir:</strong> {presentAthletes.length} Atlet</div>
          <div><strong>Lelang Berkas:</strong> Panitia Pelaksana</div>
          <div><strong>Status Dokumen:</strong> SAH / VERIFIED</div>
        </div>
      </div>

      {/* Search and listings table */}
      <div className="space-y-4">
        <div className="relative max-w-xs print:hidden">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Saring atlet hadir..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden print:border-black print:bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 text-xs font-bold uppercase print:bg-neutral-100 print:text-black print:border-black">
                <th className="py-3 px-4 w-[60px] text-center">No</th>
                <th className="py-3 px-4">Nama Karateka</th>
                <th className="py-3 px-4">Federasi / Dojo</th>
                <th className="py-3 px-4">Kelas Pertandingan</th>
                <th className="py-3 px-4 text-center">Kelas Target</th>
                <th className="py-3 px-4 text-center">Timbang Aktual</th>
                <th className="py-3 px-4 text-center">Pencapaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-sm print:divide-black text-slate-200 print:text-black">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500 text-xs">
                    Belum ada atlet yang di-set hadir tanding atau lolos verifikasi timbang.
                  </td>
                </tr>
              ) : (
                filtered.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-900/30 print:hover:bg-white">
                    <td className="py-3 px-4 text-center text-xs font-mono text-slate-400 print:text-black">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold">{p.name}</td>
                    <td className="py-3 px-4 font-medium text-xs text-slate-300 print:text-black">{p.club}</td>
                    <td className="py-3 px-4 text-xs font-bold text-indigo-400 print:text-black">{p.division}</td>
                    <td className="py-3 px-4 text-center text-xs">{p.weight ? `${p.weight} kg` : '-'}</td>
                    <td className="py-3 px-4 text-center text-xs font-bold text-slate-300 print:text-black">{p.actualWeight ? `${p.actualWeight} kg` : '-'}</td>
                    <td className="py-3 px-4 text-center">
                      {p.weighInStatus === 'Pass' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 print:border-black print:text-black">
                          <Check className="h-3 w-3" /> PASSED
                        </span>
                      ) : p.weighInStatus ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 print:border-black print:text-black">
                          {p.weighInStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">verified</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
