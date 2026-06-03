/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, 
  Users, 
  Printer, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Upload, 
  Play, 
  Check, 
  X, 
  Calendar, 
  Shield, 
  Search, 
  UserPlus, 
  Layers, 
  Trophy, 
  Activity, 
  Info,
  Medal,
  Dribbble,
  ChevronRight,
  Clock,
  UserCheck,
  TrendingUp,
  FileDown,
  Megaphone,
  PieChart,
  UserCog,
  Settings,
  Eye,
  LogOut,
  Image as ImageIcon,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Participant, Category, Match, BracketType, StandingsRow, PaymentSettings } from './types';
import { 
  SAMPLE_PARTICIPANTS, 
  SAMPLE_CATEGORIES, 
  KARATEKA_AVATARS 
} from './sampleData';
import { supabase } from './lib/supabase';
import { 
  generateSingleElimination, 
  generateDoubleElimination, 
  generateRoundRobin, 
  generateGroupStage, 
  calculateStandings, 
  propagateMatchWinner 
} from './bracketEngine';

// Modular Subviews representing the 17 custom tournament management features
import AbsensiView from './components/AbsensiView';
import DaftarHadirView from './components/DaftarHadirView';
import JadwalTandingView from './components/JadwalTandingView';
import HasilPerBabakView from './components/HasilPerBabakView';
import ManajemenWasitView from './components/ManajemenWasitView';
import DashboardKontingenView from './components/DashboardKontingenView';
import EksporLaporanView from './components/EksporLaporanView';
import SertifikatView from './components/SertifikatView';
import PengumumanView from './components/PengumumanView';
import RekapKuotaView from './components/RekapKuotaView';
import ManajemenUserView from './components/ManajemenUserView';
import PengaturanView from './components/PengaturanView';
import VisualisasiKinerjaView from './components/VisualisasiKinerjaView';
import SelfServicePortal from './components/SelfServicePortal';
import ToastContainer, { Toast } from './components/ToastContainer';
import PublicPortalView from './components/PublicPortalView';
import LoginView from './components/LoginView';

const THEME_CONFIGS: Record<string, {
  rootBg: string;
  headerBg: string;
  sidebarBg: string;
  logoGradient: string;
  accentText: string;
  accentBg: string;
  summaryBg: string;
  panelBorder: string;
  contentBg: string;
}> = {
  midnight: {
    rootBg: 'bg-slate-900',
    headerBg: 'bg-slate-950/80 border-slate-800',
    sidebarBg: 'bg-slate-950 border-slate-850/80',
    logoGradient: 'from-rose-600 to-indigo-600',
    accentText: 'text-rose-500',
    accentBg: 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/30',
    summaryBg: 'bg-slate-950 border-slate-850',
    panelBorder: 'border-slate-850/80',
    contentBg: 'bg-slate-900',
  },
  emerald: {
    rootBg: 'bg-stone-900',
    headerBg: 'bg-emerald-950/80 border-emerald-900',
    sidebarBg: 'bg-emerald-950 border-emerald-900/40',
    logoGradient: 'from-emerald-600 to-amber-500',
    accentText: 'text-emerald-500',
    accentBg: 'bg-emerald-600 hover:bg-emerald-505 shadow-emerald-950/30',
    summaryBg: 'bg-emerald-950 border-emerald-900/30',
    panelBorder: 'border-emerald-900/20',
    contentBg: 'bg-stone-900',
  },
  crimson: {
    rootBg: 'bg-zinc-900',
    headerBg: 'bg-zinc-950/80 border-zinc-800',
    sidebarBg: 'bg-zinc-955 border-zinc-850/60',
    logoGradient: 'from-red-650 to-orange-500',
    accentText: 'text-red-500',
    accentBg: 'bg-red-655 hover:bg-red-600 shadow-red-950/30',
    summaryBg: 'bg-zinc-950 border-zinc-850',
    panelBorder: 'border-zinc-850/60',
    contentBg: 'bg-zinc-900',
  },
  frost: {
    rootBg: 'bg-slate-900',
    headerBg: 'bg-sky-955/85 border-sky-900',
    sidebarBg: 'bg-sky-955 border-sky-900/45',
    logoGradient: 'from-sky-505 to-sky-700',
    accentText: 'text-sky-455',
    accentBg: 'bg-sky-600 hover:bg-sky-500 shadow-sky-950/30',
    summaryBg: 'bg-sky-950 border-sky-900/30',
    panelBorder: 'border-sky-900/20',
    contentBg: 'bg-slate-900',
  },
};

