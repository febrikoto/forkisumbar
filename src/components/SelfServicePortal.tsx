import React, { useState, useEffect } from 'react';
import { Participant, PaymentSettings } from '../types';
import { 
  UserCheck, Search, Scale, ShieldCheck, HelpCircle, ArrowLeft, 
  RefreshCw, Smartphone, CheckCircle2, AlertTriangle, UserPlus, 
  Tag, Info, Layers, Image as ImageIcon, Upload, Printer
} from 'lucide-react';

interface SelfServicePortalProps {
  participants: Participant[];
  onUpdateParticipant: (updated: Participant) => void;
  onAddParticipant?: (newAthlete: Participant) => void;
  standalone?: boolean;
  paymentSettings?: PaymentSettings;
}

export default function SelfServicePortal({ participants, onUpdateParticipant, onAddParticipant, standalone = false, paymentSettings }: SelfServicePortalProps) {
  // Mode selection: 'presensi' for searching and checking in, 'registrasi' for new athletes
  const [activePortalTab, setActivePortalTab] = useState<'presensi' | 'registrasi'>('presensi');
  
  // Search state for existing athlete
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState<Participant | null>(null);
  const [actualWeightInput, setActualWeightInput] = useState('');
  const [justCompleted, setJustCompleted] = useState(false);

  // New Athlete registration state
  const [regName, setRegName] = useState('');
  const [regClub, setRegClub] = useState('');
  const [regGender, setRegGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [regAgeGroup, setRegAgeGroup] = useState('Senior (18+ Tahun)');
  const [regCategoryType, setRegCategoryType] = useState<'Kata' | 'Kumite'>('Kumite');
  const [regDivision, setRegDivision] = useState('-60kg Putra Senior');
  const [regWeight, setRegWeight] = useState('');
  const [regPhoto, setRegPhoto] = useState<string | null>(null);
  const [regPaymentProof, setRegPaymentProof] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<Participant | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setBase64: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setBase64(canvas.toDataURL('image/jpeg', 0.7));
      };
      if (event.target?.result) {
        img.src = event.target.result.toString();
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (window.location.search.includes('register=new')) {
      setActivePortalTab('registrasi');
    } else {
      setActivePortalTab('presensi');
    }
  }, []);

  // Search filter
  const matches = participants.filter(p => {
    if (!searchTerm.trim()) return false;
    return p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           p.club.toLowerCase().includes(searchTerm.toLowerCase());
  }).slice(0, 5); // Limit suggestions to 5 items for clean mobile viewing

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

  const getWeighLabel = (division: string, actualVal: string) => {
    const num = parseFloat(actualVal);
    if (isNaN(num) || num <= 0) return { label: 'Siap ditimbang', color: 'text-slate-400' };

    const status = checkWeighStatus(division, num);
    const matchUnder = division.match(/-(\d+)/);
    const matchOver = division.match(/\+(\d+)/);
    const limit = matchUnder ? matchUnder[1] : (matchOver ? matchOver[1] : '');

    if (status === 'Pass') {
      return { 
        label: `✓ Lulus Timbang (Di bawah limit ${limit}kg)`, 
        color: 'text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded' 
      };
    } else {
      return { 
        label: `⚠ Overweight (Limit ${limit}kg terlampaui)`, 
        color: 'text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded animate-pulse' 
      };
    }
  };

  const handleSelectAthlete = (p: Participant) => {
    setSelectedAthlete(p);
    setActualWeightInput(p.actualWeight ? p.actualWeight.toString() : '');
    setJustCompleted(false);
  };

  const handleSelfCheckIn = () => {
    if (!selectedAthlete) return;

    let updatedWeight: number | undefined = undefined;
    let computedStatus: 'Pass' | 'Overweight' | 'Underweight' | undefined = undefined;

    const weightNum = parseFloat(actualWeightInput);
    if (!isNaN(weightNum) && weightNum > 0) {
      updatedWeight = weightNum;
      computedStatus = checkWeighStatus(selectedAthlete.division, weightNum);
    }

    const updatedAthlete: Participant = {
      ...selectedAthlete,
      isCheckedIn: true,
      actualWeight: updatedWeight,
      weighInStatus: computedStatus || 'Pass' // Fallback to pass
    };

    onUpdateParticipant(updatedAthlete);
    setSelectedAthlete(updatedAthlete);
    setJustCompleted(true);

    // Refresh parents if any custom trigger needs local state storage
    const customEvent = new CustomEvent('karate_participants_updated', {
      detail: { type: 'checkin', name: selectedAthlete.name }
    });
    window.dispatchEvent(customEvent);
  };

  const handleRegisterNewAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regClub.trim()) {
      alert('Mohon isi nama lengkap dan dojo asal!');
      return;
    }

    const newID = 'p_' + Math.random().toString(36).substr(2, 9);
    const newAthlete: Participant = {
      id: newID,
      name: regName,
      club: regClub,
      gender: regGender,
      ageGroup: regAgeGroup,
      categoryType: regCategoryType,
      division: regDivision,
      photoUrl: regPhoto,
      weight: regWeight || undefined,
      isCheckedIn: false, // Menunggu diverifikasi & checkin fisik
      paymentProofUrl: regPaymentProof || undefined,
      paymentStatus: 'Menunggu Verifikasi',
      verificationStatus: 'Menunggu'
    };

    if (onAddParticipant) {
      onAddParticipant(newAthlete);
    }

    // Capture success state
    setRegSuccess(newAthlete);

    // Trigger local & global event for toaster recognition
    const customEvent = new CustomEvent('karate_participants_updated', {
      detail: { type: 'registration', name: regName, club: regClub }
    });
    window.dispatchEvent(customEvent);
  };

  const resetSelection = () => {
    setSelectedAthlete(null);
    setSearchTerm('');
    setJustCompleted(false);
    setActualWeightInput('');
  };

  const resetRegistrationForm = () => {
    setRegSuccess(null);
    setRegName('');
    setRegClub('');
    setRegWeight('');
    setRegPhoto(null);
    setRegPaymentProof(null);
  };

  return (
    <div className={`w-full max-w-md mx-auto ${standalone ? 'min-h-screen flex flex-col justify-between' : ''} bg-slate-950 text-slate-100 font-sans`} id="self-service-portal-root">
      {/* Header Panel */}
      <div className="bg-slate-900 border-b border-slate-800 p-5 text-center">
        <div className="flex items-center justify-between mb-3">
          {selectedAthlete && (
            <button 
              onClick={resetSelection}
              className="p-1 px-2.5 rounded-lg bg-slate-800 text-xs text-slate-300 flex items-center gap-1.5 hover:bg-slate-700 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali
            </button>
          )}
          {!selectedAthlete && <div className="w-10"></div>}
          <div className="flex items-center gap-1.5 mx-auto">
            <Smartphone className="h-4.5 w-4.5 text-rose-500" />
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Self-Service Portal</span>
          </div>
          <div className="w-10"></div>
        </div>

        <h2 className="text-sm font-black text-white uppercase tracking-wider">
          KEJURDA KARATE FORKI SUMBAR 2026
        </h2>
        <p className="text-[11px] text-zinc-400 mt-1">
          📍 GOR Sasana Pasaman • Layanan Mandiri Atlet
        </p>
      </div>

      {/* Main Body */}
      <div className="flex-1 p-5 space-y-6">
        {/* Toggle Mode headers if no athlete is selected */}
        {!selectedAthlete && (
          <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-850">
            <button
              onClick={() => {
                setActivePortalTab('presensi');
                resetRegistrationForm();
              }}
              className={`py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${
                activePortalTab === 'presensi'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Absensi & Timbang
            </button>
            <button
              onClick={() => {
                setActivePortalTab('registrasi');
                resetSelection();
              }}
              className={`py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${
                activePortalTab === 'registrasi'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pendaftaran Baru
            </button>
          </div>
        )}

        {activePortalTab === 'presensi' ? (
          /* PRESENSI & TIMBANG MODE */
          !selectedAthlete ? (
            /* STEP 1: ATHLETE SEARCH */
            <div className="space-y-4">
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider mb-2">
                  Langkah 1: Cari Nama Anda
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Silakan ketikkan nama lengkap atau dojo Anda untuk melakukan konfirmasi presensi kehadiran dan menimbang berat badan.
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Masukkan nama karateka..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
                  autoFocus
                />
              </div>

              {/* Suggestions list */}
              {searchTerm && (
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-850">
                  {matches.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                      <AlertTriangle className="h-6 w-6 text-amber-500/40" />
                      <span>Tidak menemukan nama yang cocok. <br />Pastikan ejaan nama Anda benar.</span>
                    </div>
                  ) : (
                    matches.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectAthlete(p)}
                        className="w-full p-4 text-left bg-slate-900 hover:bg-slate-850/90 border-b border-slate-850 last:border-0 hover:border-slate-700/50 transition-all duration-200 hover:scale-[1.015] active:scale-[0.99] flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-black text-rose-400 uppercase tracking-wide">{p.club}</p>
                          <p className="text-sm font-bold text-white mt-0.5">{p.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <span>Divisi: {p.division}</span>
                          </p>
                        </div>
                        <div className={`px-2.5 py-1 text-[10px] rounded-full font-bold border ${
                          p.isCheckedIn 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}>
                          {p.isCheckedIn ? 'Hadir ✔' : 'Verifikasi'}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {!searchTerm && (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500 space-y-2">
                  <HelpCircle className="h-8 w-8 text-slate-600 animate-pulse" />
                  <p className="text-xs">Uji sistem presensi ini dengan mengetik nama atlet <br />(seperti "Inkai" atau "Jawa")</p>
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: DETAILS, WEIGH IN & CHECK-IN FORM */
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                      {selectedAthlete.club}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{selectedAthlete.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-slate-400">ID: {selectedAthlete.id}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/50 p-2.5 rounded border border-slate-850">
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Kategori</p>
                    <p className="text-white font-bold mt-0.5">{selectedAthlete.categoryType}</p>
                  </div>
                  <div className="bg-slate-950/50 p-2.5 rounded border border-slate-850">
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Gender</p>
                    <p className="text-white font-bold mt-0.5">{selectedAthlete.gender}</p>
                  </div>
                  <div className="bg-slate-950/50 p-2.5 rounded border border-slate-850 col-span-2">
                    <p className="text-slate-400 text-[10px] uppercase font-bold">Kelas Tanding</p>
                    <p className="text-indigo-400 font-bold mt-0.5">{selectedAthlete.division}</p>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              {justCompleted ? (
                <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/30 text-center space-y-3">
                  <div className="h-12 w-12 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/25">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Presensi Berhasil!</h4>
                    <p className="text-xs text-slate-300">
                      Kehadiran Anda diverifikasi sebagai <strong className="text-emerald-400">HADIR</strong>. Data telah tehubung ke server pusat panitia pelaksana.
                    </p>
                  </div>
                  {selectedAthlete.actualWeight && (
                    <div className="bg-slate-950/70 py-2 px-3 rounded border border-emerald-500/20 max-w-[200px] mx-auto text-xs text-white family-mono">
                      Berat Aktual: <strong className="text-emerald-400">{selectedAthlete.actualWeight} kg</strong> ({selectedAthlete.weighInStatus})
                    </div>
                  )}
                  <button
                    onClick={resetSelection}
                    className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-bold py-2.5 rounded-lg shadow-md transition"
                  >
                    Selesai & Keluar
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Weight Input Box only if Kumite */}
                  {selectedAthlete.categoryType === 'Kumite' && (
                    <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Scale className="h-4 w-4 text-rose-500" /> Timbang Berat Badan Aktual (Actual Weight)
                      </label>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Harap lakukan penimbangan badan mandiri di timbangan resmi. Masukkan hasilnya ke bawah ini untuk verifikasi kelas:
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Contoh: 59.8"
                            value={actualWeightInput}
                            onChange={e => setActualWeightInput(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-sm font-black text-white focus:outline-none focus:border-indigo-500"
                          />
                          <span className="absolute right-3.5 top-3 text-xs text-slate-500 font-bold font-mono">KG</span>
                        </div>
                      </div>
                      {/* Weight Status Validation Label */}
                      <div className="text-center text-xs mt-1">
                        {(() => {
                          const styleInfo = getWeighLabel(selectedAthlete.division, actualWeightInput);
                          return <span className={styleInfo.color}>{styleInfo.label}</span>;
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Submit buttons */}
                  <button
                    type="button"
                    onClick={handleSelfCheckIn}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-xs font-black uppercase text-white py-3.5 rounded-xl shadow-lg border border-rose-500/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-transform"
                  >
                    <UserCheck className="h-4 w-4" /> Simpan & Selesaikan Presensi
                  </button>

                  <p className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-500/70" /> Kode keamanan terenkripsi dan diaudit panitia pelaksana.
                  </p>
                </div>
              )}
            </div>
          )
        ) : (
          /* REGISTRASI MANDIRI (NEW ATHLETE) */
          regSuccess ? (
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 relative" id="registration-receipt">
              <div className="absolute top-0 right-0 w-full h-full bg-indigo-900/10 pointer-events-none rounded-2xl"></div>
              
              <div className="text-center pb-3 border-b border-dashed border-slate-700">
                <div className="h-12 w-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/30 mb-2">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Bukti Pendaftaran</h4>
                <p className="text-[10px] text-slate-400">Harap simpan atau cetak bukti ini.</p>
              </div>

              <div className="space-y-3 text-xs relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                    <img src={regSuccess.photoUrl || 'https://via.placeholder.com/150'} alt="Foto Atlet" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-black text-white uppercase text-sm">{regSuccess.name}</h5>
                    <p className="text-rose-400 font-bold text-[10px] uppercase">{regSuccess.club}</p>
                    <p className="text-slate-400 font-mono mt-1 text-[9px]">ID: {regSuccess.id}</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-left space-y-2">
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Kategori:</span>
                    <span className="text-white font-bold">{regSuccess.categoryType} ({regSuccess.division})</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Status Verifikasi:</span>
                    <span className="text-amber-400 font-extrabold flex items-center gap-1">⏱ MENUNGGU</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status Bayar:</span>
                    <span className="text-amber-400 font-extrabold">{regSuccess.paymentStatus}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2 relative z-10 print:hidden">
                <button
                  type="button"
                  onClick={() => {
                    const printContent = document.getElementById('registration-receipt');
                    const originalContents = document.body.innerHTML;
                    if(printContent) {
                      document.body.innerHTML = printContent.innerHTML;
                      window.print();
                      document.body.innerHTML = originalContents;
                      window.location.reload();
                    }
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-bold py-2.5 rounded-lg shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Printer className="h-4 w-4" /> Cetak Bukti
                </button>
                <button
                  onClick={resetRegistrationForm}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold py-2.5 rounded-lg border border-slate-700 transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterNewAthlete} className="space-y-4">
              {/* Payment Announcement */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-xs space-y-2">
                <h4 className="font-black text-indigo-400 uppercase flex items-center gap-1.5">
                  <Info className="h-4 w-4" /> Informasi Pembayaran
                </h4>
                <p className="text-indigo-200 leading-relaxed">
                  Biaya pendaftaran sebesar <strong className="text-white">Rp {paymentSettings ? paymentSettings.feePerClass.toLocaleString('id-ID') : '150.000'} / Kelas</strong>. Silakan transfer ke rekening resmi panitia:
                </p>
                <div className="bg-indigo-950/50 p-2 rounded border border-indigo-500/30 font-mono text-center">
                  <p className="text-indigo-300">{paymentSettings?.bankName || 'Bank BCA'}</p>
                  <p className="text-lg font-black text-white tracking-widest mt-1 mb-1">{paymentSettings?.accountNumber || '123-456-7890'}</p>
                  <p className="text-indigo-300">a.n {paymentSettings?.accountName || 'FORKI Pasaman'}</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl">
                <h3 className="text-xs font-black uppercase text-rose-500 tracking-wider flex items-center gap-1.5">
                  <UserPlus className="h-4 w-4" /> Formulir Registrasi Mandiri
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  Masukkan data pertandingan Anda dengan teliti sesuai Surat Rekomendasi Pengda FORKI Anda.
                </p>
              </div>

              <div className="space-y-3">
                {/* Name field */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-350 uppercase tracking-wider mb-1.5">
                    Nama Lengkap Atlet
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ahmad Fauzi, SH"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Dojo asal */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-355 uppercase tracking-wider mb-1.5">
                    Dojo / Kontingen Asal
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: INKAI Pasaman / Pengcab Bukittinggi"
                    value={regClub}
                    onChange={e => setRegClub(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Grid fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-355 uppercase tracking-wider mb-1.5">
                      Jenis Kelamin
                    </label>
                    <select
                      value={regGender}
                      onChange={e => setRegGender(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Laki-laki">Putra</option>
                      <option value="Perempuan">Putri</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-355 uppercase tracking-wider mb-1.5">
                      Kategori Pertandingan
                    </label>
                    <select
                      value={regCategoryType}
                      onChange={e => setRegCategoryType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Kumite">Kumite (Tarung)</option>
                      <option value="Kata">Kata (Seni)</option>
                    </select>
                  </div>
                </div>

                {/* Age Group and Division */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-355 uppercase tracking-wider mb-1.5">
                      Kelompok Umur
                    </label>
                    <select
                      value={regAgeGroup}
                      onChange={e => setRegAgeGroup(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Usia Dini (8-9 Tahun)">Usia Dini</option>
                      <option value="Pra Pemula (10-11 Tahun)">Pra Pemula</option>
                      <option value="Pemula (12-13 Tahun)">Pemula</option>
                      <option value="Cadet (14-15 Tahun)">Cadet</option>
                      <option value="Junior (16-17 Tahun)">Junior</option>
                      <option value="Senior (18+ Tahun)">Senior</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-355 uppercase tracking-wider mb-1.5">
                      Kelas Divisi / Berat
                    </label>
                    {regCategoryType === 'Kata' ? (
                      <select
                        value={regDivision}
                        onChange={e => setRegDivision(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                      >
                        <option value="Perorangan Putra">Perorangan Putra</option>
                        <option value="Perorangan Putri">Perorangan Putri</option>
                        <option value="Beregu Putra">Beregu Putra</option>
                        <option value="Beregu Putri">Beregu Putri</option>
                      </select>
                    ) : (
                      <select
                        value={regDivision}
                        onChange={e => setRegDivision(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                      >
                        <option value="-55kg Putra Senior">-55kg Putra</option>
                        <option value="-60kg Putra Senior">-60kg Putra</option>
                        <option value="-67kg Putra Senior">-67kg Putra</option>
                        <option value="-75kg Putra Senior">-75kg Putra</option>
                        <option value="+84kg Putra Senior">+84kg Putra</option>
                        <option value="-50kg Putri Senior">-50kg Putri</option>
                        <option value="-55kg Putri Senior">-55kg Putri</option>
                        <option value="-61kg Putri Senior">-61kg Putri</option>
                        <option value="+68kg Putri Senior">+68kg Putri</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Target design Weight */}
                {regCategoryType === 'Kumite' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-355 uppercase tracking-wider mb-1.5">
                      Target Berat Badan Pendaftaran
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Contoh: 59"
                        value={regWeight}
                        onChange={e => setRegWeight(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-bold font-mono">KG</span>
                    </div>
                  </div>
                )}
                
                {/* File Uploads */}
                <div className="pt-3 border-t border-slate-800 space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-355 uppercase tracking-wider mb-1.5">
                      Unggah Foto Atlet (Wajib)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer bg-slate-900 hover:bg-slate-800 border border-slate-700 border-dashed rounded-lg p-3 text-center transition">
                        <ImageIcon className="h-5 w-5 text-slate-500 mx-auto mb-1" />
                        <span className="text-[10px] text-slate-400 font-semibold block">Pilih File Foto (JPG/PNG)</span>
                        <input type="file" accept="image/*" required className="hidden" onChange={(e) => handleImageUpload(e, setRegPhoto)} />
                      </label>
                      {regPhoto && (
                        <div className="h-14 w-14 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 shadow-lg">
                          <img src={regPhoto} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-355 uppercase tracking-wider mb-1.5">
                      Unggah Bukti Pembayaran (Wajib)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer bg-slate-900 hover:bg-slate-800 border border-slate-700 border-dashed rounded-lg p-3 text-center transition">
                        <Upload className="h-5 w-5 text-slate-500 mx-auto mb-1" />
                        <span className="text-[10px] text-slate-400 font-semibold block">Pilih Bukti Transfer</span>
                        <input type="file" accept="image/*" required className="hidden" onChange={(e) => handleImageUpload(e, setRegPaymentProof)} />
                      </label>
                      {regPaymentProof && (
                        <div className="h-14 w-14 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 shadow-lg">
                          <img src={regPaymentProof} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-505 text-xs font-black uppercase text-white py-3 rounded-lg shadow-md transition"
              >
                Kirim Pendaftaran Mandiri
              </button>
            </form>
          )
        )}
      </div>

      {/* Footer Branding */}
      <div className="bg-slate-900 border-t border-slate-850 p-4 text-center">
        <p className="text-[9px] text-slate-500 tracking-wider">
          FORKI SUMBAR DIGITAL ASSISTANT • SYSTEM ONLINE
        </p>
      </div>
    </div>
  );
}
