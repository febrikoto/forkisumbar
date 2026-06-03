import React, { useState, useEffect } from 'react';
import { Participant } from '../types';
import { FileBadge, Award, Printer } from 'lucide-react';

interface SertifikatViewProps {
  participants: Participant[];
}

export default function SertifikatView({ participants }: SertifikatViewProps) {
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [prize, setPrize] = useState('Juara I (Emas)');
  const [categoryName, setCategoryName] = useState('-60kg Putra Senior Kumite');
  const [chairman, setChairman] = useState('Khairuddin Simanjuntak');
  const [awardDate, setAwardDate] = useState('28 Juni 2026');
  const [cityPrefix, setCityPrefix] = useState('Kab. Pasaman');

  useEffect(() => {
    const saved = localStorage.getItem('karate_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.venue) {
          const firstPart = parsed.venue.split(/[,-]/)[0].trim();
          setCityPrefix(firstPart || 'Kab. Pasaman');
        }
        if (parsed.date) {
          const parts = parsed.date.split(/\s+s\.d\s+/i);
          if (parts.length > 1) {
            setAwardDate(parts[1]);
          } else {
            setAwardDate(parsed.date);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const selectedAthlete = participants.find(p => p.id === selectedAthleteId);

  const handlePrintCertificate = () => {
    if (!selectedAthleteId) {
      return alert('Harap pilih nama karateka penerima sertifikat!');
    }
    window.print();
  };

  return (
    <div className="space-y-6" id="sertifikat-panel">
      {/* Settings control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch print:hidden">
        
        {/* Editor (Left column) */}
        <div className="lg:col-span-5 bg-slate-950/70 p-5 rounded-xl border border-slate-800 h-fit space-y-4">
          <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5 border-b border-slate-850 pb-2">
            <Award className="text-rose-500 h-5 w-5" /> Cetak Piagam/Sertifikat Juara
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Pilih Atlet *</label>
            <select
              value={selectedAthleteId}
              onChange={e => setSelectedAthleteId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-650"
            >
              <option value="">-- Pilih Atlet Penerima --</option>
              {participants.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.club})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Gelar Juara</label>
              <input
                type="text"
                value={prize}
                onChange={e => setPrize(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Kelas Tanding</label>
              <input
                type="text"
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Tanggal Piagam</label>
              <input
                type="text"
                value={awardDate}
                onChange={e => setAwardDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Ketua Dewan Panitia</label>
              <input
                type="text"
                value={chairman}
                onChange={e => setChairman(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handlePrintCertificate}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 shadow shadow-emerald-950/40 cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Cetak Lembar Sertifikat
          </button>
        </div>

        {/* Certificate Mockup Canvas (Right column) */}
        <div className="lg:col-span-7 bg-slate-950/40 border border-slate-850 p-6 rounded-xl flex items-center justify-center">
          {selectedAthleteId ? (
            <div className="border-[12px] border-amber-500/30 p-8 w-full max-w-xl bg-white text-neutral-900 font-serif text-center space-y-6 relative rounded-none shadow-2xl">
              <div className="absolute top-4 left-4 border border-amber-600/30 text-[9px] px-1 font-sans text-amber-600/60 uppercase">FORKINDO</div>
              <div className="absolute top-4 right-4 border border-indigo-650/30 text-[9px] px-1 font-sans text-indigo-400 uppercase">OFFICIAL CERTIFICATE</div>
              
              <div className="space-y-1.5">
                <FileBadge className="h-10 w-10 text-amber-500 mx-auto" />
                <h2 className="text-xl font-black uppercase text-neutral-950 tracking-widest font-serif">PIAGAM PENGHARGAAN JUARA</h2>
                <p className="text-[10px] font-sans text-neutral-500 uppercase tracking-widest">Sertifikat Elektronik Keolahragaan Karate Daerah</p>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-sans italic text-neutral-600">Diberikan secara sah kepada:</p>
                <p className="text-2xl font-black text-neutral-950 underline decoration-amber-500 decoration-3 underline-offset-4">{selectedAthlete?.name}</p>
                <p className="text-sm font-bold text-neutral-800 uppercase font-sans tracking-wide">Dojo / Klub: {selectedAthlete?.club}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-sans italic text-neutral-600">Atas prestasi gemilang meraih pencapaian:</p>
                <p className="text-md font-extrabold text-amber-600 uppercase tracking-wide">{prize}</p>
                <p className="text-[11px] font-sans text-neutral-500">Kelas Division: {categoryName}</p>
              </div>

              <div className="grid grid-cols-2 pt-6 text-xs text-neutral-700 font-sans border-t border-neutral-100">
                <div>
                  <p className="text-[10px] text-neutral-400">{cityPrefix}, {awardDate}</p>
                  <p className="font-bold text-neutral-900 mt-6">{chairman}</p>
                  <p className="text-[9px] text-neutral-500">Ketua Umum Pengprov FORKI SUMBAR</p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full border-4 border-amber-500/20 flex items-center justify-center text-[10px] font-black text-amber-500 select-none">
                    SEAL APPROVED
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <FileBadge className="h-16 w-16 text-slate-800 mx-auto mb-3" />
              <p className="text-xs">Silahkan pilih atlet di panel kiri untuk memuat sketsa piagam.</p>
            </div>
          )}
        </div>

      </div>

      {/* PRINT-ONLY ACTUAL LAYOUT OF THE CERTIFICATE FOR PERFECT FORMATTING */}
      {selectedAthlete && (
        <div className="hidden print:block bg-white text-neutral-950 font-serif border-16 border-neutral-950 p-12 text-center h-[297mm] w-[210mm] max-w-full mx-auto relative rounded-none shadow-none">
          <div className="space-y-4 pt-12">
            <h1 className="text-sm font-bold tracking-widest font-sans uppercase">FEDERASI OLAHRAGA KARATE-DO INDONESIA (FORKI) SUMBAR</h1>
            <h2 className="text-3xl font-black uppercase text-black tracking-widest underline underline-offset-8">PIAGAM PENGHARGAAN RESMI</h2>
            <p className="text-xs font-sans text-neutral-500">No Register: Cert/FKD/{Math.floor(Math.random()*10000)}/2026</p>
          </div>

          <div className="py-16 space-y-4">
            <p className="text-sm italic">Piagam kejuaraan olahraga karate diberikan secara terhormat kepada:</p>
            <p className="text-4xl font-extrabold text-black font-serif border-b border-black pb-3 max-w-[500px] mx-auto">{selectedAthlete.name}</p>
            <p className="text-lg font-bold font-sans">Klub / Dojo Asal: {selectedAthlete.club}</p>
          </div>

          <div className="space-y-4 py-8">
            <p className="text-sm italic">Sebagai tanda bukti yang sah atas pencapaian prestasi:</p>
            <p className="text-2xl font-black uppercase text-neutral-900 tracking-wide">{prize}</p>
            <p className="text-sm font-sans font-bold text-neutral-700">Dalam Divisi Pertandingan: {categoryName}</p>
          </div>

          <div className="grid grid-cols-2 pt-16 text-xs gap-12 text-neutral-800 max-w-[600px] mx-auto font-sans">
            <div className="text-center">
              <p>{cityPrefix}, {awardDate}</p>
              <br /><br />
              <p className="font-bold text-black border-t border-neutral-400 pt-2 inline-block px-4">{chairman}</p>
              <p className="text-[10px] text-neutral-500">Ketua Umum Pengprov FORKI SUMBAR</p>
            </div>

            <div className="flex items-center justify-center">
              <div className="border-4 border-black p-4 text-xs font-black text-black">
                PANITIA PELAKSANA APPROVED
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