export default function App() {
  // STATE
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentTheme, setCurrentTheme] = useState<string>('midnight');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  
  // Tab control
  const [activeTab, setActiveTab ] = useState<string>('dashboard');
  const [isSelfServiceActive, setIsSelfServiceActive] = useState<boolean>(false);
  const [isPublicPortalActive, setIsPublicPortalActive] = useState<boolean>(false);
  const [bannerError, setBannerError] = useState<boolean>(false);
  
  // Selection
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [printingCategory, setPrintingCategory] = useState<Category | null>(null);
  const [activeMatchScoring, setActiveMatchScoring] = useState<Match | null>(null);
  const [viewingProof, setViewingProof] = useState<{url: string, name: string} | null>(null);

  // Payment Settings state
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    bankName: 'Bank BCA',
    accountNumber: '123-456-7890',
    accountName: 'FORKI Pasaman',
    feePerClass: 150000
  });

  // New Participant Input state
  const [newName, setNewName] = useState('');
  const [newClub, setNewClub] = useState('');
  const [newGender, setNewGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [newAge, setNewAge] = useState('Senior (18+ Tahun)');
  const [newCatType, setNewCatType] = useState<'Kata' | 'Kumite'>('Kumite');
  const [newDivision, setNewDivision] = useState('-60kg Putra Senior');
  const [newWeight, setNewWeight] = useState('');
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState<number>(0);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  // New Category Input state
  const [newCatName, setNewCatName] = useState('');
  const [newCatTypeSelect, setNewCatTypeSelect] = useState<'Kata' | 'Kumite'>('Kumite');
  const [newCatAgeSelect, setNewCatAgeSelect] = useState('Senior (18+ Tahun)');
  const [newCatDivSelect, setNewCatDivSelect] = useState('-60kg Putra Senior');
  const [newCatBracketType, setNewCatBracketType] = useState<BracketType>('Single');

  // Referee scoring state inside modal temp store
  const [tempAkaScore, setTempAkaScore] = useState(0);
  const [tempAoScore, setTempAoScore] = useState(0);
  const [tempAkaC1, setTempAkaC1] = useState(0);
  const [tempAkaC2, setTempAkaC2] = useState(0);
  const [tempAoC1, setTempAoC1] = useState(0);
  const [tempAoC2, setTempAoC2] = useState(0);
  const [tempAkaSenshu, setTempAkaSenshu] = useState(false);
  const [tempAoSenshu, setTempAoSenshu] = useState(false);
  const [tempAkaHansoku, setTempAkaHansoku] = useState(false);
  const [tempAoHansoku, setTempAoHansoku] = useState(false);
  const [tempHanteiWinner, setTempHanteiWinner] = useState<'aka' | 'ao' | null>(null);

  const loadThemeFromSettings = () => {
    const saved = localStorage.getItem('karate_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.theme) {
          setCurrentTheme(parsed.theme);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Persistence and Supabase Loader
  useEffect(() => {
    // Check if loading as a self-service attendee station
    if (window.location.search.includes('presensi=atlet')) {
      setIsSelfServiceActive(true);
    }

    const loadData = async () => {
      try {
        const [partsRes, catsRes, matsRes, settingsRes] = await Promise.all([
          supabase.from('participants').select('*'),
          supabase.from('categories').select('*'),
          supabase.from('matches').select('*'),
          supabase.from('payment_settings').select('*').limit(1)
        ]);

        if (partsRes.data && partsRes.data.length > 0) setParticipants(partsRes.data);
        else setParticipants(SAMPLE_PARTICIPANTS);

        if (catsRes.data && catsRes.data.length > 0) setCategories(catsRes.data);
        else setCategories(SAMPLE_CATEGORIES);

        if (matsRes.data && matsRes.data.length > 0) setMatches(matsRes.data);
        
        if (settingsRes.data && settingsRes.data.length > 0) setPaymentSettings(settingsRes.data[0]);

        const session = localStorage.getItem('karate_session');
        if (session) {
          try { setLoggedInUser(JSON.parse(session)); } catch(e) {}
        }
      } catch (e) {
        console.error('Failed to load from Supabase:', e);
      }
    };

    loadData();

    // Supabase Real-time subscriptions
    const partsChannel = supabase.channel('participants_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, payload => {
        // Simple strategy: trigger full reload on changes to avoid complex state merge logic during fast events
        supabase.from('participants').select('*').then(({ data }) => data && setParticipants(data));
      }).subscribe();

    const catsChannel = supabase.channel('categories_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, payload => {
        supabase.from('categories').select('*').then(({ data }) => data && setCategories(data));
      }).subscribe();

    const matsChannel = supabase.channel('matches_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, payload => {
        supabase.from('matches').select('*').then(({ data }) => data && setMatches(data));
      }).subscribe();

    return () => {
      supabase.removeChannel(partsChannel);
      supabase.removeChannel(catsChannel);
      supabase.removeChannel(matsChannel);
    };
  }, []);

  // TOAST SYSTEM IMPLEMENTATION
  const showToast = (title: string, description: string, type: 'success' | 'info' | 'warning' | 'score' | 'register' = 'info') => {
    const newToast: Toast = {
      id: 't_' + Math.random().toString(36).substr(2, 9),
      title,
      description,
      type,
      timestamp: new Date()
    };
    setToasts(prev => [newToast, ...prev].slice(0, 5));
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Toast automatic dismiss effect (removes oldest toast every 6 seconds)
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts(prev => prev.slice(0, -1));
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  // Track state changes to automatically show notifications (handles both local and cross-tab/device sync!)
  const prevParticipantsRef = useRef<Participant[]>([]);
  const prevMatchesRef = useRef<Match[]>([]);

  useEffect(() => {
    if (prevParticipantsRef.current.length > 0) {
      if (participants.length > prevParticipantsRef.current.length) {
        // Detect new self-service registration or admin addition
        const newItems = participants.filter(p => !prevParticipantsRef.current.some(prev => prev.id === p.id));
        newItems.forEach(item => {
          showToast(
            'Layanan Mandiri Atlet 🎉',
            `${item.name} (${item.club}) mendaftar baru di kelas ${item.division}.`,
            'register'
          );
        });
      } else {
        // Detect check-in changes (absensi/timbang)
        participants.forEach(p => {
          const old = prevParticipantsRef.current.find(prev => prev.id === p.id);
          if (old && !old.isCheckedIn && p.isCheckedIn) {
            showToast(
              'Presensi Terverifikasi ✔',
              `${p.name} (${p.club}) masuk sebagai HADIR.`,
              'success'
            );
          }
        });
      }
    }
    prevParticipantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    if (prevMatchesRef.current.length > 0 && matches.length > 0) {
      matches.forEach(m => {
        const oldMatch = prevMatchesRef.current.find(prev => prev.id === m.id);
        if (oldMatch) {
          const newlyCompleted = !oldMatch.isCompleted && m.isCompleted;
          const scoreChanged = oldMatch.isCompleted && m.isCompleted && (oldMatch.akaScore !== m.akaScore || oldMatch.aoScore !== m.aoScore);
          
          if (newlyCompleted || scoreChanged) {
            const akaAthlete = participants.find(p => p.id === m.akaId);
            const aoAthlete = participants.find(p => p.id === m.aoId);
            const winnerAthlete = participants.find(p => p.id === m.winnerId);
            
            const akaName = akaAthlete?.name || 'Aka';
            const aoName = aoAthlete?.name || 'Ao';
            const categoryName = categories.find(c => c.id === m.categoryId)?.name || 'Kategori';

            if (newlyCompleted) {
              showToast(
                'Hasil Pertandingan Tersimpan 🏆',
                `${categoryName} - Match #${m.matchNumber}: ${akaName} (${m.akaScore}) vs ${aoName} (${m.aoScore}). Pemenang: ${winnerAthlete?.name || 'TBD'}`,
                'score'
              );
            } else if (scoreChanged) {
              showToast(
                'Pembaruan Skor Pertandingan ✍',
                `Skor untuk ${categoryName} - Match #${m.matchNumber} diubah menjadi: ${akaName} (${m.akaScore}) vs ${aoName} (${m.aoScore}).`,
                'info'
              );
            }
          }
        }
      });
    }
    prevMatchesRef.current = matches;
  }, [matches, participants, categories]);

  const handleAddSelfServiceParticipant = (item: Participant) => {
    const updatedParts = [...participants, item];
    setParticipants(updatedParts);
    // Note: Do not auto-sync to categories here, because self-service participants start as 'Menunggu'
    saveToLocalStorage(updatedParts, categories, matches);
  };

  const saveToLocalStorage = async (parts: Participant[], cats: Category[], mats: Match[]) => {
    // Keep local cache for fast reload
    localStorage.setItem('karate_participants', JSON.stringify(parts));
    localStorage.setItem('karate_categories', JSON.stringify(cats));
    localStorage.setItem('karate_matches', JSON.stringify(mats));
    
    // Background sync to Supabase
    try {
      if (parts.length > 0) await supabase.from('participants').upsert(parts);
      if (cats.length > 0) await supabase.from('categories').upsert(cats);
      if (mats.length > 0) await supabase.from('matches').upsert(mats);
    } catch (e) {
      console.error('Supabase sync failed:', e);
    }
  };

  const loadSampleData = () => {
    setParticipants(SAMPLE_PARTICIPANTS);
    setCategories(SAMPLE_CATEGORIES);
    setMatches([]);
    saveToLocalStorage(SAMPLE_PARTICIPANTS, SAMPLE_CATEGORIES, []);
    setSelectedCategory(SAMPLE_CATEGORIES[0]);
  };

  const clearAllData = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua data turnamen?')) {
      setParticipants([]);
      setCategories([]);
      setMatches([]);
      setSelectedCategory(null);
      saveToLocalStorage([], [], []);
      
      try {
        await supabase.from('participants').delete().neq('id', '0'); // delete all
        await supabase.from('categories').delete().neq('id', '0');
        await supabase.from('matches').delete().neq('id', '0');
      } catch(e) {
        console.error(e);
      }
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('karate_payment_settings', JSON.stringify(paymentSettings));
    showToast('Pengaturan Disimpan', 'Data rekening pembayaran berhasil diperbarui.', 'success');
    
    try {
      await supabase.from('payment_settings').upsert({ id: '00000000-0000-0000-0000-000000000000', ...paymentSettings });
    } catch(e) {
      console.error(e);
    }
  };

  // HANDLERS FOR ATHLETES
  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newClub.trim()) return alert('Mohon isi nama dan dojo!');

    const pid = editingParticipant ? editingParticipant.id : 'p_' + Math.random().toString(36).substr(2, 9);
    const photo = customAvatar || KARATEKA_AVATARS[selectedAvatarIdx];

    const item: Participant = {
      id: pid,
      name: newName,
      club: newClub,
      gender: newGender,
      ageGroup: newAge,
      categoryType: newCatType,
      division: newDivision,
      photoUrl: photo,
      weight: newWeight || undefined,
      verificationStatus: 'Terverifikasi',
      paymentStatus: 'Lunas',
      isCheckedIn: true
    };

    let updatedParts;
    if (editingParticipant) {
      updatedParts = participants.map(p => p.id === pid ? item : p);
      setEditingParticipant(null);
    } else {
      updatedParts = [...participants, item];
    }

    setParticipants(updatedParts);
    // Auto sync updated participants elements into their selected category if matching
    const updatedCats = categories.map(cat => {
      // If it has same division / category traits and not locked, add to that division listing
      if (!cat.isLocked && cat.division === item.division && cat.ageGroup === item.ageGroup) {
        if (!cat.participantIds.includes(pid)) {
          return { ...cat, participantIds: [...cat.participantIds, pid] };
        }
      }
      return cat;
    });

    setCategories(updatedCats);
    saveToLocalStorage(updatedParts, updatedCats, matches);

    // reset fields
    setNewName('');
    setNewClub('');
    setNewWeight('');
    setCustomAvatar(null);
  };

  const handleEditParticipant = (p: Participant) => {
    setEditingParticipant(p);
    setNewName(p.name);
    setNewClub(p.club);
    setNewGender(p.gender);
    setNewAge(p.ageGroup);
    setNewCatType(p.categoryType);
    setNewDivision(p.division);
    setNewWeight(p.weight || '');
    if (p.photoUrl && p.photoUrl.startsWith('data:image')) {
      setCustomAvatar(p.photoUrl);
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    if (!confirm('Hapus peserta ini dari turnamen?')) return;
    const parts = participants.filter(p => p.id !== id);
    const cats = categories.map(c => ({
      ...c,
      participantIds: c.participantIds.filter(pid => pid !== id)
    }));
    // Remove matches with this player or reset them
    const mats = matches.map(m => {
      let changed = false;
      let aka = m.akaId;
      let ao = m.aoId;
      if (m.akaId === id) { aka = null; changed = true; }
      if (m.aoId === id) { ao = null; changed = true; }
      return changed ? { ...m, akaId: aka, aoId: ao } : m;
    });

    setParticipants(parts);
    setCategories(cats);
    setMatches(mats);
    saveToLocalStorage(parts, cats, mats);
    
    try {
      await supabase.from('participants').delete().eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // HANDLERS FOR CATEGORIES
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return alert('Mohon nama kategori tanding diisi!');

    const catId = 'cat_' + Math.random().toString(36).substr(2, 9);
    
    // Auto group participants fitted for this class
    const matchingIds = participants
      .filter(p => p.ageGroup === newCatAgeSelect && p.division === newCatDivSelect)
      .map(p => p.id);

    const newCat: Category = {
      id: catId,
      name: `${newCatName} (${newCatBracketType})`,
      categoryType: newCatTypeSelect,
      ageGroup: newCatAgeSelect,
      division: newCatDivSelect,
      bracketType: newCatBracketType,
      participantIds: matchingIds,
      isLocked: false
    };

    const updatedCats = [...categories, newCat];
    setCategories(updatedCats);
    saveToLocalStorage(participants, updatedCats, matches);

    // reset fields
    setNewCatName('');
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Hapus kategori tanding ini beserta bagannya?')) return;
    const cats = categories.filter(c => c.id !== id);
    const mats = matches.filter(m => m.categoryId !== id);
    if (selectedCategory?.id === id) {
      setSelectedCategory(cats[0] || null);
    }
    setCategories(cats);
    setMatches(mats);
    saveToLocalStorage(participants, cats, mats);
    
    try {
      await supabase.from('categories').delete().eq('id', id);
      // matches deletion is cascading in SQL if setup, but we'll manually enforce it anyway
      await supabase.from('matches').delete().eq('categoryId', id);
    } catch (e) {
      console.error(e);
    }
  };

  // BRACKET GENERATION LOGIC
  const handleGenerateBracket = (cat: Category) => {
    const catParticipants = participants.filter(p => cat.participantIds.includes(p.id));
    if (catParticipants.length < 2) {
      return alert('Dibutuhkan minimal 2 peserta untuk membuat bagan pertandingan!');
    }

    let generated: Match[] = [];

    if (cat.bracketType === 'Single') {
      generated = generateSingleElimination(cat.id, catParticipants);
    } else if (cat.bracketType === 'Double') {
      generated = generateDoubleElimination(cat.id, catParticipants);
    } else if (cat.bracketType === 'RoundRobin') {
      generated = generateRoundRobin(cat.id, catParticipants);
    } else if (cat.bracketType === 'Group') {
      const gResult = generateGroupStage(cat.id, catParticipants);
      generated = gResult.matches;
    }

    // Set locked status
    const updatedCats = categories.map(c => c.id === cat.id ? { ...c, isLocked: true } : c);
    // Remove old matches of this category and append newly generated ones
    const updatedMats = [...matches.filter(m => m.categoryId !== cat.id), ...generated];

    setCategories(updatedCats);
    setMatches(updatedMats);
    const currentUpdatedCat = updatedCats.find(c => c.id === cat.id) || cat;
    setSelectedCategory(currentUpdatedCat);
    saveToLocalStorage(participants, updatedCats, updatedMats);
  };

  const handleResetBracket = (cat: Category) => {
    if (!confirm('Apakah Anda yakin ingin me-reset ulang bagan ini? Semua skor yang telah diinput akan hilang.')) return;
    const updatedCats = categories.map(c => c.id === cat.id ? { ...c, isLocked: false } : c);
    const updatedMats = matches.filter(m => m.categoryId !== cat.id);

    setCategories(updatedCats);
    setMatches(updatedMats);
    const currentUpdatedCat = updatedCats.find(c => c.id === cat.id) || cat;
    setSelectedCategory(currentUpdatedCat);
    saveToLocalStorage(participants, updatedCats, updatedMats);
  };

  // SCORING DIALOG CONTROLS
  const openScoringModal = (match: Match) => {
    if (!match.akaId && !match.aoId) return; // empty slot wait
    setActiveMatchScoring(match);
    setTempAkaScore(match.akaScore);
    setTempAoScore(match.aoScore);
    setTempAkaC1(match.akaPenalties.c1);
    setTempAkaC2(match.akaPenalties.c2);
    setTempAoC1(match.aoPenalties.c1);
    setTempAoC2(match.aoPenalties.c2);
    setTempAkaSenshu(match.akaSenshu);
    setTempAoSenshu(match.aoSenshu);
    setTempAkaHansoku(match.akaPenalties.hansoku);
    setTempAoHansoku(match.aoPenalties.hansoku);
    setTempHanteiWinner(match.akaHantei ? 'aka' : (match.aoHantei ? 'ao' : null));
  };

  const handleSaveScore = () => {
    if (!activeMatchScoring) return;

    let finalWinnerId: string | null = null;
    let finalLoserId: string | null = null;

    const athleteAka = participants.find(p => p.id === activeMatchScoring.akaId);
    const athleteAo = participants.find(p => p.id === activeMatchScoring.aoId);

    // Disqualification rules
    if (tempAkaHansoku && !tempAoHansoku) {
      finalWinnerId = activeMatchScoring.aoId;
      finalLoserId = activeMatchScoring.akaId;
    } else if (tempAoHansoku && !tempAkaHansoku) {
      finalWinnerId = activeMatchScoring.akaId;
      finalLoserId = activeMatchScoring.aoId;
    } 
    // Score based winner
    else if (tempAkaScore > tempAoScore) {
      finalWinnerId = activeMatchScoring.akaId;
      finalLoserId = activeMatchScoring.aoId;
    } else if (tempAoScore > tempAkaScore) {
      finalWinnerId = activeMatchScoring.aoId;
      finalLoserId = activeMatchScoring.akaId;
    } 
    // Senshu advantage (First point)
    else if (tempAkaSenshu && !tempAoSenshu) {
      finalWinnerId = activeMatchScoring.akaId;
      finalLoserId = activeMatchScoring.aoId;
    } else if (tempAoSenshu && !tempAkaSenshu) {
      finalWinnerId = activeMatchScoring.aoId;
      finalLoserId = activeMatchScoring.akaId;
    } 
    // Hantei Decision (Judge votes)
    else if (tempHanteiWinner === 'aka') {
      finalWinnerId = activeMatchScoring.akaId;
      finalLoserId = activeMatchScoring.aoId;
    } else if (tempHanteiWinner === 'ao') {
      finalWinnerId = activeMatchScoring.aoId;
      finalLoserId = activeMatchScoring.akaId;
    } else {
      // Still tied, force tie break decision
      return alert('Skor seri! Harap tentukan pemenang lewat keputusan wasit (HANTEI) atau SENSHU.');
    }

    // Map updated match values
    const updatedMatch: Match = {
      ...activeMatchScoring,
      akaScore: tempAkaScore,
      aoScore: tempAoScore,
      akaPenalties: { c1: tempAkaC1, c2: tempAkaC2, hansoku: tempAkaHansoku },
      aoPenalties: { c1: tempAoC1, c2: tempAoC2, hansoku: tempAoHansoku },
      akaSenshu: tempAkaSenshu,
      aoSenshu: tempAoSenshu,
      akaHantei: tempHanteiWinner === 'aka',
      aoHantei: tempHanteiWinner === 'ao',
      winnerId: finalWinnerId,
      isCompleted: true
    };

    // Propagate winner through bracket lists
    const catMatches = matches.filter(m => m.categoryId === selectedCategory?.id);
    let updatedCatMatches = catMatches.map(m => m.id === updatedMatch.id ? updatedMatch : m);

    if (finalWinnerId) {
      updatedCatMatches = propagateMatchWinner(
        updatedCatMatches, 
        updatedMatch.id, 
        finalWinnerId, 
        finalLoserId
      );
    }

    // Special verification for Group Stage cross-over
    // If we are in group stage, check if all Group matches are done.
    // If complete, populate the crossover final
    if (selectedCategory?.bracketType === 'Group' && updatedMatch.id.includes('group')) {
      const allGroupMatchesCompleted = updatedCatMatches
        .filter(m => m.id.includes('groupA') || m.id.includes('groupB'))
        .every(m => m.isCompleted);
      
      if (allGroupMatchesCompleted) {
        // Find group A winner & Group B winner
        const groupAPartIds = participants
          .filter((p, i) => i % 2 === 0 && selectedCategory.participantIds.includes(p.id))
          .map(p => p.id);
        const groupBPartIds = participants
          .filter((p, i) => i % 2 !== 0 && selectedCategory.participantIds.includes(p.id))
          .map(p => p.id);

        const standingsA = calculateStandings(groupAPartIds, updatedCatMatches.filter(m => m.id.includes('groupA')));
        const standingsB = calculateStandings(groupBPartIds, updatedCatMatches.filter(m => m.id.includes('groupB')));

        const crossoverFinal = updatedCatMatches.find(m => m.id.includes('crossover_final'));
        if (crossoverFinal && standingsA[0] && standingsB[0]) {
          crossoverFinal.akaId = standingsA[0].participantId;
          crossoverFinal.aoId = standingsB[0].participantId;
        }
      }
    }

    const nextMatches = [...matches.filter(m => m.categoryId !== selectedCategory?.id), ...updatedCatMatches];
    setMatches(nextMatches);
    saveToLocalStorage(participants, categories, nextMatches);
    setActiveMatchScoring(null);
  };

  // BRACKET AUTOMATIC PRINT TRIGGER
  const handlePrintBracket = () => {
    window.print();
  };

  const triggerPrintCategory = (cat: Category) => {
    setPrintingCategory(cat);
    setTimeout(() => {
      window.print();
      setPrintingCategory(null);
    }, 150);
  };

  const handleLogin = (user: any) => {
    setLoggedInUser(user);
    localStorage.setItem('karate_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('karate_session');
  };

  const activeCategoryMatches = selectedCategory 
    ? matches.filter(m => m.categoryId === selectedCategory.id) 
    : [];

  const activeCategoryParticipants = selectedCategory
    ? participants.filter(p => selectedCategory.participantIds.includes(p.id))
    : [];

  const themeConfig = THEME_CONFIGS[currentTheme] || THEME_CONFIGS.midnight;

  if (!loggedInUser && !isPublicPortalActive && !isSelfServiceActive) {
    return <LoginView onLogin={handleLogin} onGoToPublic={() => setIsPublicPortalActive(true)} />;
  }

  if (isPublicPortalActive) {
    return (
      <PublicPortalView 
        participants={participants}
        categories={categories}
        matches={matches}
        onClose={() => setIsPublicPortalActive(false)}
        onAddParticipant={handleAddSelfServiceParticipant}
        onUpdateParticipant={(updated) => {
          const nextParts = participants.map(p => p.id === updated.id ? updated : p);
          setParticipants(nextParts);
          saveToLocalStorage(nextParts, categories, matches);
        }}
      />
    );
  }

  if (isSelfServiceActive) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <SelfServicePortal 
            participants={participants}
            onUpdateParticipant={(updated) => {
              const nextParts = participants.map(p => p.id === updated.id ? updated : p);
              setParticipants(nextParts);
              saveToLocalStorage(nextParts, categories, matches);
            }}
            onAddParticipant={handleAddSelfServiceParticipant}
            standalone={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeConfig.rootBg} text-slate-100 flex flex-col font-sans`} id="app-root">
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      
      {/* HEADER SECTION (FORKINDO THEMATIC COMBAT STYLE) */}
      <header className={`border-b ${themeConfig.headerBg} backdrop-blur-md sticky top-0 z-40 print:hidden`} id="main-header">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-slate-950 flex items-center justify-center shadow-lg border border-slate-800 p-1 overflow-hidden shrink-0">
              <img 
                src="/forki-logo.png" 
                alt="FORKI Logo" 
                className="w-full h-full object-contain" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30">Aka</span>
                <span className="text-xs font-bold uppercase tracking-widest bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30">Ao</span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">FORKI SUMBAR</span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                KEJURDA Karate 2026 Sumbar
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              id="btn-load-demo"
              onClick={loadSampleData} 
              className="flex items-center gap-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-2 rounded-lg border border-amber-500/30 transition-all shadow-md focus:ring-2 focus:ring-amber-500"
              title="Memulihkan data tanding simulasi"
            >
              <RotateCcw className="h-4 w-4" />
              Demo Data
            </button>
            <button 
              id="btn-cls"
              onClick={clearAllData}
              className="flex items-center gap-2 text-xs font-medium bg-red-950/80 hover:bg-red-900 text-red-200 px-3 py-2 rounded-lg border border-red-500/30 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Reset Turnamen
            </button>
            <button
              id="btn-print-action"
              onClick={handlePrintBracket}
              className="flex items-center gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg shadow-emerald-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              Cetak Bagan
            </button>
            <button
              id="btn-public-portal"
              onClick={() => setIsPublicPortalActive(true)}
              className="flex items-center gap-2 text-xs font-bold bg-gradient-to-r from-rose-650 to-indigo-650 hover:from-rose-600 hover:to-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg shadow-indigo-950/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-rose-500/10"
              title="Buka portal informasi publik ramah penonton"
            >
              <Eye className="h-4 w-4 text-amber-400" />
              Portal Publik Live
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 transition-all ml-2 cursor-pointer"
              title="Keluar / Logout"
            >
              <LogOut className="h-4 w-4 text-rose-400" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* COMPACT DASHBOARD SUMMARY STATS */}
      <div className={`${themeConfig.summaryBg} border-b ${themeConfig.panelBorder} py-3.5 text-xs text-slate-400 font-medium print:hidden`} id="dashboard-sum">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-x-8 gap-y-2 items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5"><Users className="h-4 w-4 text-rose-500" /> <span>Total Karateka: <strong className="text-white text-sm">{participants.length}</strong></span></div>
            <div className="flex items-center gap-1.5"><Award className="h-4 w-4 text-indigo-400" /> <span>Kategori Kelas: <strong className="text-white text-sm">{categories.length}</strong></span></div>
            <div className="flex items-center gap-1.5"><Activity className="h-4 w-4 text-emerald-500" /> <span>Pertandingan Selesai: <strong className="text-white text-sm">{matches.filter(m => m.isCompleted).length}/{matches.length}</strong></span></div>
          </div>
          <div className="text-slate-500 hidden sm:block">
            Event Platform: <span className="text-blue-400 font-mono">event.forkindo.my.id</span>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT: SIDEBAR + CONTENT FRAMEWORK */}
      <div className="flex-1 flex flex-col md:flex-row print:flex-col min-h-0" id="main-frame-layout">
        
        {/* SIDEBAR NAVIGATION PANEL (17 ITEMS) */}
        <aside className={`w-full md:w-64 ${themeConfig.sidebarBg} flex flex-col justify-between p-4 space-y-4 print:hidden shrink-0`} id="left-sidebar">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-2.5">Menu Navigasi</p>
              
              <nav className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {[
                  { id: 'dashboard', label: '1. Dashboard', icon: Trophy },
                  { id: 'participants', label: '2. Daftar Peserta', icon: Users },
                  { id: 'absensi', label: '3. Absensi & Timbang', icon: Clock },
                  { id: 'daftar_hadir', label: '4. Daftar Hadir', icon: UserCheck },
                  { id: 'jadwal_tanding', label: '5. Jadwal Tanding', icon: Calendar },
                  { id: 'live_scoring', label: '6. Live Scoring / Arena', icon: Activity },
                  { id: 'hasil_per_babak', label: '7. Hasil Per Babak', icon: Award },
                  { id: 'categories', label: '8. Kategori Kelas', icon: Layers },
                  { id: 'brackets', label: '9. Bracket Pertandingan', icon: Award },
                  { id: 'manajemen_wasit', label: '10. Wasit & Dewan Juri', icon: Shield },
                  { id: 'dashboard_kontingen', label: '11. Klasemen Kontingen', icon: Trophy },
                  { id: 'ekspor_laporan', label: '12. Ekspor Berkas', icon: FileDown },
                  { id: 'sertifikat', label: '13. Sertifikat Juara', icon: Medal },
                  { id: 'pengumuman', label: '14. Papan Pengumuman', icon: Megaphone },
                  { id: 'rekap_kuota', label: '15. Rekap Kuota', icon: PieChart },
                  { id: 'manajemen_user', label: '16. Manajemen User', icon: UserCog },
                  { id: 'pengaturan', label: '17. Pengaturan Web', icon: Settings },
                  { id: 'visualisasi_kinerja', label: '18. Visualisasi Kinerja', icon: TrendingUp },
                  { id: 'public_portal', label: '19. Portal Publik Live ✨', icon: Eye },
                ].filter(item => {
                  if (loggedInUser?.role === 'Admin Utama') return true;
                  if (item.id === 'public_portal' || item.id === 'dashboard') return true;
                  if (loggedInUser?.role === 'Operator Timbang') {
                    return ['participants', 'absensi', 'daftar_hadir'].includes(item.id);
                  }
                  if (loggedInUser?.role === 'Arbitrator Juri') {
                    return ['live_scoring', 'hasil_per_babak', 'brackets', 'manajemen_wasit'].includes(item.id);
                  }
                  if (loggedInUser?.role === 'Panitia Arena') {
                    return ['jadwal_tanding', 'live_scoring', 'brackets', 'dashboard_kontingen', 'rekap_kuota'].includes(item.id);
                  }
                  return true; // Fallback
                }).map(item => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'public_portal') {
                          setIsPublicPortalActive(true);
                        } else {
                          setActiveTab(item.id);
                        }
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold tracking-tight transition-all text-left cursor-pointer ${
                        active 
                          ? `${themeConfig.accentBg} font-extrabold text-white` 
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-900 text-[10px] text-slate-500 text-center font-mono">
            v2.0 • fork indo admin
          </div>
        </aside>

        {/* CONTENT WINDOW (FLEX CONTAINER) */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 print:p-0 ${themeConfig.contentBg}`} id="main-content-scroll">
        
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 print:hidden" id="view-dashboard">
            
            {/* HERO BANNER IMAGE FROM USER ATTACHMENT */}
            <div className="w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative min-h-[160px]" id="kejurda-banner-container">
              {!bannerError ? (
                <img 
                  src="/banner.png" 
                  alt="KEJURDA Karate 2026 FORKI SUMBAR Banner" 
                  className="w-full h-auto object-cover max-h-[360px] md:max-h-[460px]" 
                  referrerPolicy="no-referrer"
                  onError={() => setBannerError(true)}
                />
              ) : (
                <div className="w-full min-h-[220px] md:min-h-[300px] bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 p-6 md:p-10 flex flex-col justify-center relative">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full filter blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full filter blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
                  <div className="relative z-10 max-w-2xl flex items-center gap-6">
                    <div className="hidden sm:block shrink-0 bg-white p-2 rounded-xl border-4 border-amber-500/30 shadow-xl shadow-amber-900/20">
                      <img src="/forki-logo.png" alt="FORKI Logo" className="w-20 h-20 md:w-28 md:h-28 object-contain" />
                    </div>
                    <div>
                      <span className="text-amber-400 text-xs font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full">
                        🏆 KEJURDA KARATE FORKI SUMBAR 2026
                      </span>
                      <h2 className="text-2xl md:text-4xl font-black text-white mt-3 uppercase tracking-tight leading-tight">
                        Satu Tatami, Sejuta Saudara - <br className="hidden sm:inline" />
                        Pengurus Provinsi FORKI SUMBAR
                      </h2>
                      <p className="text-xs md:text-sm text-slate-300 mt-2 font-medium">
                        Kabupaten Pasaman, Sumatera Barat • 26 s.d 28 Juni 2026 • Paperless &amp; Modern Event
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10" id="banner-meta-top-left">
                <span className="text-[11px] font-black text-rose-400 uppercase tracking-widest bg-slate-950/90 px-3.5 py-2 rounded-xl border border-rose-500/30 backdrop-blur-md shadow-lg">
                  🏆 KEJURDA KARATE FORKI SUMBAR 2026
                </span>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-slate-950/95 px-3 py-1.5 rounded-lg border border-amber-500/20 backdrop-blur-md shadow-md flex items-center gap-1.5">
                  📅 26 s.d 28 Juni 2026 • 📍 Kab. Pasaman - Sumbar
                </span>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-sm">
                  📍 SEKRETARIAT DIGITIAL FORKI SUMBAR
                </span>
                <span className="text-[10px] font-black text-amber-400 bg-amber-955/90 px-3 py-1.5 rounded-lg border border-amber-900/30 backdrop-blur-sm">
                  Khairuddin Simanjuntak - Ketua Umum FORKI SUMBAR
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-rose-950 rounded-2xl p-6 md:p-8 border border-slate-800 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full filter blur-3xl -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl -ml-20 -mb-20"></div>
              
              <div className="relative z-10 max-w-3xl">
                <span className="text-amber-400 text-xs font-black uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">SISTEM KESEKRETARIATAN DIGITAL • FORKI SUMBAR</span>
                <h2 className="text-3xl font-extrabold text-white mt-4 tracking-tight leading-tight md:text-4xl">
                  Kejurda Karate FORKI 2026 <br />Kabupaten Pasaman
                </h2>
                <p className="text-slate-300 mt-3 text-base leading-relaxed font-medium">
                  Selamat datang di Sistem Kesekretariatan Digital Kejuaraan Daerah (Kejurda) Karate. Platform paperless, cepat, dan modern untuk pengelolaan pendaftaran karateka, bagan tanding, input skor tanding terintegrasi standard WKF, serta pengawasan wasit di arena.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button 
                    onClick={() => setActiveTab('participants')} 
                    className="bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-950/50 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    Mulai Daftar Atlet
                  </button>
                  <button 
                    onClick={() => setActiveTab('brackets')} 
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold px-5 py-2.5 rounded-xl border border-slate-700 transition-all cursor-pointer"
                  >
                    Buka Arena Bagan
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS & SECTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Box 1: Panduan Alur Kejuaraan */}
              <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800" id="card-instruction">
                <h3 className="text-md font-bold text-white flex items-center gap-2 mb-3">
                  <span className="h-6 w-6 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold">1</span>
                  Registrasi Atlet Berfoto
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Masukkan database atlet lengkap dengan nama karateka, faksi Dojo/Klub, faksi berat, 
                  grup umur, dan unggah foto profil (atau pilih lambang karateka siap-pakai).
                </p>
              </div>

              {/* Box 2: Lock Divisi Tanding */}
              <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800" id="card-instruction-2">
                <h3 className="text-md font-bold text-white flex items-center gap-2 mb-3">
                  <span className="h-6 w-6 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs font-bold">2</span>
                  Tentukan Tipe Bagan
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gabungkan karateka ke kategori tanding (misal: Male Senior Kumite). Pilih model penyisihan 
                  tunggal/ganda, round robin, atau kualifikasi grup, lalu generate struktur skematik.
                </p>
              </div>

              {/* Box 3: Live Scoring & Cetak */}
              <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800" id="card-instruction-3">
                <h3 className="text-md font-bold text-white flex items-center gap-2 mb-3">
                  <span className="h-6 w-6 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold">3</span>
                  Skor &amp; Print Otomatis
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gunakan tombol interaktif bagan tanding untuk mengisi skor tarung (Yuko/Waza-ari/Ippon). 
                  Setelah selesai, cetak hasil fisik bagan untuk tanda tangan ketua pertandingan.
                </p>
              </div>
            </div>

            {/* RECENT CATEGORY LOCK CARD STATUS */}
            <div className="bg-slate-950/50 rounded-xl border border-slate-800 p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Award className="text-rose-500 h-5 w-5" />
                  Kategori Tanding Sedang Berjalan
                </h3>
                <button onClick={() => setActiveTab('categories')} className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1">
                  Lihat Semua Kategori <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">Belum ada kategori yang dibuat. Buat sekarang.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map(cat => {
                    const count = cat.participantIds.length;
                    const catMatches = matches.filter(m => m.categoryId === cat.id);
                    const doneCount = catMatches.filter(m => m.isCompleted).length;
                    const progress = catMatches.length > 0 ? Math.round((doneCount / catMatches.length) * 100) : 0;

                    return (
                      <div 
                        key={cat.id} 
                        className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between hover:border-slate-700 transition"
                        id={`dash-div-${cat.id}`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase py-0.5 px-2 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded">
                              {cat.bracketType === 'Single' ? 'Single Elimination' : 
                               cat.bracketType === 'Double' ? 'Double Elimination' :
                               cat.bracketType === 'RoundRobin' ? 'Round Robin' : 'Group Stage'}
                            </span>
                            <span className="text-xs text-slate-400 font-bold">{count} Atlet</span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-100 line-clamp-1">{cat.name}</h4>
                          <p className="text-[11px] text-slate-400 mt-1">{cat.ageGroup} • {cat.division}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800">
                          {cat.isLocked ? (
                            <div>
                              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                                <span>Kemajuan Seri</span>
                                <span className="font-bold text-white">{doneCount}/{catMatches.length} Match ({progress}%)</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }}></div>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setActiveTab('brackets');
                                }}
                                className="w-full text-center mt-3 bg-indigo-600/30 hover:bg-indigo-650/50 text-indigo-200 text-xs font-bold py-1.5 rounded transition"
                              >
                                Masuk Arena Tanding
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-xs text-amber-500">
                              <span className="flex items-center gap-1 font-semibold"><Info className="h-3 w-3" /> Bagan belum dirakit</span>
                              <button 
                                onClick={() => {
                                  handleGenerateBracket(cat);
                                  setActiveTab('brackets');
                                }}
                                className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded"
                              >
                                Buat Bagan
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PENGATURAN REKENING PEMBAYARAN */}
            <div className="bg-slate-950/50 rounded-xl border border-slate-800 p-5 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="text-emerald-400 h-5 w-5" />
                <h3 className="text-base font-bold text-slate-100">Pengaturan Rekening Pembayaran Pendaftaran</h3>
              </div>
              
              <form onSubmit={handleSavePaymentSettings} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Nama Bank</label>
                  <input
                    type="text"
                    value={paymentSettings.bankName}
                    onChange={(e) => setPaymentSettings({...paymentSettings, bankName: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Contoh: Bank Mandiri"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    value={paymentSettings.accountNumber}
                    onChange={(e) => setPaymentSettings({...paymentSettings, accountNumber: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Contoh: 123-456-789"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Atas Nama (A/N)</label>
                  <input
                    type="text"
                    value={paymentSettings.accountName}
                    onChange={(e) => setPaymentSettings({...paymentSettings, accountName: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Contoh: FORKI Sumbar"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Biaya / Kelas (Rp)</label>
                  <div className="flex">
                    <span className="bg-slate-800 text-slate-400 border border-slate-700 border-r-0 rounded-l-lg px-3 py-2 text-sm">Rp</span>
                    <input
                      type="number"
                      value={paymentSettings.feePerClass}
                      onChange={(e) => setPaymentSettings({...paymentSettings, feePerClass: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-r-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="md:col-span-4 flex justify-end mt-2">
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-lg text-sm transition">
                    Simpan Pengaturan
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* TAB 2: REGISTER ATHLETE */}
        {activeTab === 'participants' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden" id="view-participants">
            
            {/* Form Pendaftaran (Left Column) */}
            <div className="lg:col-span-5 bg-slate-950/70 p-5 rounded-xl border border-slate-800 h-fit" id="form-add-participant-box">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <UserPlus className="text-rose-500 h-5 w-5" />
                {editingParticipant ? 'Sunting Data Karateka' : 'Formulir Pendaftaran Karateka'}
              </h3>
              
              <form onSubmit={handleAddParticipant} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Nama Lengkap Atlet *</label>
                  <input 
                    type="text" 
                    id="input-full-name"
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Contoh: Marcus Gideon" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 font-semibold">Kontingen / Dojo *</label>
                    <input 
                      type="text" 
                      id="input-dojo-club"
                      value={newClub} 
                      onChange={e => setNewClub(e.target.value)}
                      placeholder="Contoh: Inkai Jabar" 
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Jenis Kelamin</label>
                    <select 
                      id="select-gender"
                      value={newGender} 
                      onChange={e => setNewGender(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="Laki-laki">Putra (Laki-laki)</option>
                      <option value="Perempuan">Putri (Perempuan)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Kategori Tanding</label>
                    <select 
                      id="select-category-type"
                      value={newCatType} 
                      onChange={e => setNewCatType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="Kumite">Kumite (Tarung)</option>
                      <option value="Kata">Kata (Seni/Jurus)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Faksi Berat (Kg)</label>
                    <input 
                      type="text" 
                      id="input-weight"
                      value={newWeight} 
                      onChange={e => setNewWeight(e.target.value)}
                      placeholder="Contoh: 59kg" 
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Usia &amp; Kelas</label>
                    <select 
                      id="select-class-age"
                      value={newAge} 
                      onChange={e => setNewAge(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none"
                    >
                      <option value="Usia Dini (8-9 Tahun)">Usia Dini (8-9 Th)</option>
                      <option value="Pemula (10-11 Tahun)">Pemula (10-11 Th)</option>
                      <option value="Cadet (14-15 Tahun)">Cadet (14-15 Th)</option>
                      <option value="Junior (16-17 Tahun)">Junior (16-17 Th)</option>
                      <option value="Senior (18+ Tahun)">Senior (18+ Th)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Sub-Division Kelas</label>
                    <select
                      id="select-subdiv"
                      value={newDivision}
                      onChange={e => setNewDivision(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none"
                    >
                      <option value="-60kg Putra Senior">-60kg Putra Senior</option>
                      <option value="Kata Perorangan Putri Senior">Kata Perorangan Putri Senior</option>
                      <option value="+84kg Putra Senior">+84kg Putra Senior</option>
                      <option value="-55kg Putri Cadet">-55kg Putri Cadet</option>
                      <option value="Kata Perorangan Putra Cadet">Kata Perorangan Putra Cadet</option>
                    </select>
                  </div>
                </div>

                {/* PHOTO UPLOAD AND SELECTION PANEL */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Foto / Lambang Karateka (Wajib)</label>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {KARATEKA_AVATARS.map((av, index) => (
                      <button
                        key={index}
                        id={`badge-av-${index}`}
                        type="button"
                        onClick={() => {
                          setSelectedAvatarIdx(index);
                          setCustomAvatar(null);
                        }}
                        className={`h-11 w-11 rounded-lg overflow-hidden border-2 transition-all hover:opacity-100 bg-slate-800 ${
                          !customAvatar && selectedAvatarIdx === index 
                            ? 'border-rose-500 scale-105 shadow-md shadow-rose-950' 
                            : 'border-slate-800 opacity-60'
                        }`}
                      >
                        <img src={av} alt="avatar option" className="h-full w-full object-cover" />
                      </button>
                    ))}

                    <button
                      type="button"
                      id="btn-upload-direct"
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-11 px-3 text-xs bg-slate-900 border rounded-lg flex items-center gap-2 hover:bg-slate-800 ${
                        customAvatar ? 'border-indigo-500 text-indigo-400' : 'border-slate-800 text-slate-400'
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      {customAvatar ? 'Foto Sendiri' : 'Unggah Foto'}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUploaded} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>

                  {/* MINI PREVIEW BOX */}
                  <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-slate-850 overflow-hidden border border-slate-700">
                      <img src={customAvatar || KARATEKA_AVATARS[selectedAvatarIdx]} alt="Karateka preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="text-xs">
                      <p className="text-slate-400">Tampilan Kartu Bagan:</p>
                      <p className="font-bold text-white text-xs">{newName || 'Nama Karateka'} ({newClub || 'Nama Dojo'})</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    id="btn-save-athlete"
                    className="flex-1 bg-gradient-to-r from-rose-600 to-indigo-650 hover:from-rose-500 hover:to-indigo-600 text-white text-sm font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] uppercase tracking-wider cursor-pointer"
                  >
                    {editingParticipant ? 'Perbarui Data' : 'Daftarkan Karateka'}
                  </button>
                  {editingParticipant && (
                    <button
                      type="button"
                      id="btn-cancel-edit"
                      onClick={() => {
                        setEditingParticipant(null);
                        setNewName('');
                        setNewClub('');
                        setNewWeight('');
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 rounded-xl border border-slate-700"
                    >
                      Batal
                    </button>
                  )}
                </div>

              </form>

            </div>

            {/* List Pendaftar (Right Column) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-3 justify-between items-center sm:items-stretch">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    id="search-athletes"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari berdasarkan nama atau faksi dojo kontingen..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div className="text-xs bg-slate-900 text-slate-400 px-3 py-2.5 rounded-lg border border-slate-800 flex items-center gap-1.5 whitespace-nowrap">
                  Terdaftar: <strong className="text-white text-sm">{participants.length}</strong> Karateka
                </div>
              </div>

              <div className="bg-slate-950/20 border border-slate-800/80 rounded-xl max-h-[600px] overflow-y-auto p-3.5">
                {participants.length === 0 ? (
                  <div className="py-16 text-center text-slate-500">
                    <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-bold">Belum ada peserta terdaftar</p>
                    <p className="text-xs text-slate-500 mt-1">Urus pendaftaran dengan form sebelah kiri atau klik tombol Demodata.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {participants
                      .filter(p => 
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.club.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(p => (
                        <div 
                          key={p.id} 
                          className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/50 hover:bg-slate-900/90 border border-slate-850/40 hover:border-slate-700/80 rounded-xl transition-all duration-300 hover:shadow-lg cursor-pointer" 
                          id={`athlete-row-${p.id}`}
                        >
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="h-11 w-11 rounded-lg overflow-hidden border border-slate-750 bg-slate-850 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                              <img src={p.photoUrl || KARATEKA_AVATARS[0]} alt={p.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-sm text-white">{p.name}</h4>
                              <p className="text-xs text-rose-400 font-bold tracking-wide uppercase">{p.club}</p>
                              <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-slate-400 mt-1">
                                <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{p.gender}</span>
                                <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{p.ageGroup}</span>
                                <span className="bg-indigo-950/60 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-900/40">{p.categoryType} • {p.division}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                            {/* Verification Badge & Actions */}
                            {p.verificationStatus === 'Menunggu' && (
                              <div className="flex gap-1.5 items-center mr-2">
                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-full animate-pulse">Menunggu Verifikasi</span>
                                {p.paymentProofUrl && (
                                  <button onClick={() => setViewingProof({url: p.paymentProofUrl!, name: p.name})} className="p-1 text-indigo-400 hover:bg-indigo-500/20 rounded border border-indigo-500/20 text-[10px] flex gap-1 items-center font-bold">
                                    <ImageIcon className="h-3.5 w-3.5" /> Bukti
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    const updatedP = {...p, verificationStatus: 'Terverifikasi' as const, paymentStatus: 'Lunas' as const};
                                    setParticipants(prev => prev.map(x => x.id === p.id ? updatedP : x));
                                    setCategories(prevCats => prevCats.map(cat => {
                                      if (!cat.isLocked && cat.division === updatedP.division && cat.ageGroup === updatedP.ageGroup) {
                                        if (!cat.participantIds.includes(updatedP.id)) {
                                          return { ...cat, participantIds: [...cat.participantIds, updatedP.id] };
                                        }
                                      }
                                      return cat;
                                    }));
                                  }}
                                  className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded border border-emerald-500/20 text-[10px] flex gap-1 items-center font-bold"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Terima
                                </button>
                                <button
                                  onClick={() => {
                                    setParticipants(prev => prev.map(x => x.id === p.id ? {...x, verificationStatus: 'Ditolak'} : x));
                                  }}
                                  className="p-1 text-red-400 hover:bg-red-500/20 rounded border border-red-500/20 text-[10px] flex gap-1 items-center font-bold"
                                >
                                  <XCircle className="h-3.5 w-3.5" /> Tolak
                                </button>
                              </div>
                            )}
                            {p.verificationStatus === 'Terverifikasi' && (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full mr-2">✔ Terverifikasi</span>
                            )}
                            {p.verificationStatus === 'Ditolak' && (
                              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold rounded-full mr-2">❌ Ditolak</span>
                            )}
                            
                            <button
                              id={`btn-edit-${p.id}`}
                              onClick={() => handleEditParticipant(p)}
                              className="p-1.5 px-3 text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg border border-amber-500/20 transition cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              id={`btn-del-${p.id}`}
                              onClick={() => handleDeleteParticipant(p.id)}
                              className="p-1.5 px-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition cursor-pointer"
                              title="Hapus atlet"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: CATEGORY & BRACKET CREATOR */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden" id="view-categories">
            
            {/* Form Tambah Kategori (Left Column) */}
            <div className="lg:col-span-4 bg-slate-950/70 p-5 rounded-xl border border-slate-800 h-fit" id="form-add-category">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Layers className="text-indigo-400 h-5 w-5" />
                Tambah Kategori Pertandingan
              </h3>

              <form onSubmit={handleAddCategory} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Nama Kategori Tanding *</label>
                  <input
                    type="text"
                    id="input-category-name"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="Contoh: Kumite Perorangan U-21"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Jenis Perlombaan</label>
                  <select 
                    id="select-cat-sport-type"
                    value={newCatTypeSelect} 
                    onChange={e => setNewCatTypeSelect(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none"
                  >
                    <option value="Kumite">Kumite (Bantingan &amp; Pukulan)</option>
                    <option value="Kata">Kata (Kerapihan Jurus)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Klasifikasi Usia</label>
                    <select
                      id="select-cat-age"
                      value={newCatAgeSelect}
                      onChange={e => setNewCatAgeSelect(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-[11px] text-slate-100 focus:outline-none"
                    >
                      <option value="Usia Dini (8-9 Tahun)">Usia Dini (8-9 Th)</option>
                      <option value="Pemula (10-11 Tahun)">Pemula (10-11 Th)</option>
                      <option value="Cadet (14-15 Tahun)">Cadet (14-15 Th)</option>
                      <option value="Junior (16-17 Tahun)">Junior (16-17 Th)</option>
                      <option value="Senior (18+ Tahun)">Senior (18+ Th)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Divisi/Kelas Berat</label>
                    <select
                      id="select-cat-div"
                      value={newCatDivSelect}
                      onChange={e => setNewCatDivSelect(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-[11px] text-slate-100 focus:outline-none"
                    >
                      <option value="-60kg Putra Senior">-60kg Putra Senior</option>
                      <option value="Kata Perorangan Putri Senior">Kata Perorangan Putri Senior</option>
                      <option value="+84kg Putra Senior">+84kg Putra Senior</option>
                      <option value="-55kg Putri Cadet">-55kg Putri Cadet</option>
                      <option value="Kata Perorangan Putra Cadet">Kata Perorangan Putra Cadet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 text-amber-400">Sistem Bagan / Turnamen *</label>
                  <select 
                    id="select-bracket-type"
                    value={newCatBracketType} 
                    onChange={e => setNewCatBracketType(e.target.value as BracketType)}
                    className="w-full bg-slate-900 border border-amber-600/40 rounded-lg px-3 py-2 text-sm text-slate-100 font-bold focus:outline-none text-amber-300"
                  >
                    <option value="Single">Single Elimination (Sistem Gugur)</option>
                    <option value="Double">Double Elimination (Gugur Ganda)</option>
                    <option value="RoundRobin">Round Robin (Setengah Kompetisi)</option>
                    <option value="Group">Group Stage (Pool + Championship Final)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-900 border border-indigo-950 rounded-lg text-[11px] text-indigo-300 leading-relaxed">
                  <p className="flex items-center gap-1 font-bold mb-1"><Info className="h-3.5 w-3.5" /> Penempatan Peserta Otomatis:</p>
                  Sistem otomatis mengelompokkan karateka yang sesuai faksi umur dan berat badan ke dalam divisi tanding ini.
                </div>

                <button
                  type="submit"
                  id="btn-add-category-action"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg uppercase tracking-wider transition-all cursor-pointer"
                >
                  Buat Kategori Tanding
                </button>

              </form>
            </div>

            {/* List Kategori (Right Column) */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="text-base font-bold text-white">Daftar Divisi Turnamen Berlangsung</h3>

              {categories.length === 0 ? (
                <div className="bg-slate-950/20 py-20 rounded-xl border border-dashed border-slate-800 text-center text-slate-500">
                  <Layers className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-bold">Kategori tanding masih kosong</p>
                  <p className="text-xs text-slate-500 mt-1">Gunakan panel di sebelah kiri untuk merakit kategori baru.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map(cat => {
                    const matchedAthletes = participants.filter(p => p.ageGroup === cat.ageGroup && p.division === cat.division);
                    const matchingIdsCount = matchedAthletes.length;

                    return (
                      <div 
                        key={cat.id} 
                        className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:scale-[1.01] transition-all"
                        id={`category-card-${cat.id}`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] font-bold uppercase py-0.5 px-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-full">
                              {cat.bracketType}
                            </span>
                            <span className="text-xs text-slate-400 font-bold">{matchingIdsCount} Atlet Terjaring</span>
                          </div>
                          <h4 className="font-extrabold text-white text-md line-clamp-1">{cat.name}</h4>
                          <p className="text-xs text-indigo-400 mt-1">{cat.ageGroup} / {cat.division}</p>

                          {/* Seeding list in-card preview */}
                          <div className="mt-3 bg-slate-950/50 p-2 rounded-lg border border-slate-850/80">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Daftar Seed Sementara:</p>
                            <div className="space-y-1">
                              {matchedAthletes.slice(0, 4).map((m, idx) => (
                                <div key={m.id} className="text-[11px] text-slate-300 flex items-center justify-between">
                                  <span className="truncate max-w-[150px]">{idx+1}. {m.name}</span>
                                  <span className="text-[9px] text-rose-400 uppercase tracking-widest">{m.club}</span>
                                </div>
                              ))}
                              {matchingIdsCount > 4 && (
                                <p className="text-[9px] text-slate-500 text-right">+ {matchingIdsCount - 4} Atlet Lainya...</p>
                              )}
                              {matchingIdsCount === 0 && (
                                <p className="text-[10px] text-yellow-500 italic">Belum ada atlet mendaftar di faksi kelas ini.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              id={`btn-del-cat-${cat.id}`}
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-2.5 py-1.5 rounded-lg hover:bg-red-500/20 transition cursor-pointer"
                            >
                              Hapus
                            </button>

                            <button
                              id={`btn-print-cat-${cat.id}`}
                              onClick={() => triggerPrintCategory(cat)}
                              className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                              title="Cetak daftar atlet dalam kategori ini"
                            >
                              <Printer className="h-3.5 w-3.5 text-indigo-400" />
                              Cetak
                            </button>
                          </div>
                          
                          <div className="flex-1 flex justify-end">
                            {cat.isLocked ? (
                              <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 font-bold text-xs px-2.5 py-1.5 border border-emerald-500/20 rounded-lg">
                                <Check className="h-4 w-4" /> Locked &amp; Active
                              </div>
                            ) : (
                              <button
                                id={`btn-draw-${cat.id}`}
                                onClick={() => handleGenerateBracket(cat)}
                                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-1.5 px-3.5 rounded-lg flex items-center gap-1 shadow-md shadow-rose-950/40 cursor-pointer"
                                disabled={matchingIdsCount < 2}
                                title={matchingIdsCount < 2 ? 'Butuh minimal 2 atlet tanding' : ''}
                              >
                                <Play className="h-3.5 w-3.5" /> Acak &amp; Racik Bagan
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: TARGET INTERACTIVE BRACKETS & PRINTABLE SYSTEM */}
        {activeTab === 'brackets' && (
          <div className="space-y-6" id="view-brackets-arena">
            
            {/* Category selection bar */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center gap-4 justify-between print:hidden">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Silahkan Pilih Divisi Tanding Active</label>
                <select
                  id="select-active-category-board"
                  value={selectedCategory?.id || ''}
                  onChange={e => {
                    const found = categories.find(c => c.id === e.target.value);
                    if (found) setSelectedCategory(found);
                  }}
                  className="bg-slate-900 border border-slate-800 text-sm font-bold text-white px-3 py-2 rounded-lg max-w-sm focus:outline-none"
                >
                  <option value="" disabled>-- Pilih Kategori --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {selectedCategory && (
                <div className="flex items-center gap-2">
                  {selectedCategory.isLocked ? (
                    <button
                      id="btn-reset-bracket-action"
                      onClick={() => handleResetBracket(selectedCategory)}
                      className="flex items-center gap-1 text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-500/30 px-3 py-2 rounded-lg hover:bg-red-900 transition-all cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" /> Reset Ulang Bagan
                    </button>
                  ) : (
                    <button
                      id="btn-generate-bracket-action"
                      onClick={() => handleGenerateBracket(selectedCategory)}
                      className="flex items-center gap-1.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-4 py-2 rounded-lg hover:bg-amber-600 hover:text-slate-950 transition-all duration-300 cursor-pointer"
                    >
                      <Play className="h-4 w-4" /> Luncurkan Bagan Sekarang
                    </button>
                  )}
                  <button
                    id="btn-print-bracket-action"
                    onClick={handlePrintBracket}
                    className="flex justify-center items-center gap-2 text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-indigo-400 border border-slate-700 px-3.5 py-2 rounded-lg cursor-pointer"
                  >
                    <Printer className="h-4 w-4 text-indigo-400" /> Cetak Lembar Bagan
                  </button>
                </div>
              )}
            </div>

            {/* If no category is selected */}
            {!selectedCategory && (
              <div className="py-20 text-center text-slate-500 bg-slate-950/20 rounded-2xl border border-slate-850 print:hidden">
                <Trophy className="h-16 w-16 text-slate-800 mx-auto mb-4" />
                <h3 className="text-md font-bold text-white">Belum ada kategori tanding aktif yang dipilih</h3>
                <p className="text-xs text-slate-500 mt-1">Silakan pilih divisi tanding mendaftar melalui filter pencarian di atas.</p>
              </div>
            )}

            {/* PRINT COMPLIANCE BRAND COVER (VISIBLE ONLY ON MEDIA PRINT) */}
            {selectedCategory && (
              <div className="hidden print:block font-serif text-slate-950 p-6 bg-white border-2 border-black max-w-5xl mx-auto rounded-none mb-4 shadow-none">
                <div className="text-center space-y-1 mb-6 border-b-2 border-neutral-800 pb-4">
                  <h1 className="text-2xl font-black uppercase tracking-wider text-black">FEDERASI OLAHRAGA KARATE-DO INDONESIA</h1>
                  <h2 className="text-lg font-bold uppercase text-neutral-800">Lembar Resmi Pertandingan (official Bracket Pool Sheet)</h2>
                  <p className="text-xs font-medium text-neutral-600">Dokumen Digital Event: event.forkindo.my.id</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div>
                    <span className="font-bold">Kategori Tanding:</span> {selectedCategory.name}
                  </div>
                  <div>
                    <span className="font-bold">Kelas Pertandingan:</span> {selectedCategory.ageGroup} / {selectedCategory.division}
                  </div>
                  <div>
                    <span className="font-bold">Tipe Bagan:</span> {selectedCategory.bracketType} Elimination System
                  </div>
                  <div>
                    <span className="font-bold">Tanggal Cetak:</span> {new Date().toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>
            )}

            {/* GRAPHICAL RENDERING AREA OF THE BRACKET */}
            {selectedCategory && (
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 md:p-6 shadow-xl relative overflow-hidden print:border-0 print:bg-white print:p-0">
                
                {/* Visual Watermark header in board background */}
                <div className="absolute top-4 right-4 text-rose-500/5 text-7xl font-sans font-black pointer-events-none select-none print:hidden uppercase">
                  {selectedCategory.bracketType}
                </div>

                {selectedCategory.isLocked ? (
                  <div className="space-y-6">
                    
                    {/* Render Single Elimination Bracket Component */}
                    {selectedCategory.bracketType === 'Single' && (
                      <div className="overflow-x-auto pb-4" id="pool-single-elimination-render">
                        <div className="flex gap-x-12 min-w-[850px] items-stretch py-6 px-2">
                          {(() => {
                            // Split matches by round
                            const rIds = Array.from(new Set(activeCategoryMatches.map(m => m.round))).sort((a: any, b: any) => Number(a) - Number(b));
                            
                            return rIds.map(rNum => {
                              const rMatches = activeCategoryMatches.filter(m => m.round === rNum && !m.isBronzeMatch);
                              const rName = rMatches[0]?.roundName || `Babak ${rNum}`;
                              
                              return (
                                <div key={rNum} className="flex flex-col justify-around w-64 space-y-4 relative" id={`round-col-${rNum}`}>
                                  {/* Column header title indicating the round name */}
                                  <div className="text-center border-b border-indigo-900/30 pb-2 mb-4 print:border-neutral-500">
                                    <span className="text-xs uppercase font-extrabold text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-900/40 print:text-black print:bg-white print:border-black">
                                      {rName}
                                    </span>
                                  </div>

                                  <div className="flex-1 flex flex-col justify-around gap-6 py-2">
                                    {rMatches.map(m => (
                                      <div key={m.id} className="relative">
                                        <MatchBracketCard 
                                          match={m} 
                                          athletes={participants} 
                                          onScoringClicked={openScoringModal} 
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            });
                          })()}

                          {/* Extra block to render the Bronze Match (Perebutan Juara 3) */}
                          {activeCategoryMatches.some(m => m.isBronzeMatch) && (
                            <div className="flex flex-col justify-center w-64 border-l border-slate-800 pl-8 pt-8 space-y-4 print:border-neutral-400" id="bronze-bracket-box">
                              <div className="text-center border-b border-indigo-900/30 pb-2 print:border-neutral-500">
                                <span className="text-xs uppercase font-extrabold text-amber-400 bg-amber-955 px-2.5 py-1 rounded-md border border-amber-600/30 print:text-black print:bg-white print:border-black">
                                  Perebutan Juara 3
                                </span>
                              </div>
                              <div className="py-8">
                                <MatchBracketCard 
                                  match={activeCategoryMatches.find(m => m.isBronzeMatch)!} 
                                  athletes={participants} 
                                  onScoringClicked={openScoringModal} 
                                />
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    )}

                    {/* Render Double Elimination Brackets Section (Winners Bracket, Losers Bracket, and Grand Final tabs) */}
                    {selectedCategory.bracketType === 'Double' && (
                      <div className="space-y-8" id="pool-double-elimination-render">
                        
                        {/* Tab header indicator inside DE board */}
                        <div className="border-b border-slate-850 pb-2 print:hidden">
                          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                            <Layers className="h-4 w-4 text-emerald-400" />
                            SKEMA GUGUR GANDA (DOUBLE ELIMINATION MATCHES)
                          </h3>
                        </div>

                        {/* WINNERS BRACKET SUB SECTION */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5"><Trophy className="h-4 w-4" /> WINNER'S BRACKET (JALUR MENANG)</h4>
                          <div className="overflow-x-auto pb-4">
                            <div className="flex gap-x-8 min-w-[700px] py-4">
                              {(() => {
                                const wbRNum = Array.from(new Set(activeCategoryMatches.filter(m => !m.isLosersBracket && m.roundName !== "Grand Final (Perebutan Juara)").map(m => m.round))).sort((a: any, b: any) => Number(a) - Number(b));
                                return wbRNum.map(rn => {
                                  const rMatches = activeCategoryMatches.filter(m => !m.isLosersBracket && m.round === rn && m.roundName !== 'Grand Final (Perebutan Juara)');
                                  const rName = rMatches[0]?.roundName || `WB Rd ${rn}`;
                                  return (
                                    <div key={rn} className="flex flex-col justify-start w-60 space-y-4">
                                      <div className="text-center font-bold text-[10px] text-slate-400 uppercase border-b border-indigo-950 pb-1.5">{rName}</div>
                                      <div className="flex-1 flex flex-col justify-around gap-4">
                                        {rMatches.map(m => (
                                          <MatchBracketCard key={m.id} match={m} athletes={participants} onScoringClicked={openScoringModal} />
                                        ))}
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* LOSERS BRACKET SUB SECTION */}
                        <div className="space-y-4 pt-4 border-t border-slate-850 print:border-neutral-300">
                          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5"><RotateCcw className="h-4 w-4" /> LOSER'S BRACKET (JALUR GUGUR SEKALI)</h4>
                          <div className="overflow-x-auto pb-4">
                            <div className="flex gap-x-8 min-w-[700px] py-4">
                              {(() => {
                                const lbRNum = Array.from(new Set(activeCategoryMatches.filter(m => m.isLosersBracket).map(m => m.round))).sort((a: any, b: any) => Number(a) - Number(b));
                                return lbRNum.map(rn => {
                                  const rMatches = activeCategoryMatches.filter(m => m.isLosersBracket && m.round === rn);
                                  const rName = rMatches[0]?.roundName || `LB Rd ${rn}`;
                                  return (
                                    <div key={rn} className="flex flex-col justify-start w-60 space-y-4">
                                      <div className="text-center font-bold text-[10px] text-slate-400 uppercase border-b border-indigo-950 pb-1.5">{rName}</div>
                                      <div className="flex-1 flex flex-col justify-around gap-4">
                                        {rMatches.map(m => (
                                          <MatchBracketCard key={m.id} match={m} athletes={participants} onScoringClicked={openScoringModal} />
                                        ))}
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* GRAND FINAL SECTION */}
                        <div className="pt-6 border-t border-slate-800 flex flex-col items-center justify-center print:border-neutral-300">
                          <div className="bg-gradient-to-r from-amber-600/10 via-slate-900 to-amber-600/10 p-5 rounded-2xl border border-amber-500/40 max-w-lg w-full text-center">
                            <Award className="h-8 w-8 text-amber-400 mx-auto mb-2 animate-bounce" />
                            <h4 className="text-xs font-black uppercase text-amber-400 tracking-widest mb-3">GRAND FINAL CHAMPIONSHIP MATCH</h4>
                            {(() => {
                              const gfMatch = activeCategoryMatches.find(m => m.roundName === 'Grand Final (Perebutan Juara)');
                              if (gfMatch) {
                                return (
                                  <MatchBracketCard match={gfMatch} athletes={participants} onScoringClicked={openScoringModal} />
                                );
                              }
                              return <p className="text-xs text-slate-500">Bagan silsilah final tidak ditemukan.</p>;
                            })()}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Render Round Robin Matches and Standings League Table */}
                    {selectedCategory.bracketType === 'RoundRobin' && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block" id="pool-round-robin-render">
                        
                        {/* Table Matchups (Left) */}
                        <div className="lg:col-span-5 space-y-4 print:mt-4 print:border-b-2 print:border-black print:pb-6">
                          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 print:text-black">Daftar Pertandingan Setengah Kompetisi</h4>
                          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 print:max-h-none print:overflow-visible">
                            {activeCategoryMatches.map((m) => (
                              <MatchRowRobinCard 
                                key={m.id} 
                                match={m} 
                                athletes={participants} 
                                onScoringClicked={openScoringModal} 
                              />
                            ))}
                          </div>
                        </div>

                        {/* Standings Klasemen Table (Right) */}
                        <div className="lg:col-span-7 space-y-4 print:mt-6">
                          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider border-b border-slate-800 pb-2 print:text-black">Tabel Klasemen Peringkat Turnamen</h4>
                          {(() => {
                            const standings = calculateStandings(selectedCategory.participantIds, activeCategoryMatches);
                            return (
                              <StandingsTable standings={standings} athletes={participants} />
                            );
                          })()}
                        </div>

                      </div>
                    )}

                    {/* Render Group Stage Bracket View */}
                    {selectedCategory.bracketType === 'Group' && (
                      <div className="space-y-8" id="pool-group-stage-render">
                        
                        {/* Part A: Divided Groups View Side-by-side */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          
                          {/* GRUP A PANEL */}
                          <div className="space-y-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800 print:bg-white print:text-black">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-400 border-b border-slate-800 pb-1 print:text-black">POOL / GRUP A</h3>
                            {(() => {
                              const groupAPartIds = participants.filter((p, i) => i % 2 === 0 && selectedCategory.participantIds.includes(p.id)).map(p => p.id);
                              const groupAMatches = activeCategoryMatches.filter(m => m.id.includes('groupA'));
                              const standings = calculateStandings(groupAPartIds, groupAMatches);
                              return (
                                <div className="space-y-4">
                                  <StandingsTable standings={standings} athletes={participants} />
                                  <div className="space-y-2 mt-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase print:text-black">Pertandingan Grup A:</p>
                                    {groupAMatches.map(m => (
                                      <MatchRowRobinCard key={m.id} match={m} athletes={participants} onScoringClicked={openScoringModal} />
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* GRUP B PANEL */}
                          <div className="space-y-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800 print:bg-white print:text-black">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-1 print:text-black">POOL / GRUP B</h3>
                            {(() => {
                              const groupBPartIds = participants.filter((p, i) => i % 2 !== 0 && selectedCategory.participantIds.includes(p.id)).map(p => p.id);
                              const groupBMatches = activeCategoryMatches.filter(m => m.id.includes('groupB'));
                              const standings = calculateStandings(groupBPartIds, groupBMatches);
                              return (
                                <div className="space-y-4">
                                  <StandingsTable standings={standings} athletes={participants} />
                                  <div className="space-y-2 mt-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase print:text-black">Pertandingan Grup B:</p>
                                    {groupBMatches.map(m => (
                                      <MatchRowRobinCard key={m.id} match={m} athletes={participants} onScoringClicked={openScoringModal} />
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                        </div>

                        {/* Part B: Grand final Championship play */}
                        <div className="pt-6 border-t border-slate-800 flex flex-col items-center justify-center print:border-neutral-300">
                          <div className="bg-gradient-to-r from-amber-600/10 via-slate-900 to-amber-600/10 p-5 rounded-2xl border border-amber-500/40 max-w-lg w-full text-center">
                            <Award className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                            <h4 className="text-xs font-black uppercase text-amber-400 tracking-widest mb-3">GRAND FINAL (JUARA POOL A VS POOL B)</h4>
                            {(() => {
                              const crossoverFinal = activeCategoryMatches.find(m => m.id.includes('crossover_final'));
                              if (crossoverFinal) {
                                return (
                                  <MatchBracketCard match={crossoverFinal} athletes={participants} onScoringClicked={openScoringModal} />
                                );
                              }
                              return <p className="text-xs text-slate-500">Jadwal Crossover tidak dimuat.</p>;
                            })()}
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-400 print:hidden flex flex-col items-center justify-center">
                    <Activity className="h-14 w-14 text-rose-500 mb-4 animate-bounce" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">Persiapan Bagan Selesai</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Daftar atlet pada pool tanding ini telah disortir. Lepaskan kendali pengacakan seed (random draw) bagan tanding sekarang juga!
                    </p>
                    <button
                      id="btn-lock-generate-bracket"
                      onClick={() => handleGenerateBracket(selectedCategory)}
                      className="mt-6 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-500 text-white text-xs font-bold px-6 py-3 rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-950 hover:scale-105 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Acak &amp; Aktifkan Pertandingan
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* PRINT OPTIMIZED SIGNATURE LINES (VISIBLE ON PRINT) */}
            {selectedCategory && (
              <div className="hidden print:grid grid-cols-3 gap-8 text-center text-xs mt-12 text-black font-serif pt-12">
                <div className="space-y-12">
                  <p>Wasit Juri Pertandingan</p>
                  <p className="font-bold border-t border-black pt-2 mx-6">( ............................................ )</p>
                </div>
                <div className="space-y-12">
                  <p>Koordinator Tatami</p>
                  <p className="font-bold border-t border-black pt-2 mx-6">( ............................................ )</p>
                </div>
                <div className="space-y-12">
                  <p>Dewan Hakim/Ketua Pelaksana</p>
                  <p className="font-bold border-t border-black pt-2 mx-6">( ............................................ )</p>
                </div>
              </div>
            )}

          </div>
        )}

        {/* CUSTOM MODULES SIDEBAR SYSTEM */}
        {activeTab === 'absensi' && (
          <AbsensiView 
            participants={participants} 
            categories={categories} 
            onUpdateParticipant={(updated) => {
              const nextParts = participants.map(p => p.id === updated.id ? updated : p);
              setParticipants(nextParts);
              saveToLocalStorage(nextParts, categories, matches);
            }} 
            onAddParticipant={handleAddSelfServiceParticipant}
          />
        )}

        {activeTab === 'daftar_hadir' && (
          <DaftarHadirView participants={participants} />
        )}

        {activeTab === 'jadwal_tanding' && (
          <JadwalTandingView 
            matches={matches} 
            participants={participants} 
            categories={categories} 
            onUpdateMatch={(updated) => {
              const nextMatches = matches.map(m => m.id === updated.id ? updated : m);
              setMatches(nextMatches);
              saveToLocalStorage(participants, categories, nextMatches);
            }} 
          />
        )}

        {activeTab === 'live_scoring' && (
          <div className="space-y-6" id="view-live-scoring">
            <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase">Sesi Live Scoring &amp; Arena Scoreboard</h3>
                <p className="text-xs text-slate-400 mt-1">Pilih pertandingan aktif di bawah untuk meliput penilaian langsung wasit dan dewan hakim.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.filter(m => (m.akaId || m.aoId) && !m.isCompleted).length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 bg-slate-950/20 border border-slate-850 rounded-2xl">
                  <Activity className="h-12 w-12 text-slate-800 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs">Tidak ada pertandingan berlangsung saat ini. Silakan generasikan bagan dan jalankan tanding.</p>
                </div>
              ) : (
                matches.filter(m => (m.akaId || m.aoId) && !m.isCompleted).map(m => {
                  const cat = categories.find(c => c.id === m.categoryId);
                  const aka = participants.find(p => p.id === m.akaId);
                  const ao = participants.find(p => p.id === m.aoId);
                  return (
                    <div key={m.id} className="bg-slate-950/70 p-4 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-755 transition">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-950 px-2.5 py-0.5 rounded border border-indigo-900/30">M-{m.matchNumber}</span>
                        <span className="text-xs text-slate-300 font-bold">{cat?.name}</span>
                      </div>
                      <div className="grid grid-cols-5 text-center text-xs py-2">
                        <div className="col-span-2">
                          <p className="font-extrabold text-rose-500">{aka?.name || 'TBD'}</p>
                          <p className="text-[10px] text-slate-500">{aka?.club || '-'}</p>
                        </div>
                        <div className="col-span-1 font-bold text-slate-600">vs</div>
                        <div className="col-span-2">
                          <p className="font-extrabold text-blue-500">{ao?.name || 'TBD'}</p>
                          <p className="text-[10px] text-slate-500">{ao?.club || '-'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveMatchScoring(m);
                          setTempAkaScore(m.akaScore);
                          setTempAoScore(m.aoScore);
                          setTempAkaC1(m.akaPenalties?.c1 || 0);
                          setTempAkaC2(m.akaPenalties?.c2 || 0);
                          setTempAoC1(m.aoPenalties?.c1 || 0);
                          setTempAoC2(m.aoPenalties?.c2 || 0);
                          setTempAkaSenshu(m.akaSenshu || false);
                          setTempAoSenshu(m.aoSenshu || false);
                          setTempAkaHansoku(m.akaPenalties?.hansoku || false);
                          setTempAoHansoku(m.aoPenalties?.hansoku || false);
                        }}
                        className="w-full mt-4 bg-indigo-650 hover:bg-indigo-600 text-xs text-white font-bold py-2 rounded-lg cursor-pointer"
                      >
                        Buka Scoreboard Digital Arena
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'hasil_per_babak' && (
          <HasilPerBabakView 
            matches={matches} 
            participants={participants} 
            categories={categories} 
          />
        )}

        {activeTab === 'manajemen_wasit' && (
          <ManajemenWasitView />
        )}

        {activeTab === 'dashboard_kontingen' && (
          <DashboardKontingenView 
            matches={matches} 
            participants={participants} 
            categories={categories} 
          />
        )}

        {activeTab === 'ekspor_laporan' && (
          <EksporLaporanView 
            matches={matches} 
            participants={participants} 
            categories={categories} 
          />
        )}

        {activeTab === 'sertifikat' && (
          <SertifikatView participants={participants} />
        )}

        {activeTab === 'pengumuman' && (
          <PengumumanView />
        )}

        {activeTab === 'rekap_kuota' && (
          <RekapKuotaView 
            participants={participants} 
            categories={categories} 
          />
        )}

        {activeTab === 'manajemen_user' && (
          <ManajemenUserView />
        )}

        {activeTab === 'pengaturan' && (
          <PengaturanView onSettingsChange={loadThemeFromSettings} />
        )}

        {activeTab === 'visualisasi_kinerja' && (
          <VisualisasiKinerjaView 
            matches={matches} 
            participants={participants} 
            categories={categories} 
          />
        )}

      </main>
    </div>

      {/* FOOTER SECTION */}
      <footer className="border-t border-slate-850 py-4 bg-slate-950 text-center text-xs text-slate-500 print:hidden mt-12" id="main-footer">
        <p>© 2026 FORKINDO - Lembaga Sistem Penjaringan Wasit Juri Karate-Do Indonesia.</p>
        <p className="text-[10px] text-slate-600 mt-1">Single Elimination • Double Elimination • Round Robin • Group Stage Match Systems.</p>
      </footer>

      {/* MODAL CO-PILOT: ARENA REFEREE SCORING SYSTEM PANEL */}
      {activeMatchScoring && (() => {
        const athleteAka = participants.find(p => p.id === activeMatchScoring.akaId);
        const athleteAo = participants.find(p => p.id === activeMatchScoring.aoId);
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm print:hidden" id="modal-scoring">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative">
              
              {/* Header */}
              <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{activeMatchScoring.roundName}</span>
                  <h3 className="text-sm font-bold text-white">Panel Wasit Juri Skor Karate (Tatami Arena)</h3>
                </div>
                <button 
                  id="btn-close-modal"
                  onClick={() => setActiveMatchScoring(null)} 
                  className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Core Scoring Content */}
              <div className="p-4 md:p-6 space-y-6">
                
                {/* Score Grid Aka vs Ao */}
                <div className="grid grid-cols-2 gap-4 divide-x divide-slate-800" id="scoring-duo-grid">
                  
                  {/* RED ATHLETE: AKA */}
                  <div className="pr-2 space-y-4 text-center">
                    <span className="inline-block py-0.5 px-3 rounded text-[10px] font-extrabold uppercase bg-rose-600 text-white tracking-widest">
                      A K A (MERAH)
                    </span>
                    
                    {/* Athlete snapshot */}
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-xl overflow-hidden border-2 border-rose-500 bg-slate-800">
                        <img 
                          src={athleteAka?.photoUrl || KARATEKA_AVATARS[0]} 
                          alt="Athlete Aka" 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <h4 className="font-bold text-sm text-white mt-2 truncate w-full">{athleteAka?.name || 'TBD Athlete'}</h4>
                      <p className="text-xs text-rose-400 font-semibold">{athleteAka?.club || 'No Dojo'}</p>
                    </div>

                    {/* Numeric Point Display */}
                    <div className="py-3">
                      <p className="text-5xl font-black text-rose-500 tracking-tight">{tempAkaScore}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Poin Pertandingan</p>
                    </div>

                    {/* Karate Score Buttons (Ippon, Waza-ari, Yuko) */}
                    <div className="flex flex-col gap-1.5 max-w-[150px] mx-auto">
                      <button 
                        id="btn-aka-ippon"
                        type="button" 
                        onClick={() => setTempAkaScore(prev => prev + 3)}
                        className="bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold py-1 px-3 rounded-lg"
                      >
                        +3 Ippon
                      </button>
                      <button 
                        id="btn-aka-waza"
                        type="button" 
                        onClick={() => setTempAkaScore(prev => prev + 2)}
                        className="bg-rose-600/70 hover:bg-rose-500 text-rose-100 text-xs font-bold py-1 px-3 rounded-lg border border-rose-500/30"
                      >
                        +2 Waza-ari
                      </button>
                      <button 
                        id="btn-aka-yuko"
                        type="button" 
                        onClick={() => setTempAkaScore(prev => prev + 1)}
                        className="bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold py-1 px-3 rounded-lg border border-rose-800/40"
                      >
                        +1 Yuko
                      </button>
                      <button 
                        id="btn-aka-min"
                        type="button" 
                        onClick={() => setTempAkaScore(prev => Math.max(0, prev - 1))}
                        className="text-slate-500 hover:text-slate-300 text-[10px] py-0.5"
                      >
                        Kurangi -1
                      </button>
                    </div>

                    {/* Penalties and Senshu */}
                    <div className="pt-3 border-t border-slate-850 space-y-2">
                      <div className="flex justify-between items-center max-w-[150px] mx-auto text-xs px-2">
                        <span className="text-slate-400">Senshu (Tie-Break)</span>
                        <input 
                          type="checkbox" 
                          id="check-aka-senshu"
                          checked={tempAkaSenshu} 
                          onChange={e => {
                            setTempAkaSenshu(e.target.checked);
                            if (e.target.checked) setTempAoSenshu(false); // only one can have senshu!
                          }}
                          className="rounded text-rose-600 focus:ring-0" 
                        />
                      </div>
                      <div className="flex justify-between items-center max-w-[150px] mx-auto text-xs px-2">
                        <span className="text-slate-400 text-left">Chui C1 Warnings</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setTempAkaC1(p=>Math.max(0,p-1))} className="text-[10px] text-slate-500 font-bold px-1 bg-slate-800 rounded">-</button>
                          <span className="text-red-400 font-bold font-mono">{tempAkaC1}</span>
                          <button type="button" onClick={() => setTempAkaC1(p=>p+1)} className="text-[10px] text-slate-300 font-bold px-1 bg-slate-800 rounded">+</button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center max-w-[150px] mx-auto text-xs px-2">
                        <span className="text-slate-400 text-left">Chui C2 Warnings</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setTempAkaC2(p=>Math.max(0,p-1))} className="text-[10px] text-slate-500 font-bold px-1 bg-slate-800 rounded">-</button>
                          <span className="text-red-400 font-bold font-mono">{tempAkaC2}</span>
                          <button type="button" onClick={() => setTempAkaC2(p=>p+1)} className="text-[10px] text-slate-300 font-bold px-1 bg-slate-800 rounded">+</button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center max-w-[150px] mx-auto text-xs px-2 pt-1 border-t border-dashed border-slate-850">
                        <span className="text-[10px] font-bold text-red-500 uppercase">Hansoku (Disk.)</span>
                        <input 
                          type="checkbox" 
                          id="check-aka-hansoku"
                          checked={tempAkaHansoku} 
                          onChange={e => setTempAkaHansoku(e.target.checked)} 
                          className="rounded text-red-600 focus:ring-0" 
                        />
                      </div>
                    </div>

                  </div>

                  {/* BLUE ATHLETE: AO */}
                  <div className="pl-2 space-y-4 text-center">
                    <span className="inline-block py-0.5 px-3 rounded text-[10px] font-extrabold uppercase bg-indigo-600 text-white tracking-widest">
                      A O (BIRU)
                    </span>
                    
                    {/* Athlete snapshot */}
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-xl overflow-hidden border-2 border-indigo-500 bg-slate-800">
                        <img 
                          src={athleteAo?.photoUrl || KARATEKA_AVATARS[1]} 
                          alt="Athlete Ao" 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <h4 className="font-bold text-sm text-white mt-2 truncate w-full">{athleteAo?.name || 'TBD Athlete'}</h4>
                      <p className="text-xs text-indigo-400 font-semibold">{athleteAo?.club || 'No Dojo'}</p>
                    </div>

                    {/* Numeric Point Display */}
                    <div className="py-3">
                      <p className="text-5xl font-black text-indigo-500 tracking-tight">{tempAoScore}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Poin Pertandingan</p>
                    </div>

                    {/* Karate Score Buttons (Ippon, Waza-ari, Yuko) */}
                    <div className="flex flex-col gap-1.5 max-w-[150px] mx-auto">
                      <button 
                        id="btn-ao-ippon"
                        type="button" 
                        onClick={() => setTempAoScore(prev => prev + 3)}
                        className="bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold py-1 px-3 rounded-lg"
                      >
                        +3 Ippon
                      </button>
                      <button 
                        id="btn-ao-waza"
                        type="button" 
                        onClick={() => setTempAoScore(prev => prev + 2)}
                        className="bg-indigo-600/70 hover:bg-indigo-550 text-indigo-100 text-xs font-bold py-1 px-3 rounded-lg border border-indigo-500/30"
                      >
                        +2 Waza-ari
                      </button>
                      <button 
                        id="btn-ao-yuko"
                        type="button" 
                        onClick={() => setTempAoScore(prev => prev + 1)}
                        className="bg-indigo-900/40 hover:bg-indigo-900/65 text-indigo-300 text-xs font-bold py-1 px-3 rounded-lg border border-indigo-800/40"
                      >
                        +1 Yuko
                      </button>
                      <button 
                        id="btn-ao-min"
                        type="button" 
                        onClick={() => setTempAoScore(prev => Math.max(0, prev - 1))}
                        className="text-slate-500 hover:text-slate-300 text-[10px] py-0.5"
                      >
                        Kurangi -1
                      </button>
                    </div>

                    {/* Penalties and Senshu */}
                    <div className="pt-3 border-t border-slate-850 space-y-2">
                      <div className="flex justify-between items-center max-w-[150px] mx-auto text-xs px-2">
                        <span className="text-slate-400">Senshu (Tie-Break)</span>
                        <input 
                          type="checkbox" 
                          id="check-ao-senshu"
                          checked={tempAoSenshu} 
                          onChange={e => {
                            setTempAoSenshu(e.target.checked);
                            if (e.target.checked) setTempAkaSenshu(false);
                          }}
                          className="rounded text-indigo-600 focus:ring-0" 
                        />
                      </div>
                      <div className="flex justify-between items-center max-w-[150px] mx-auto text-xs px-2">
                        <span className="text-slate-400 text-left">Chui C1 Warnings</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setTempAoC1(p=>Math.max(0,p-1))} className="text-[10px] text-slate-500 font-bold px-1 bg-slate-800 rounded">-</button>
                          <span className="text-red-400 font-bold font-mono">{tempAoC1}</span>
                          <button type="button" onClick={() => setTempAoC1(p=>p+1)} className="text-[10px] text-slate-300 font-bold px-1 bg-slate-800 rounded">+</button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center max-w-[150px] mx-auto text-xs px-2">
                        <span className="text-slate-400 text-left">Chui C2 Warnings</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setTempAoC2(p=>Math.max(0,p-1))} className="text-[10px] text-slate-500 font-bold px-1 bg-slate-800 rounded">-</button>
                          <span className="text-red-400 font-bold font-mono">{tempAoC2}</span>
                          <button type="button" onClick={() => setTempAoC2(p=>p+1)} className="text-[10px] text-slate-300 font-bold px-1 bg-slate-800 rounded">+</button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center max-w-[150px] mx-auto text-xs px-2 pt-1 border-t border-dashed border-slate-850">
                        <span className="text-[10px] font-bold text-red-500 uppercase">Hansoku (Disk.)</span>
                        <input 
                          type="checkbox" 
                          id="check-ao-hansoku"
                          checked={tempAoHansoku} 
                          onChange={e => setTempAoHansoku(e.target.checked)} 
                          className="rounded text-indigo-600 focus:ring-0" 
                        />
                      </div>
                    </div>

                  </div>

                </div>

                {/* HANTEI SELECTOR IN EQUAL SCORE TIES */}
                {tempAkaScore === tempAoScore && !tempAkaSenshu && !tempAoSenshu && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20 text-center">
                    <p className="text-xs text-amber-300 font-bold uppercase tracking-wider mb-2">DRAW/SERI - DIUTUSKAN HANTEI WASIT</p>
                    <p className="text-[11px] text-slate-400 mb-3">Poin dan Senshu setara. Harap pilih dewan juri pemenang (Hantei):</p>
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        id="btn-hantei-aka"
                        onClick={() => setTempHanteiWinner('aka')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition ${
                          tempHanteiWinner === 'aka' ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-900 border-slate-800 text-rose-400'
                        }`}
                      >
                        VOTE AKA (MERAH)
                      </button>
                      <button
                        type="button"
                        id="btn-hantei-ao"
                        onClick={() => setTempHanteiWinner('ao')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition ${
                          tempHanteiWinner === 'ao' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 border-slate-800 text-indigo-400'
                        }`}
                      >
                        VOTE AO (BIRU)
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Action and Save footer */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  id="btn-close-scoring"
                  onClick={() => setActiveMatchScoring(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 px-4 rounded-lg cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  id="btn-save-scoring-changes"
                  onClick={handleSaveScore}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-5 rounded-lg flex items-center gap-1 shadow-lg shadow-indigo-950/40 cursor-pointer"
                >
                  <Check className="h-4 w-4" /> Kunci Kemenangan &amp; Kemajuan
                </button>
              </div>

            </div>

          </div>
        );
      })()}

      {printingCategory && (
        <div className="hidden print:block bg-white text-slate-950 p-6 min-h-screen font-sans" id="cat-print-section">
          {/* Header */}
          <div className="border-b-2 border-slate-950 pb-3 mb-4">
            <h1 className="text-lg font-black uppercase tracking-wider text-slate-950">
              FEDERASI OLAHRAGA KARATE-DO INDONESIA (FORKI) SUMBAR
            </h1>
            <p className="text-xs font-semibold text-slate-600 tracking-wide uppercase mt-0.5">
              KEJUARAAN DAERAH KARATE FORKI SUMBAR 2026 • GOR SASANA PASAMAN
            </p>
          </div>

          <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 flex justify-between items-center text-xs mb-4">
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Kategori Tanding</span>
              <span className="text-black font-extrabold text-sm">{printingCategory.name}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Usia &amp; Kelas</span>
              <span className="text-indigo-900 font-extrabold text-sm">{printingCategory.ageGroup} / {printingCategory.division}</span>
            </div>
          </div>

          <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-2">
            Daftar Resmi Karateka ({participants.filter(p => p.ageGroup === printingCategory.ageGroup && p.division === printingCategory.division).length} Atlet)
          </h2>

          <table className="w-full text-left border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 text-[10px] font-extrabold uppercase">
                <th className="p-2 border border-slate-300 w-10 text-center">No</th>
                <th className="p-2 border border-slate-300">Nama Karateka</th>
                <th className="p-2 border border-slate-300">Dojo / Kontingen Asal</th>
                <th className="p-2 border border-slate-300 w-24 text-center">Target Berat (KG)</th>
                <th className="p-2 border border-slate-300 w-24 text-center">Berat Aktual (KG)</th>
                <th className="p-2 border border-slate-300 w-24 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-slate-900 font-medium whitespace-normal">
              {(() => {
                const list = participants.filter(p => p.ageGroup === printingCategory.ageGroup && p.division === printingCategory.division);
                if (list.length === 0) {
                  return (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-500 italic">
                        Belum ada atlet yang terdaftar dalam kualifikasi kategori kelas ini.
                      </td>
                    </tr>
                  );
                }
                return list.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="p-2 border border-slate-300 text-center font-mono font-bold">{idx + 1}</td>
                    <td className="p-2 border border-slate-300 font-bold">{p.name}</td>
                    <td className="p-2 border border-slate-300 font-semibold text-slate-700">{p.club}</td>
                    <td className="p-2 border border-slate-300 text-center font-mono">{p.weight ? `${p.weight} kg` : '-'}</td>
                    <td className="p-2 border border-slate-300 text-center font-mono">{p.actualWeight ? `${p.actualWeight} kg` : '-'}</td>
                    <td className="p-2 border border-slate-300 text-center text-[10px] font-bold">
                      {p.isCheckedIn ? (
                        <span className="text-emerald-700 uppercase">[ HADIR ]</span>
                      ) : (
                        <span className="text-slate-400 uppercase">[ ABSEN ]</span>
                      )}
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>

          {/* Kolom tanda tangan resmi */}
          <div className="grid grid-cols-2 gap-8 text-center text-xs mt-12 text-black pt-6">
            <div className="space-y-10">
              <p className="font-bold">Ketua Komisi Timbang</p>
              <div className="h-px bg-slate-400 w-40 mx-auto"></div>
              <p className="text-[10px] text-slate-500">FORKI KABUPATEN PASAMAN</p>
            </div>
            <div className="space-y-10">
              <p className="font-bold">Sekretaris Pertandingan</p>
              <div className="h-px bg-slate-400 w-40 mx-auto"></div>
              <p className="text-[10px] text-slate-500">PANITIA PELAKSANA KEJURDA</p>
            </div>
          </div>

          <p className="text-[8px] text-slate-400 text-center mt-12 tracking-wide">
            SISTEM SKORING REAL-TIME DAN MANAJEMEN TURNAMEN FORKI SUMBAR DIGITAL ASSISTANT
          </p>
        </div>
      )}

      {/* IMAGE PREVIEW MODAL */}
      {viewingProof && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setViewingProof(null)}>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Bukti Pembayaran: {viewingProof.name}</h3>
              <button onClick={() => setViewingProof(null)} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 p-2">
              <img src={viewingProof.url} alt="Bukti Pembayaran" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setViewingProof(null)} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold">
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// INDEPENDENT INTERACTIVE UI SUBCOMPONENTS
// ==========================================

interface MatchBracketCardProps {
  match: Match;
  athletes: Participant[];
  onScoringClicked: (m: Match) => void;
  key?: any;
}

function MatchBracketCard({ match, athletes, onScoringClicked }: MatchBracketCardProps) {
  const aka = athletes.find(a => a.id === match.akaId);
  const ao = athletes.find(a => a.id === match.aoId);

  const akaIsWinner = match.winnerId === match.akaId && match.isCompleted;
  const aoIsWinner = match.winnerId === match.aoId && match.isCompleted;

  return (
    <div 
      className={`bg-slate-900 border text-slate-100 rounded-xl overflow-hidden shadow-md w-full transition hover:scale-[1.01] hover:shadow-lg cursor-pointer print:border-black print:text-black print:bg-white print:shadow-none ${
        match.isCompleted ? 'border-indigo-950/40 opacity-90' : 'border-slate-800/80 animate-fade-in'
      }`}
      onClick={() => onScoringClicked(match)}
      id={`bracket-match-node-${match.id}`}
    >
      {/* Match identification banner */}
      <div className="bg-slate-950/80 px-2.5 py-1 text-[9px] font-bold text-slate-400 flex justify-between items-center border-b border-slate-850/60 print:bg-white print:text-black print:border-black">
        <span>MATCH {match.matchNumber}</span>
        <span className="uppercase text-[8px] bg-indigo-950 text-indigo-300 px-1 py-0.5 rounded print:text-black print:bg-white border print:border-black">
          {match.roundName}
        </span>
      </div>

      <div className="p-2 space-y-1.5 print:bg-white">
        
        {/* AKA ROW (RED) */}
        <div className={`flex items-center justify-between p-1 rounded-md transition ${
          akaIsWinner ? 'bg-rose-950/20 font-bold border-l-3 border-rose-500' : 'border-l-3 border-transparent'
        }`}>
          <div className="flex items-center gap-2 max-w-[170px]">
            <div className="h-7 w-7 rounded bg-slate-850 border border-slate-800 overflow-hidden flex-shrink-0 print:border-black">
              <img src={aka?.photoUrl || KARATEKA_AVATARS[0]} alt="aka avatar" className="h-full w-full object-cover" />
            </div>
            <div className="truncate text-xs">
              <p className={`line-clamp-1 truncate text-xs ${akaIsWinner ? 'text-rose-400 font-bold print:text-black' : (match.isCompleted ? 'text-slate-500' : 'text-slate-200 print:text-black')}`}>
                {aka ? aka.name : 'Aka (Menunggu)...'}
              </p>
              {aka && <p className="text-[9px] text-slate-400 truncate uppercase tracking-widest">{aka.club}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 pl-2">
            {match.isCompleted && match.akaSenshu && (
              <span className="text-[8px] font-black uppercase text-amber-400 px-1 border border-amber-500/20 rounded bg-amber-950/20" title="First Score Point Advantage (SENSHU)">S</span>
            )}
            {match.isCompleted && match.akaPenalties.hansoku && (
              <span className="text-[8px] font-black uppercase bg-red-600 text-white px-1 rounded animate-pulse" title="Disqualified via Hansoku">H</span>
            )}
            <span className={`text-base font-black px-1 ${akaIsWinner ? 'text-rose-500 font-extrabold print:text-black' : 'text-slate-400 print:text-black'}`}>
              {match.isCompleted ? match.akaScore : '-'}
            </span>
          </div>
        </div>

        {/* AO ROW (BLUE) */}
        <div className={`flex items-center justify-between p-1 rounded-md transition ${
          aoIsWinner ? 'bg-indigo-950/20 font-bold border-l-3 border-indigo-500' : 'border-l-3 border-transparent'
        }`}>
          <div className="flex items-center gap-2 max-w-[170px]">
            <div className="h-7 w-7 rounded bg-slate-850 border border-slate-800 overflow-hidden flex-shrink-0 print:border-black">
              <img src={ao?.photoUrl || KARATEKA_AVATARS[1]} alt="ao avatar" className="h-full w-full object-cover" />
            </div>
            <div className="truncate text-xs">
              <p className={`line-clamp-1 truncate text-xs ${aoIsWinner ? 'text-indigo-400 font-bold print:text-black' : (match.isCompleted ? 'text-slate-500' : 'text-slate-200 print:text-black')}`}>
                {ao ? ao.name : 'Ao (Menunggu)...'}
              </p>
              {ao && <p className="text-[9px] text-slate-400 truncate uppercase tracking-widest">{ao.club}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 pl-2">
            {match.isCompleted && match.aoSenshu && (
              <span className="text-[8px] font-black uppercase text-amber-400 px-1 border border-amber-500/20 rounded bg-amber-950/20" title="First Score Point Advantage (SENSHU)">S</span>
            )}
            {match.isCompleted && match.aoPenalties.hansoku && (
              <span className="text-[8px] font-black uppercase bg-red-600 text-white px-1 rounded animate-pulse" title="Disqualified via Hansoku">H</span>
            )}
            <span className={`text-base font-black px-1 ${aoIsWinner ? 'text-indigo-500 font-extrabold print:text-black' : 'text-slate-400 print:text-black'}`}>
              {match.isCompleted ? match.aoScore : '-'}
            </span>
          </div>
        </div>

      </div>

      {/* Edit indicator button in pool card */}
      {!match.isCompleted && (aka || ao) && (
        <div className="bg-slate-950/40 text-center py-1 text-[9px] font-bold text-slate-500/80 hover:text-indigo-400 border-t border-slate-850/30 print:hidden transition">
          SISTEM SCORING LIVE 👉
        </div>
      )}
    </div>
  );
}

// Match Row Card for Round Robin listings
interface MatchRowRobinCardProps {
  match: Match;
  athletes: Participant[];
  onScoringClicked: (m: Match) => void;
  key?: any;
}

function MatchRowRobinCard({ match, athletes, onScoringClicked }: MatchRowRobinCardProps) {
  const aka = athletes.find(a => a.id === match.akaId);
  const ao = athletes.find(a => a.id === match.aoId);

  const akaIsWinner = match.winnerId === match.akaId && match.isCompleted;
  const aoIsWinner = match.winnerId === match.aoId && match.isCompleted;

  return (
    <div 
      className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex justify-between items-center hover:border-indigo-950 hover:bg-slate-850/50 transition duration-200 cursor-pointer print:border-black print:bg-white print:text-black text-xs"
      onClick={() => onScoringClicked(match)}
      id={`robin-match-row-${match.id}`}
    >
      <div className="text-[10px] font-bold text-slate-500 w-16 uppercase print:text-black">
        {match.roundName}<br />M-{match.matchNumber}
      </div>

      <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
        
        {/* Aka athlete */}
        <div className={`p-1.5 rounded flex items-center justify-between gap-1 ${akaIsWinner ? 'bg-rose-950/20 font-bold border-l-2 border-rose-500' : ''}`}>
          <span className="truncate max-w-[130px] font-semibold text-slate-200 print:text-black">
            🔴 {aka ? aka.name : 'Unknown'}
          </span>
          <span className="font-bold text-rose-500 ml-1 print:text-black">{match.isCompleted ? match.akaScore : '-'}</span>
        </div>

        {/* Ao athlete */}
        <div className={`p-1.5 rounded flex items-center justify-between gap-1 ${aoIsWinner ? 'bg-indigo-950/20 font-bold border-l-2 border-indigo-500' : ''}`}>
          <span className="truncate max-w-[130px] font-semibold text-slate-200 print:text-black">
            🔵 {ao ? ao.name : 'Unknown'}
          </span>
          <span className="font-bold text-indigo-500 ml-1 print:text-black">{match.isCompleted ? match.aoScore : '-'}</span>
        </div>

      </div>

      <div className="pl-3.5 print:hidden">
        {match.isCompleted ? (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/40">Selesai</span>
        ) : (
          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-900/40 animate-pulse">Tarung</span>
        )}
      </div>
    </div>
  );
}

// Standings Klasemen Table Component
interface StandingsTableProps {
  standings: StandingsRow[];
  athletes: Participant[];
}

function StandingsTable({ standings, athletes }: StandingsTableProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden print:border-black print:text-black print:bg-white text-xs">
      <table className="w-full text-left border-collapse" id="standings-table">
        <thead>
          <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 print:bg-neutral-100 print:text-black print:border-black">
            <th className="py-2.5 px-3 font-bold text-left w-10">Peringkat</th>
            <th className="py-2.5 px-3 font-bold">Karateka / Dojo</th>
            <th className="py-2.5 px-3 font-bold text-center">Main</th>
            <th className="py-2.5 px-3 font-bold text-center">Menang</th>
            <th className="py-2.5 px-3 font-bold text-center">Kalah</th>
            <th className="py-2.5 px-3 font-bold text-center">Skor Tanding (+/-)</th>
            <th className="py-2.5 px-3 font-bold text-center text-amber-400 print:text-black">Poin Klasemen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-850 print:divide-black">
          {standings.map((row, idx) => {
            const athlete = athletes.find(a => a.id === row.participantId);
            return (
              <tr key={row.participantId} className="hover:bg-slate-850/40 print:hover:bg-white" id={`standings-row-${row.participantId}`}>
                <td className="py-3 px-3 font-extrabold text-slate-300 text-center print:text-black">
                  {idx + 1 === 1 ? '🥇' : idx + 1 === 2 ? '🥈' : idx + 1 === 3 ? '🥉' : `${idx + 1}`}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 print:border-black">
                      <img src={athlete?.photoUrl || KARATEKA_AVATARS[0]} alt="avatar" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200 print:text-black">{athlete?.name || 'TBD Athlete'}</p>
                      <p className="text-[10px] text-indigo-400 uppercase tracking-widest">{athlete?.club || 'No Dojo'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 font-semibold text-slate-200 text-center print:text-black">{row.played}</td>
                <td className="py-3 px-3 font-semibold text-emerald-400 text-center print:text-black">{row.won}</td>
                <td className="py-3 px-3 font-semibold text-rose-400 text-center print:text-black">{row.lost}</td>
                <td className="py-3 px-3 font-mono text-slate-400 text-center print:text-black text-[11px]">
                  {row.scoreGiven} - {row.scoreReceived} ({row.scoreGiven - row.scoreReceived >= 0 ? `+${row.scoreGiven - row.scoreReceived}` : row.scoreGiven - row.scoreReceived})
                </td>
                <td className="py-3 px-3 font-extrabold text-amber-400 text-center print:text-black text-sm bg-amber-500/5 print:bg-white">
                  {row.points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
