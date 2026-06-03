import React, { useState } from 'react';
import { Participant, Category } from '../types';
import { 
  Search, CheckCircle, AlertTriangle, UserCheck, Scale, ShieldAlert,
  QrCode, Smartphone, Copy, ExternalLink, Printer, X, Sparkles, CheckSquare
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import SelfServicePortal from './SelfServicePortal';

interface AbsensiViewProps {
  participants: Participant[];
  categories: Category[];
  onUpdateParticipant: (updated: Participant) => void;
  onAddParticipant?: (newAthlete: Participant) => void;
}

export default function AbsensiView({ participants, categories, onUpdateParticipant, onAddParticipant }: AbsensiViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('Semua');
  const [filterDojo, setFilterDojo] = useState('Semua');

  // QR Code State
  const [qrType, setQrType] = useState<'presensi' | 'registrasi'>('presensi');
  const [copied, setCopied] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showPrintFlyer, setShowPrintFlyer] = useState(false);

  // Extract unique dojos and divisions for filtering
  const dojos = ['Semua', ...Array.from(new Set(participants.map(p => p.club)))];
  const divisions = ['Semua', ...Array.from(new Set(participants.map(p => p.division)))];

  const handleToggleCheckIn = (p: Participant) => {
    const isCheckedIn = !p.isCheckedIn;
    // Auto calculate weigh-in state if weight is entered
    let weighInStatus = p.weighInStatus;
    if (isCheckedIn && p.weight && p.actualWeight) {
      weighInStatus = checkWeighStatus(p.division, p.actualWeight);
    }

    onUpdateParticipant({
      ...p,
      isCheckedIn,
      weighInStatus: isCheckedIn ? weighInStatus : undefined
    });
  };

  const handleWeightChange = (p: Participant, val: string) => {
    const weightNum = parseFloat(val);
    if (!isNaN(weightNum) && weightNum > 0) {
      const status = checkWeighStatus(p.division, weightNum);
      onUpdateParticipant({
        ...p,
        actualWeight: weightNum,
        weighInStatus: status
      });
    } else {
      onUpdateParticipant({
        ...p,
        actualWeight: undefined,
        weighInStatus: undefined
      });
    }
  };

  const checkWeighStatus = (division: string, actual: number): 'Pass' | 'Overweight' | 'Underweight' => {
    const matchUnder = division.match(/-(\d+)/);
    const matchOver = division.match(/\+(\d+)/);
    
    if (matchUnder) {
      const threshold = parseFloat(matchUnder[1]);
      return actual <= threshold ? 'Pass' : 'Overweight';
    } else if (matchOver) {
      const threshold = parseFloat(matchOver[1]);
      return actual >= threshold ? 'Pass' : 'Underweight';
    }
    return 'Pass'; 
  };

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.club.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'Semua' || p.division === filterClass;
    const matchesDojo = filterDojo === 'Semua' || p.club === filterDojo;
    return matchesSearch && matchesClass && matchesDojo;
  });

  const totalRegistered = participants.length;
  const presentCount = participants.filter(p => p.isCheckedIn).length;
  const absentCount = totalRegistered - presentCount;
  const passWeighIn = participants.filter(p => p.isCheckedIn && p.weighInStatus === 'Pass').length;
  const overweightCount = participants.filter(p => p.isCheckedIn && p.weighInStatus === 'Overweight').length;

  // Dynamic origin or custom default if inside sandbox iframe
  const baseUrl = window.location.origin + window.location.pathname;
  const qrUrl = qrType === 'presensi' 
    ? `${baseUrl}?presensi=atlet` 
    : `${baseUrl}?register=new`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerFlyerPrint = () => {
    setShowPrintFlyer(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-6" id="absensi-panel">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Terdaftar</p>
            <p className="text-2xl font-black text-white mt-1">{totalRegistered} <span className="text-xs font-normal text-slate-400">Atlet</span></p>
          </div>
          <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Scale className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Presensi Hadir</p>
            <p className="text-2xl font-black text-emerald-500 mt-1">{presentCount} <span className="text-xs font-normal text-slate-400">Atlet</span></p>
          </div>
          <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Lulus Timbang Badan</p>
            <p className="text-2xl font-black text-blue-400 mt-1">{passWeighIn} <span className="text-xs font-normal text-slate-400">Atlet</span></p>
          </div>
          <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 border border-blue-500/20">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overweight / Gugur</p>
            <p className="text-2xl font-black text-rose-500 mt-1">{overweightCount} <span className="text-xs font-normal text-slate-400">Atlet</span></p>
          </div>
          <div className="h-10 w-10 bg-rose-500/10 rounded-lg flex items-center justify-center text-rose-400 border border-rose-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Responsive Grid layout for Main Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT TWO COLUMNS: SEARCH AND THE MAIN LIST */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Cari nama atau dojo atlet..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Klub / Dojo:</span>
                <select
                  value={filterDojo}
                  onChange={e => setFilterDojo(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs text-white p-2 rounded-lg focus:outline-none"
                >
                  {dojos.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Divisi:</span>
                <select
                  value={filterClass}
                  onChange={e => setFilterClass(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs text-white p-2 rounded-lg focus:outline-none"
                >
                  {divisions.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 text-xs font-bold uppercase">
                    <th className="py-3.5 px-4 w-[160px]">Status Absensi</th>
                    <th className="py-3.5 px-4">Nama Karateka</th>
                    <th className="py-3.5 px-4">Dojo / Kontingen</th>
                    <th className="py-3.5 px-4">Kelas Division</th>
                    <th className="py-3.5 px-4 text-center w-[160px]">Target vs Timbang</th>
                    <th className="py-3.5 px-4 text-center w-[160px]">Status Timbang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-sm">
                  {filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-500 text-xs">
                        Tidak ada peserta yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredParticipants.map(p => {
                      const isChecked = p.isCheckedIn || false;
                      const weightTarget = p.weight || '-';
                      
                      return (
                        <tr key={p.id} className={`hover:bg-slate-900/40 transition-colors ${isChecked ? 'bg-indigo-950/10' : ''}`}>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleCheckIn(p)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold w-full justify-center border transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 font-black'
                                  : 'bg-slate-900 text-slate-450 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              {isChecked ? 'Hadir ✔' : 'Absen'}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 font-bold text-slate-100">{p.name}</td>
                          
                          <td className="py-3.5 px-4 text-slate-300 font-semibold text-xs">{p.club}</td>
                          
                          <td className="py-3.5 px-4 text-xs text-indigo-400 font-bold">{p.division}</td>
                          
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-[10px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 font-mono">
                                {weightTarget}kg
                              </span>
                              <span className="text-slate-500 text-xs">➔</span>
                              <input
                                type="number"
                                step="0.1"
                                disabled={!isChecked}
                                placeholder="0.0"
                                value={p.actualWeight !== undefined ? p.actualWeight : ''}
                                onChange={e => handleWeightChange(p, e.target.value)}
                                className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-center text-xs font-bold text-white focus:outline-none focus:border-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed"
                              />
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {!isChecked ? (
                              <span className="text-xs text-slate-500">-</span>
                            ) : p.weighInStatus === 'Pass' ? (
                              <span className="inline-flex items-center gap-1 text-[9px] uppercase font-extrabold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">
                                <CheckCircle className="h-3 w-3" /> LULUS / PASS
                              </span>
                            ) : p.weighInStatus === 'Overweight' ? (
                              <span className="inline-flex items-center gap-1 text-[9px] uppercase font-extrabold bg-rose-500/20 text-rose-450 px-2 py-1 rounded border border-rose-500/30 animate-pulse">
                                <AlertTriangle className="h-3 w-3" /> OVERWEIGHT
                              </span>
                            ) : p.weighInStatus === 'Underweight' ? (
                              <span className="inline-flex items-center gap-1 text-[9px] uppercase font-extrabold bg-amber-500/20 text-amber-400 px-2 py-1 rounded border border-amber-500/30 animate-pulse">
                                <AlertTriangle className="h-3 w-3" /> UNDERWEIGHT
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500 font-semibold italic">Belum Ditimbang</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HANDS-FREE AUTOMATION SELF PRESENSI (QR CODE WIDGET) */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-slate-950/70 p-5 rounded-2xl border border-indigo-500/20 shadow-xl space-y-4 relative overflow-hidden">
            {/* Ambient subtle gradient glow background */}
            <div className="absolute top-0 right-0 h-28 w-28 bg-indigo-500/10 rounded-full filter blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <QrCode className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">QR Presensi Mandiri</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Sistem Absensi Kehadiran Tanpa Kontak</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tampilkan QR Code ini di meja penimbangan badan atau meja registrasi atlet. Peserta dapat memindainya menggunakan ponsel mereka untuk langsung mengisi database kehadiran.
            </p>

            {/* QR Selector Tab Option */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-900/60 p-1 rounded-lg border border-slate-850">
              <button
                onClick={() => setQrType('presensi')}
                className={`py-1.5 text-[10px] uppercase tracking-wider font-extrabold rounded ${
                  qrType === 'presensi' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white transition'
                }`}
              >
                Absensi Mandiri
              </button>
              <button
                onClick={() => setQrType('registrasi')}
                className={`py-1.5 text-[10px] uppercase tracking-wider font-extrabold rounded ${
                  qrType === 'registrasi' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white transition'
                }`}
              >
                Registrasi Baru
              </button>
            </div>

            {/* Render vector QR Code purely offline securely */}
            <div className="bg-white p-4 rounded-2xl w-44 h-44 mx-auto flex items-center justify-center shadow-lg border-4 border-slate-900">
              <QRCodeSVG 
                value={qrUrl} 
                size={144} 
                level="Q" 
                includeMargin={false}
                fgColor="#020617" // slate-950
              />
            </div>

            {/* URL display & interactive buttons */}
            <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 text-center space-y-2">
              <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Tautan QR Aktif:</p>
              <div className="text-[11px] font-mono text-indigo-300 truncate tracking-tight break-all border-b border-slate-800 pb-2 px-1">
                {qrUrl}
              </div>
              
              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  onClick={handleCopyLink}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-750 text-xs py-2 rounded-lg text-slate-200 font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5 text-indigo-400" />
                  {copied ? 'Tersalin! ✔' : 'Salin Tautan'}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowSimulator(true)}
                    className="bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/20 text-[11px] py-1.5 py-2 rounded-lg text-indigo-350 font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    Uji Simulator
                  </button>

                  <button
                    onClick={triggerFlyerPrint}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] py-1.5 py-2 rounded-lg text-slate-300 font-bold transition flex items-center justify-center gap-1"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Cetak Flyer Desk
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-zinc-500 text-center leading-relaxed">
              *Tautan absensi mandiri terintegrasi langsung dengan database lokal. Diperlukan satu subnet WiFi / internet untuk penggunaan offline terintegrasi.
            </div>
          </div>
        </div>
      </div>

      {/* SMARTPHONE DEVICE FRAMED SIMULATOR MODAL */}
      {showSimulator && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border-8 border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden aspect-[9/19.5] flex flex-col">
            {/* Camera speaker bezel indicator */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-full z-20 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-950 rounded-full mb-1"></div>
            </div>

            {/* Close button outside standard mobile app view */}
            <button
              onClick={() => setShowSimulator(false)}
              className="absolute top-4 right-4 z-30 p-1.5 bg-slate-950/80 text-rose-500 hover:text-rose-400 rounded-full border border-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Screen Inner */}
            <div className="flex-1 overflow-y-auto pt-6 scrollbar-none">
              <SelfServicePortal 
                participants={participants} 
                onUpdateParticipant={(updated) => {
                  onUpdateParticipant(updated);
                }} 
                onAddParticipant={onAddParticipant}
              />
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN IN WEB VIEW - ACTIVE ONLY FOR HIGH QUALITY Desk QR Flyer PRINTING */}
      {showPrintFlyer && (
        <div className="hidden print:block bg-white text-slate-950 p-12 text-center border-12 border-slate-950 min-h-screen relative font-sans">
          
          <div className="space-y-6 pt-10">
            <h1 className="text-lg font-black tracking-widest text-slate-900 uppercase">
              FEDERASI OLAHRAGA KARATE-DO INDONESIA (FORKI) SUMBAR
            </h1>
            <div className="h-1 bg-slate-900 w-32 mx-auto"></div>
            
            <h2 className="text-3xl font-black uppercase text-slate-950 tracking-wider">
              PORTAL PRESENSI MANDIRI ATLET
            </h2>
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-widest">
              KEJURDA KARATE FORKI SUMBAR 2026 • KABUPATEN PASAMAN
            </p>
          </div>

          <div className="my-[40px] bg-slate-50 border-4 border-slate-800 inline-block p-10 rounded-3xl shadow-md">
            <QRCodeSVG 
              value={qrUrl} 
              size={240} 
              level="H" 
              includeMargin={false}
              fgColor="#000000"
            />
          </div>

          <div className="max-w-xl mx-auto space-y-6 text-slate-800 text-center">
            <p className="text-md font-bold text-slate-900 leading-relaxed">
              👉 Silakan arahkan kamera smartphone Anda ke kode QR diatas untuk membuka Portal Presensi & Weigh-In atlet secara elektronik.
            </p>
            
            <ul className="text-sm space-y-2 text-left bg-slate-50 p-6 rounded-xl border border-slate-200 max-w-md mx-auto leading-normal">
              <li className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <span>Pindai Kode QR ini dengan handphone Anda.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <span>Ketik nama Anda di kolom pencarian.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <span>Klik <strong>"Hadir"</strong> & masukkan berat badan timbang aktual Anda.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">4</span>
                <span>Selesai! Database monitor panitia ter-update otomatis.</span>
              </li>
            </ul>
          </div>

          <p className="text-[10px] text-slate-400 absolute bottom-6 inset-x-0 tracking-widest uppercase">
            FORKI SUMBAR DIGITAL PERSIDANGAN PANITIA LAPORAN • CETAK OTOMATIS
          </p>
        </div>
      )}
    </div>
  );
}
