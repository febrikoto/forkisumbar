import React, { useState } from 'react';
import { Match, Participant, Category } from '../types';
import { FileDown, Printer, ShieldAlert, FileText, Download } from 'lucide-react';

interface EksporLaporanViewProps {
  matches: Match[];
  participants: Participant[];
  categories: Category[];
}

export default function EksporLaporanView({ matches, participants, categories }: EksporLaporanViewProps) {
  const [exportType, setExportType] = useState('atlet');

  const handlePrint = () => {
    window.print();
  };

  const downloadCSV = () => {
    let headers = '';
    let rows = [];

    if (exportType === 'atlet') {
      headers = 'ID,Nama,Dojo/Kontingen,Gender,Umur,Kelas/Berat Badan,Kategori\n';
      rows = participants.map(p => `"${p.id}","${p.name.replace(/"/g, '""')}","${p.club.replace(/"/g, '""')}","${p.gender}","${p.ageGroup}","${p.division}","${p.categoryType}"`);
    } else if (exportType === 'kategori') {
      headers = 'ID Kategori,Nama Kategori,Tipe,Sistem,Jumlah Atlet\n';
      rows = categories.map(c => `"${c.id}","${c.name.replace(/"/g, '""')}","${c.categoryType}","${c.bracketType}","${c.participantIds.length}"`);
    } else if (exportType === 'Pertandingan') {
      headers = 'Nomor Tanding,Babak,Nama Aka (Merah),Skor Aka,Nama Ao (Biru),Skor Ao,Pemenang\n';
      rows = matches.map(m => {
        const aka = participants.find(p => p.id === m.akaId)?.name || 'TBD';
        const ao = participants.find(p => p.id === m.aoId)?.name || 'TBD';
        const win = participants.find(p => p.id === m.winnerId)?.name || 'TBD';
        return `"${m.matchNumber}","${m.roundName}","${aka.replace(/"/g, '""')}","${m.akaScore}","${ao.replace(/"/g, '""')}","${m.aoScore}","${win.replace(/"/g, '""')}"`;
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `forkindo_laporan_${exportType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="ekspor-laporan-panel">
      {/* Overview */}
      <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
            <FileDown className="text-rose-500" /> Pusat Ekspor Lembar Laporan Pertandingan
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Hasilkan lembar berkas fisik and ekspor berkas data terstruktur (.CSV) dari turnamen karate ini.
            Disediakan untuk penyerahan arsip dewan panitia pelaksana.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40 cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Cetak Seluruh Laporan
          </button>
        </div>
      </div>

      {/* CSV Export tool */}
      <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl">
        <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <FileText className="text-indigo-400 h-4.5 w-4.5" /> Ekspor Basis Data Digital
        </h4>

        <div className="space-y-4">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400 font-bold whitespace-nowrap">Instansi Berkas:</span>
            <div className="flex gap-2">
              {[
                { id: 'atlet', label: 'Database Atlet' },
                { id: 'kategori', label: 'Data Kelas/Kategori' },
                { id: 'Pertandingan', label: 'Hasil Semua Match' },
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setExportType(type.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                    exportType === type.id 
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                      : 'bg-slate-900 border-slate-800 text-slate-450 hover:bg-slate-850'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400">Berkas akan tersimpan dalam ekstensi CSV yang dapat dibuka di Microsoft Excel, Google Sheets, atau aplikasi sejenis.</p>

          <button
            onClick={downloadCSV}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-705 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer"
          >
            <Download className="h-4 w-4 text-indigo-400" /> Ekspor File (.CSV)
          </button>
        </div>
      </div>
    </div>
  );
}
