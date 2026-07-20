import React, { useState, useEffect } from 'react';
import {
  Baby,
  Plus,
  BookOpen,
  Sparkles,
  FileDown,
  FileUp,
  Trash2,
  Ruler,
  Scale,
  Activity,
  Calendar,
  History,
  AlertCircle,
  TrendingUp,
  UserPlus,
  ArrowRight,
  RefreshCw,
  Clock,
  Heart,
  Edit2,
  LogOut,
  Building2,
  Settings
} from 'lucide-react';
import { Child, Measurement, GrowthStatus, WeightStatus, PredictionResponse, ModelMetrics } from './types';
import {
  calculateAge,
  formatAgeText,
  getStuntingStatus,
  getWeightStatus,
  getInterpolatedRecord,
  getHeadCircumferenceStatus
} from './utils/whoStandards';
import GrowthChart from './components/GrowthChart';
import ChildProfileModal from './components/ChildProfileModal';
import AddMeasurementModal from './components/AddMeasurementModal';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import RiwayatSection from './components/RiwayatSection';
import BookGuideModal from './components/BookGuideModal';
import FamilyProfileModal from "./components/FamilyProfileModal";
import { useAuth } from './context/AuthContext';


// Dynamic Date Generator based on Current Time
const getCurrentDateMinusMonths = (months: number): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().split('T')[0];
};


// Seed Data
const DEFAULT_CHILDREN: Child[] = [
  {
    id: 'child-1',
    name: 'Rafasya',
    birthDate: getCurrentDateMinusMonths(6), // Exactly 6 Months old today
    gender: 'Laki-laki',
  }
];

const DEFAULT_MEASUREMENTS: Measurement[] = [
  {
    id: 'm-1',
    childId: 'child-1',
    date: getCurrentDateMinusMonths(6), // birth
    ageMonths: 0,
    height: 50.2,
    weight: 3.4,
    headCircumference: 34.8,
    notes: 'Kondisi lahir sehat dan normal'
  },
  {
    id: 'm-2',
    childId: 'child-1',
    date: getCurrentDateMinusMonths(5), // 1 month
    ageMonths: 1,
    height: 54.1,
    weight: 4.2,
    headCircumference: 37.0,
    notes: 'Imunisasi BCG & Polio 1'
  },
  {
    id: 'm-3',
    childId: 'child-1',
    date: getCurrentDateMinusMonths(4), // 2 months
    ageMonths: 2,
    height: 57.8,
    weight: 5.1,
    headCircumference: 38.8,
    notes: 'Imunisasi DPT-HB-Hib 1 & Polio 2'
  },
  {
    id: 'm-4',
    childId: 'child-1',
    date: getCurrentDateMinusMonths(3), // 3 months
    ageMonths: 3,
    height: 60.5,
    weight: 5.8,
    headCircumference: 40.2,
    notes: 'Tumbuh kembang aktif'
  },
  {
    id: 'm-5',
    childId: 'child-1',
    date: getCurrentDateMinusMonths(2), // 4 months
    ageMonths: 4,
    height: 62.8,
    weight: 6.6,
    headCircumference: 41.1,
    notes: 'Mulai tengkurap mandiri'
  },
  {
    id: 'm-6',
    childId: 'child-1',
    date: getCurrentDateMinusMonths(1), // 5 months
    ageMonths: 5,
    height: 64.5,
    weight: 7.1,
    headCircumference: 42.0,
    notes: 'Persiapan MPASI'
  },
  {
    id: 'm-7',
    childId: 'child-1',
    date: getCurrentDateMinusMonths(0), // 6 months (today)
    ageMonths: 6,
    height: 66.0,
    weight: 7.4,
    headCircumference: 42.7,
    notes: 'Mulai makan MPASI pertama'
  }
];

interface FamilyProfile {
  motherName: string;
  posyanduDesa: string;
  bidanName: string;
}
export default function App() {
  const { user, logout } = useAuth();

  // LocalStorage state initialization
  const [children, setChildren] = useState<Child[]>([]);

  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // UI state
  const [activeChartTab, setActiveChartTab] = useState<'height' | 'weight' | 'head'>('height');
  const [timeRange, setTimeRange] = useState<string>('0-24m');
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [isMeasureModalOpen, setIsMeasureModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [predictions, setPredictions] = useState<PredictionResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'riwayat'>('dashboard');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const [familyProfile, setFamilyProfile] = useState<FamilyProfile>(() => {
    const saved = localStorage.getItem("sikecil-family");

    return saved
      ? JSON.parse(saved)
      : {
        motherName: "",
        posyanduDesa: "",
        bidanName: "",
      };
  });
  // Sync state to LocalStorage
  const fetchMyChildren = async () => {
    if (!user) return;
    try {
      const { childService } = await import('./services/childService');
      const response = await childService.getMyChildren();
      if (response && response.data) {
        const mappedChildren: Child[] = response.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          nik: c.nik,
          birthDate: c.birth_date,
          gender: c.gender === 'L' ? 'Laki-laki' : 'Perempuan'
        }));
        setChildren(mappedChildren);
        setSelectedChildId((prev) => {
          if (mappedChildren.length > 0 && (!prev || !mappedChildren.find((c: Child) => c.id === prev))) {
            return mappedChildren[0].id;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Failed to fetch children from backend', err);
    }
  };

  useEffect(() => {
    fetchMyChildren();
  }, [user]);

  useEffect(() => {
    const headOnly = ['0-13w'];
    const nonHead = ['0-6m', '6-24m', '24-60m'];
    if (activeChartTab === 'head' && nonHead.includes(timeRange)) {
      setTimeRange('0-24m');
    } else if (activeChartTab !== 'head' && headOnly.includes(timeRange)) {
      setTimeRange('0-24m');
    }
  }, [activeChartTab]);

  const fetchMeasurementsForChild = async (childId: string, birthDateStr: string) => {
    try {
      const { measurementService } = await import('./services/measurementService');
      const res = await measurementService.getByChildId(childId);
      if (res && res.data) {
        const birthDate = new Date(birthDateStr);
        const mapped = res.data.map((m: any) => {
          const measDate = new Date(m.date);
          const ageDiffMs = measDate.getTime() - birthDate.getTime();
          const calculatedAgeMonths = ageDiffMs / (1000 * 60 * 60 * 24 * 30.44); // approx months
          return {
            id: m.id,
            childId: m.child_id,
            date: m.date.split('T')[0],
            ageMonths: m.age_months !== undefined ? m.age_months : Math.max(0, calculatedAgeMonths),
            height: m.height,
            weight: m.weight,
            headCircumference: m.head_circ,
            notes: m.notes,
            haz: m.haz,
            waz: m.waz,
            hcaz: m.hcaz,
            status_haz: m.status_haz,
            status_waz: m.status_waz,
            status_hcaz: m.status_hcaz
          };
        });
        setMeasurements(mapped);
      }
    } catch (e) {
      console.error('Failed to fetch measurements', e);
    }
  };

  const fetchLatestPredictionForChild = async (childId: string) => {
    try {
      const { predictionService } = await import('./services/predictionService');
      const res = await predictionService.getLatest(childId);
      const data = res.data as any;
      
      let record = null;
      if (Array.isArray(data) && data.length > 0) {
        record = data[0];
      } else if (data?.prediction) {
        record = data.prediction;
      } else if (data?.id && data?.results) {
        record = data;
      }

      if (record && record.results) {
        let results = record.results;
        if (typeof results === 'string') {
          try {
            results = JSON.parse(results);
          } catch (e) {
            console.error('Failed to parse prediction results', e);
          }
        }
        setPredictions(results);
      } else {
        setPredictions(null);
      }
    } catch (error) {
      console.error('Failed to fetch prediction:', error);
      setPredictions(null);
    }
  };

  useEffect(() => {
    if (selectedChildId && children.length > 0) {
      const child = children.find(c => c.id === selectedChildId) || children[0];
      if (child) {
        fetchMeasurementsForChild(child.id, child.birthDate);
        fetchLatestPredictionForChild(child.id);
      }
    }
  }, [selectedChildId, children]);

  useEffect(() => {
    localStorage.setItem(
      "sikecil-family",
      JSON.stringify(familyProfile)
    );
  }, [familyProfile]);

  const [isFamilyModalOpen, setIsFamilyModalOpen] =
    useState(false);
  // Derived state
  const currentChild = children.find(c => c.id === selectedChildId) || children[0] || null;

  const isGirl = currentChild?.gender === 'Perempuan';
  const theme = isGirl ? {
    bgLight: 'bg-pink-50',
    bgLight80: 'bg-pink-50/80',
    text: 'text-pink-600',
    textDark: 'text-pink-700',
    bg: 'bg-pink-600',
    bgHover: 'hover:bg-pink-700',
    border: 'border-pink-200',
    borderLight: 'border-pink-100',
    ring: 'ring-pink-500',
    ring10: 'ring-pink-500/10',
    shadow: 'shadow-pink-600/20',
    gradient: 'from-pink-600 to-rose-700',
    shadowColor: 'shadow-pink-600/10'
  } : {
    bgLight: 'bg-sky-50',
    bgLight80: 'bg-sky-50/80',
    text: 'text-sky-600',
    textDark: 'text-sky-700',
    bg: 'bg-sky-600',
    bgHover: 'hover:bg-sky-700',
    border: 'border-sky-200',
    borderLight: 'border-sky-100',
    ring: 'ring-sky-500',
    ring10: 'ring-sky-500/10',
    shadow: 'shadow-sky-600/20',
    gradient: 'from-sky-600 to-indigo-700',
    shadowColor: 'shadow-sky-600/10'
  };

  const currentMeasurements = currentChild
    ? measurements.filter(m => m.childId === currentChild.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  const latestMeasurement = currentMeasurements.length > 0
    ? currentMeasurements[currentMeasurements.length - 1]
    : null;

  // Calculate stats for current child
  const stuntingAnalysis = currentChild && latestMeasurement
    ? getStuntingStatus(latestMeasurement.height, latestMeasurement.ageMonths, currentChild.gender, latestMeasurement.haz, latestMeasurement.status_haz)
    : null;

  const weightAnalysis = currentChild && latestMeasurement
    ? getWeightStatus(latestMeasurement.weight, latestMeasurement.ageMonths, currentChild.gender, latestMeasurement.waz, latestMeasurement.status_waz)
    : null;

  const headAnalysis = currentChild && latestMeasurement && latestMeasurement.headCircumference !== undefined
    ? getHeadCircumferenceStatus(latestMeasurement.headCircumference, latestMeasurement.ageMonths, currentChild.gender, latestMeasurement.hcaz, latestMeasurement.status_hcaz)
    : null;


  // Manage child saving
  const handleSaveChild = async (childData: Omit<Child, 'id'> & { id?: string }) => {
    try {
      const { childService } = await import('./services/childService');
      
      const payload = {
        name: childData.name,
        nik: childData.nik || '',
        birth_date: childData.birthDate,
        gender: childData.gender === 'Laki-laki' ? 'L' : 'P' as 'L' | 'P',
        user_id: user?.id || ''
      };

      if (childData.id) {
        // Edit
        await childService.update(childData.id, payload);
        triggerStatus('Profil anak berhasil diubah', 'success');
      } else {
        // Create new
        await childService.create(payload);
        triggerStatus('Profil anak berhasil ditambahkan', 'success');
      }
      
      await fetchMyChildren();
    } catch (e: any) {
      console.error(e);
      triggerStatus(e?.response?.data?.message || 'Gagal menyimpan data anak', 'error');
    }
  };

  // Manage measurement saving
  const handleSaveMeasurement = async (measureData: Omit<Measurement, 'id' | 'ageMonths'> & { id?: string }) => {
    if (!currentChild) return;

    try {
      const { measurementService } = await import('./services/measurementService');
      const payload = {
        date: measureData.date,
        height: measureData.height,
        weight: measureData.weight,
        head_circ: measureData.headCircumference,
        notes: measureData.notes
      };

      if (measureData.id) {
        // Edit existing
        await measurementService.update(currentChild.id, measureData.id, payload);
        triggerStatus('Catatan pertumbuhan berhasil diperbarui', 'success');
      } else {
        // Create new
        await measurementService.create(currentChild.id, payload);
        triggerStatus('Catatan pertumbuhan baru berhasil ditambahkan', 'success');
      }
      
      await fetchMeasurementsForChild(currentChild.id, currentChild.birthDate);
    } catch (e: any) {
      console.error(e);
      triggerStatus(e?.response?.data?.message || 'Gagal menyimpan catatan', 'error');
    }
  };

  // Manage deletion
  const handleDeleteChild = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus profil anak ini beserta semua catatan pertumbuhannya?')) {
      try {
        const { childService } = await import('./services/childService');
        await childService.delete(id);
        triggerStatus('Profil anak berhasil dihapus', 'success');
        await fetchMyChildren();
      } catch (e: any) {
        triggerStatus('Gagal menghapus anak', 'error');
      }
    }
  };

  const handleDeleteMeasurement = async (id: string) => {
    if (!currentChild) return;
    if (window.confirm('Hapus catatan pertumbuhan ini?')) {
      try {
        const { measurementService } = await import('./services/measurementService');
        await measurementService.delete(currentChild.id, id);
        triggerStatus('Catatan pertumbuhan dihapus', 'success');
        await fetchMeasurementsForChild(currentChild.id, currentChild.birthDate);
      } catch (e: any) {
        triggerStatus('Gagal menghapus catatan', 'error');
      }
    }
  };

  // Trigger temporary status banner
  const triggerStatus = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  const handlePredictHeight = async () => {
    if (!currentChild) return;
    if (currentMeasurements.length < 3) {
      triggerStatus('Butuh minimal 3 data pengukuran untuk prediksi', 'error');
      return;
    }

    setIsPredicting(true);
    try {
      const { predictionService } = await import('./services/predictionService');
      const response = await predictionService.generate(currentChild.id);
      const data = response.data;
      let record = null;
      if (Array.isArray(data) && data.length > 0) {
        record = data[0];
      } else if (data?.results) {
        record = data;
      }

      let results = record?.results;
      if (typeof results === 'string') {
        try {
          results = JSON.parse(results);
        } catch (e) {
          console.error('Failed to parse generate results', e);
        }
      }
      setPredictions(results);
      triggerStatus('Prediksi berhasil dimuat', 'success');
      setActiveChartTab('height');
    } catch (e) {
      console.error(e);
      triggerStatus('Gagal memproses prediksi AI', 'error');
    } finally {
      setIsPredicting(false);
    }
  };

  // Backup data
  const handleExportData = () => {
    try {
      const dataToExport = {
        children,
        measurements,
        version: '1.0',
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SiKecil_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerStatus('Data berhasil diekspor sebagai cadangan', 'success');
    } catch (e) {
      triggerStatus('Gagal mengekspor data', 'error');
    }
  };

  // Import data
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.children && parsed.measurements) {
          setChildren(parsed.children);
          setMeasurements(parsed.measurements);
          if (parsed.children.length > 0) {
            setSelectedChildId(parsed.children[0].id);
          }
          triggerStatus('Data cadangan berhasil dipulihkan', 'success');
        } else {
          triggerStatus('Format file cadangan tidak valid', 'error');
        }
      } catch (err) {
        triggerStatus('Gagal membaca file cadangan', 'error');
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-20">

      {/* Top Banner / Toast */}
      {statusMessage && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg border text-sm font-bold animate-bounce flex items-center gap-2 ${statusMessage.type === 'success'
          ? 'bg-emerald-600 text-white border-emerald-500'
          : 'bg-red-600 text-white border-red-500'
          }`}>
          <span>{statusMessage.type === 'success' ? '' : ''}</span>
          {statusMessage.text}
        </div>
      )}

      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-250 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-600/20">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight font-display flex items-center gap-2">
                SiKecil <span className="text-[10px] bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full font-bold border border-sky-100">PWA</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Cegah & Pantau Stunting</p>
            </div>

          </div>

          <div className="flex items-center gap-4">

            {/* Backup & Add Data Action Buttons */}
            <div className="flex items-center gap-1 p-1 rounded-xl border border-slate-200">

              <button
                onClick={() => setIsBookModalOpen(true)}
              >
                <BookOpen className="w-5 h-5 text-slate-600 hover:text-sky-600" />
              </button>

            </div>

            {/* Profile and Logout for Logged-in Users */}
            {user && (
              <>
                <div className="w-px h-6 bg-slate-200"></div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 flex-1 flex flex-col gap-6 w-full">

        {/* PWA Install Promotion Banner */}
        <PWAInstallPrompt />

        {currentPage === 'riwayat' && currentChild ? (
          <RiwayatSection
            child={currentChild}
            measurements={currentMeasurements}
            onBack={() => setCurrentPage('dashboard')}
            onEdit={(m) => { setEditingMeasurement(m); setIsMeasureModalOpen(true); }}
            onDelete={handleDeleteMeasurement}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            {/* Left / Center Column: Charts and Records (Takes 2/3 space on desktop) */}
            <div className="md:col-span-2 space-y-6 flex flex-col">

              {/* Profile Switcher Section */}
              {/* KARTU 1: Profil Ibu + Pilih Profil Si Kecil (digabung 1 kartu) */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">

                {/* Bagian atas: Profil Ibu & Posyandu */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 shadow-sm flex items-center justify-center text-white font-extrabold text-xl shrink-0">
                    {(user?.name || user?.username || 'O').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700">
                        {user?.role === 'ortu' ? 'Orang Tua' : (user?.role || 'Pengguna')}
                      </span>
                    </div>
                    <p className="text-slate-800 font-extrabold text-lg truncate leading-tight">
                      {user?.name || user?.username || 'Pengguna Aplikasi'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <p className="text-xs text-slate-500 truncate">
                        {user?.posyandu?.name ? user.posyandu.name : (familyProfile.posyanduDesa ? `Posyandu ${familyProfile.posyanduDesa}` : 'Data posyandu belum diisi')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFamilyModalOpen(true)}
                    className="p-2.5 text-sky-600 hover:bg-sky-50 rounded-xl transition-colors shrink-0"
                    title="Pengaturan Profil"
                  >
                    <Settings size={20} />
                  </button>
                </div>

                {/* Garis pemisah */}
                <div className="border-t border-slate-100"></div>

                {/* Bagian bawah: Pilih Profil Si Kecil (persis seperti sebelumnya) */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih Profil Si Kecil</label>
                  <button
                    onClick={() => {
                      setEditingChild(null);
                      setIsChildModalOpen(true);
                    }}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1.5 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Tambah Anak
                  </button>
                </div>


                {children.length === 0 ? (
                  <div className="p-6 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-500 font-medium">Belum ada data anak di perangkat ini.</p>
                    <button
                      onClick={() => setIsChildModalOpen(true)}
                      className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-sky-600/15"
                    >
                      Buat Profil Pertama
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedChildId}
                      onChange={(e) => setSelectedChildId(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
                    >
                      {children.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.gender === 'Laki-laki' ? 'L' : 'P'})
                        </option>
                      ))}
                    </select>

                    {currentChild && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingChild(currentChild);
                            setIsChildModalOpen(true);
                          }}
                          title="Edit Profil"
                          className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl transition-all text-sm font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteChild(currentChild.id)}
                          title="Hapus Profil"
                          className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all text-sm font-bold"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Stats Grid */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Metrik Terakhir</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingMeasurement(null);
                        setIsMeasureModalOpen(true);
                      }}
                      disabled={!currentChild}
                      title="Tambah Data Pertumbuhan"
                      className="p-2 text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage('riwayat')}
                      disabled={!currentChild}
                      title="Lihat Riwayat"
                      className="p-2 text-sky-600 bg-sky-50 hover:bg-sky-100 disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed rounded-lg border border-sky-100 transition-all"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {/* Card Height */}
                  <div
                    onClick={() => setActiveChartTab('height')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-center relative ${activeChartTab === 'height'
                      ? `${theme.bgLight80} ${theme.border} ring-2 ${theme.ring10}`
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Ruler className={`w-4 h-4 ${activeChartTab === 'height' ? theme.text : 'text-slate-400'}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${activeChartTab === 'height' ? theme.text : 'text-slate-400'}`}>Tinggi</span>
                      <span className={`text-sm font-extrabold block leading-tight ${activeChartTab === 'height' ? theme.textDark : 'text-slate-800'}`}>
                        {latestMeasurement ? `${latestMeasurement.height} cm` : '--'}
                      </span>
                      {stuntingAnalysis && (
                        <span
                          className={`mt-2 px-2 py-1 rounded-full text-[10px] font-bold ${stuntingAnalysis.colorClass}`}
                        >
                          {stuntingAnalysis.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Weight */}
                  <div
                    onClick={() => setActiveChartTab('weight')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-center relative ${activeChartTab === 'weight'
                      ? `${theme.bgLight80} ${theme.border} ring-2 ${theme.ring10}`
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Scale className={`w-4 h-4 ${activeChartTab === 'weight' ? theme.text : 'text-slate-400'}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${activeChartTab === 'weight' ? theme.text : 'text-slate-400'}`}>Berat</span>
                      <span className={`text-sm font-extrabold block leading-tight ${activeChartTab === 'weight' ? theme.textDark : 'text-slate-800'}`}>
                        {latestMeasurement ? `${latestMeasurement.weight} kg` : '--'}
                      </span>
                      {weightAnalysis && (
                        <span
                          className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${weightAnalysis.colorClass}`}
                        >
                          {weightAnalysis.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Head */}
                  <div
                    onClick={() => setActiveChartTab('head')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-center relative ${activeChartTab === 'head'
                      ? `${theme.bgLight80} ${theme.border} ring-2 ${theme.ring10}`
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Heart className={`w-4 h-4 ${activeChartTab === 'head' ? theme.text : 'text-slate-400'}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${activeChartTab === 'head' ? theme.text : 'text-slate-400'}`}>L. Kepala</span>
                      <span className={`text-sm font-extrabold block leading-tight ${activeChartTab === 'head' ? theme.textDark : 'text-slate-800'}`}>
                        {latestMeasurement?.headCircumference ? `${latestMeasurement.headCircumference} cm` : '--'}
                      </span>
                      {headAnalysis && (
                        <span
                          className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${headAnalysis.colorClass}`}
                        >
                          {headAnalysis.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {latestMeasurement && (
                  <div className="text-center text-[10px] font-bold text-slate-400 bg-slate-50 py-1.5 rounded-lg border border-slate-200 flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Pengukuran: {new Date(latestMeasurement.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>

              {currentChild && (
                <>
                  {/* Growth Chart Section */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">

                    {/* Chart Filter & Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold text-slate-800 flex items-center gap-1.5 font-display text-base">
                          <TrendingUp className={`w-5 h-5 ${theme.text}`} />
                          Grafik Standar WHO
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Memantau tumbuh kembang anak secara mandiri</p>
                      </div>

                      {/* Select range dropdown */}
                      <div className="flex gap-2">
                        {activeChartTab === 'head' ? (
                          <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className={`bg-slate-50 border border-slate-200 text-[11px] font-extrabold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 cursor-pointer uppercase tracking-wider`}
                          >
                            <option value="0-13w">0 - 13 Minggu</option>
                            <option value="0-24m">0 - 2 Tahun</option>
                            <option value="0-60m">0 - 5 Tahun</option>
                          </select>
                        ) : (
                          <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className={`bg-slate-50 border border-slate-200 text-[11px] font-extrabold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 cursor-pointer uppercase tracking-wider`}
                          >
                            <option value="0-6m">0 - 6 Bulan (Mingguan)</option>
                            <option value="0-24m">0 - 2 Tahun</option>
                            <option value="6-24m">6 Bulan - 2 Tahun</option>
                            <option value="24-60m">2 - 5 Tahun</option>
                            <option value="0-60m">0 - 5 Tahun</option>
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Tab Selector: Height vs Weight vs Head Circumference */}
                    <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl">
                      <button
                        onClick={() => setActiveChartTab('height')}
                        className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${activeChartTab === 'height'
                          ? `bg-white ${theme.textDark} shadow-sm border-b border-slate-200/50`
                          : 'text-slate-500 hover:text-slate-800'
                          }`}
                      >
                        Tinggi
                      </button>
                      <button
                        onClick={() => setActiveChartTab('weight')}
                        className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${activeChartTab === 'weight'
                          ? `bg-white ${theme.textDark} shadow-sm border-b border-slate-200/50`
                          : 'text-slate-500 hover:text-slate-800'
                          }`}
                      >
                        Berat
                      </button>
                      <button
                        onClick={() => setActiveChartTab('head')}
                        className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${activeChartTab === 'head'
                          ? `bg-white ${theme.textDark} shadow-sm border-b border-slate-200/50`
                          : 'text-slate-500 hover:text-slate-800'
                          }`}
                      >
                        L. Kepala
                      </button>
                    </div>

                    {/* The Actual Graph Component */}
                    <div className="w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                      <GrowthChart
                        gender={currentChild.gender}
                        measurements={currentMeasurements}
                        timeRange={timeRange}
                        chartType={activeChartTab}
                        predictions={predictions?.prediction}
                      />
                    </div>

                    {/* Chart Legend Explanation */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-500 font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-1.5 bg-[#10b981] inline-block rounded-full"></span>
                        Median (Ideal)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-1.5 bg-[#eab308] inline-block rounded-full"></span>
                        {activeChartTab === 'height' ? 'Ambang Stunting (-2 SD)' : activeChartTab === 'weight' ? 'Batas Kurang (-2 SD)' : 'Batas Kecil (-2 SD)'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-1.5 bg-[#ef4444] inline-block rounded-full"></span>
                        {activeChartTab === 'height' ? 'Stunting Berat (-3 SD)' : activeChartTab === 'weight' ? 'Sangat Kurang (-3 SD)' : 'Sangat Kecil (-3 SD)'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#0284c7] inline-block rounded-full"></span>
                        Pertumbuhan Anak
                      </div>
                    </div>

                    {/* Tombol ke halaman Riwayat (pengganti kartu Riwayat lama) */}
                    {/* Prediksi AI Pertumbuhan */}
                    <div className="p-3.5 bg-purple-50/50 rounded-xl space-y-3 border border-purple-100">
                      <button
                        onClick={handlePredictHeight}
                        disabled={isPredicting}
                        className={`w-full py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${isPredicting ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                          }`}
                      >
                        {isPredicting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Memproses AI...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Prediksi Sekarang
                          </>
                        )}
                      </button>

                      {predictions && predictions.success && (
                        <div className="pt-3 border-t border-purple-200/60 space-y-3 mt-2">
                          {/* ═══ SECTION EVALUASI MODEL ═══ */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">⚗ Evaluasi Model</span>
                              <div className="flex-1 h-px bg-purple-100"></div>
                            </div>

                            {/* Deskripsi model yang dipilih */}
                            {predictions.description && (
                              <div className="bg-purple-50/80 border border-purple-100 rounded-xl p-3 text-[10px] text-slate-600 leading-relaxed">
                                <p className="font-bold text-purple-700 mb-1">📌 Model Terpilih: {predictions.selected_model}</p>
                                <p>{predictions.description}</p>
                              </div>
                            )}

                            {/* Tabel Perbandingan Semua Model */}
                            {predictions.metrics && Object.keys(predictions.metrics).length > 0 && (
                              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="bg-slate-50 px-3 py-2 border-b border-slate-100">
                                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Perbandingan Semua Model</span>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-[10px]">
                                    <thead>
                                      <tr className="border-b border-slate-100">
                                        <th className="text-left px-3 py-2 text-slate-500 font-bold">Model</th>
                                        <th className="text-center px-2 py-2 text-slate-500 font-bold">R²</th>
                                        <th className="text-center px-2 py-2 text-slate-500 font-bold">MAE</th>
                                        <th className="text-center px-2 py-2 text-slate-500 font-bold">RMSE</th>
                                        <th className="text-center px-2 py-2 text-slate-500 font-bold">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(Object.entries(predictions.metrics) as [string, ModelMetrics][])
                                        .sort(([, a], [, b]) => b.r2 - a.r2) // urutkan dari R² tertinggi
                                        .map(([modelName, m], idx) => {
                                          const isSelected = modelName === predictions.selected_model;
                                          const isBest = idx === 0; // R² tertinggi = terbaik
                                          return (
                                            <tr
                                              key={modelName}
                                              className={`border-b border-slate-50 last:border-0 ${isSelected ? 'bg-purple-50' : 'hover:bg-slate-50'}`}
                                            >
                                              <td className="px-3 py-2.5">
                                                <div className="flex flex-col gap-0.5">
                                                  <span className={`font-bold ${isSelected ? 'text-purple-700' : 'text-slate-700'}`}>
                                                    {modelName}
                                                  </span>
                                                </div>
                                              </td>
                                              <td className="text-center px-2 py-2.5">
                                                <span className={`font-bold ${m.r2 >= 0.95 ? 'text-emerald-600' : m.r2 >= 0.8 ? 'text-amber-600' : 'text-red-500'}`}>
                                                  {m.r2.toFixed(4)}
                                                </span>
                                              </td>
                                              <td className="text-center px-2 py-2.5">
                                                <span className={`font-bold ${m.mae <= 0.5 ? 'text-emerald-600' : m.mae <= 2 ? 'text-amber-600' : 'text-red-500'}`}>
                                                  {m.mae < 0.01 ? m.mae.toFixed(6) : m.mae.toFixed(3)}
                                                </span>
                                              </td>
                                              <td className="text-center px-2 py-2.5">
                                                <span className={`font-bold ${m.rmse <= 0.5 ? 'text-emerald-600' : m.rmse <= 2 ? 'text-amber-600' : 'text-red-500'}`}>
                                                  {m.rmse < 0.01 ? m.rmse.toFixed(6) : m.rmse.toFixed(3)}
                                                </span>
                                              </td>
                                              <td className="text-center px-2 py-2.5">
                                                <div className="flex flex-col items-center gap-1">
                                                  {isBest && (
                                                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-bold whitespace-nowrap">
                                                      ★ Terbaik
                                                    </span>
                                                  )}
                                                  {isSelected && (
                                                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[9px] font-bold whitespace-nowrap">
                                                      ✓ Digunakan
                                                    </span>
                                                  )}
                                                  {!isBest && !isSelected && (
                                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[9px] font-semibold">
                                                      Alternatif
                                                    </span>
                                                  )}
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Legend Metrik */}
                                <div className="px-3 py-2.5 bg-slate-50 border-t border-slate-100 space-y-1.5">
                                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Keterangan Metrik:</p>
                                  <div className="grid grid-cols-1 gap-1 text-[9px] text-slate-500">
                                    <div className="flex gap-1.5">
                                      <span className="font-bold text-slate-700 shrink-0">R²</span>
                                      <span>— Koefisien determinasi (mendekati <span className="text-emerald-600 font-bold">1.0 = sangat akurat</span>)</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                      <span className="font-bold text-slate-700 shrink-0">MAE</span>
                                      <span>— Rata-rata error absolut (<span className="text-emerald-600 font-bold">mendekati 0 = lebih baik</span>)</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                      <span className="font-bold text-slate-700 shrink-0">RMSE</span>
                                      <span>— Akar rata-rata kuadrat error (<span className="text-emerald-600 font-bold">mendekati 0 = lebih baik</span>)</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Kesimpulan Pemilihan Model */}
                            {predictions.metrics && Object.keys(predictions.metrics).length > 1 && (() => {
                              const sortedModels = (Object.entries(predictions.metrics) as [string, ModelMetrics][]).sort(([, a], [, b]) => b.r2 - a.r2);
                              const bestModel = sortedModels[0][0];
                              const bestMetrics = sortedModels[0][1];
                              const isSelectedAlsoBest = bestModel === predictions.selected_model;
                              return (
                                <div className={`rounded-xl p-3 border text-[10px] space-y-1 ${isSelectedAlsoBest ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                                  <p className={`font-bold ${isSelectedAlsoBest ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {isSelectedAlsoBest ? '✅ Kesimpulan Evaluasi' : '💡 Kesimpulan Evaluasi'}
                                  </p>
                                  <p className={`leading-relaxed ${isSelectedAlsoBest ? 'text-emerald-600' : 'text-amber-700'}`}>
                                    {isSelectedAlsoBest
                                      ? `Model "${bestModel}" dipilih karena memiliki performa terbaik dengan R² = ${bestMetrics.r2.toFixed(4)} dan MAE terkecil (${bestMetrics.mae < 0.01 ? bestMetrics.mae.toFixed(6) : bestMetrics.mae.toFixed(3)} cm). Model ini paling akurat untuk memprediksi pertumbuhan anak ini.`
                                      : `Model "${predictions.selected_model}" digunakan sebagai model utama. Model "${bestModel}" memiliki R² lebih tinggi (${bestMetrics.r2.toFixed(4)}) namun "${predictions.selected_model}" diprioritaskan karena mempertimbangkan karakteristik data anak.`
                                    }
                                  </p>
                                </div>
                              );
                            })()}

                            {/* Info versi & data history */}
                            <div className="flex items-center justify-between text-[9px] text-slate-400 px-1">
                              <span>Versi engine: <span className="font-bold">{predictions.version ?? 'v3'}</span></span>
                              <span>Data historis: <span className="font-bold">{predictions.n_history} titik</span></span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column: Quick Stats, Analysis and Advice (Takes 1/3 space on desktop) */}
            <div className="space-y-6">
              {currentChild && (
                <>
                  {/* Analysis Box */}
                  {latestMeasurement && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-800 flex items-center gap-1.5 font-display text-sm">
                          <Activity className="w-4 h-4 text-sky-600" />
                          Analisis Status Gizi
                        </h3>
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-semibold">Usia Pengukuran</span>
                          <span className="font-bold text-slate-800">{formatAgeText(currentChild.birthDate, latestMeasurement.date)}</span>
                        </div>

                        {activeChartTab === 'height' && stuntingAnalysis && (
                          <>
                            <div className="flex items-center justify-between text-xs border-t border-slate-150 pt-2">
                              <span className="text-slate-500 font-semibold">Status Tinggi (HAZ)</span>
                              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded border uppercase ${stuntingAnalysis.colorClass}`}>
                                {stuntingAnalysis.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-1">
                              <span className="text-slate-500 font-semibold">Skor Z (HAZ)</span>
                              <span className={`font-bold ${stuntingAnalysis.textClass}`}>{stuntingAnalysis.zScore} SD</span>
                            </div>
                          </>
                        )}

                        {activeChartTab === 'weight' && weightAnalysis && (
                          <>
                            <div className="flex items-center justify-between text-xs border-t border-slate-150 pt-2">
                              <span className="text-slate-500 font-semibold">Status Berat (WAZ)</span>
                              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded border uppercase ${weightAnalysis.colorClass}`}>
                                {weightAnalysis.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-1">
                              <span className="text-slate-500 font-semibold">Skor Z (WAZ)</span>
                              <span className={`font-bold ${weightAnalysis.textClass}`}>{weightAnalysis.zScore} SD</span>
                            </div>
                          </>
                        )}

                        {activeChartTab === 'head' && headAnalysis && (
                          <>
                            <div className="flex items-center justify-between text-xs border-t border-slate-150 pt-2">
                              <span className="text-slate-500 font-semibold">Status L. Kepala (HCFA)</span>
                              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded border uppercase ${headAnalysis.colorClass}`}>
                                {headAnalysis.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-1">
                              <span className="text-slate-500 font-semibold">Skor Z (HCFA)</span>
                              <span className={`font-bold ${headAnalysis.textClass}`}>{headAnalysis.zScore} SD</span>
                            </div>
                          </>
                        )}

                        {activeChartTab === 'head' && !headAnalysis && (
                          <div className="text-xs text-amber-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 mt-2 text-center font-semibold">
                            Data lingkar kepala belum dicatatkan untuk pengukuran terbaru ini.
                          </div>
                        )}
                      </div>

                      {/* Interpretation recommendation block */}
                      <div className="text-xs text-slate-600 leading-relaxed bg-sky-50/30 p-3.5 rounded-xl border border-sky-100">
                        {activeChartTab === 'height' && stuntingAnalysis && (
                          <>
                            {stuntingAnalysis.status === 'Normal' && (
                              <p><strong>Pertumbuhan anak normal dan optimal!</strong> Teruskan pemberian ASI eksklusif/MPASI bergizi seimbang, imunisasi lengkap, dan pemantauan berkala di posyandu.</p>
                            )}
                            {stuntingAnalysis.status === 'Pendek' && (
                              <p><strong>Perhatian (Stunted/Pendek):</strong> Anak berada di bawah batas normal standar WHO. Direkomendasikan menambah asupan protein hewani (telur, ikan, daging) dan berkonsultasi dengan puskesmas/dokter anak.</p>
                            )}
                            {stuntingAnalysis.status === 'Sangat Pendek' && (
                              <p><strong>Peringatan Keras (Severely Stunted):</strong> Anak terindikasi stunting berat. Mohon segera jadwalkan pemeriksaan medis di Puskesmas atau Dokter Anak terdekat untuk penanganan gizi darurat.</p>
                            )}
                            {stuntingAnalysis.status === 'Tinggi' && (
                              <p><strong>Pertumbuhan tinggi badan di atas rata-rata!</strong> Tetap jaga asupan nutrisi makro & mikro seimbang untuk mendukung aktivitas fisiknya.</p>
                            )}
                          </>
                        )}

                        {activeChartTab === 'weight' && weightAnalysis && (
                          <>
                            {weightAnalysis.status === 'Normal' && (
                              <p><strong>Berat badan anak ideal!</strong> Menandakan asupan gizi harian tercukupi dengan baik sesuai grafik acuan tumbuh kembang.</p>
                            )}
                            {weightAnalysis.status === 'Kurang' && (
                              <p><strong>Berat Badan Kurang (Underweight):</strong> Berisiko kekurangan gizi akut. Berikan makanan padat energi, tingkatkan frekuensi menyusui, dan pantau kenaikan berat badan tiap minggu.</p>
                            )}
                            {weightAnalysis.status === 'Sangat Kurang' && (
                              <p><strong>Berat Badan Sangat Kurang:</strong> Indikasi wasting / gizi buruk. Segera bawa anak ke faskes untuk diperiksa kondisi klinis dan menerima formula makanan pemulihan.</p>
                            )}
                            {weightAnalysis.status === 'Risiko Berat Badan Lebih' && (
                              <p><strong>Risiko Berat Badan Lebih:</strong> Batasi asupan pemanis buatan, atur jadwal makan beraturan, dan dukung motorik kasar anak agar tetap aktif bergerak.</p>
                            )}
                          </>
                        )}

                        {activeChartTab === 'head' && headAnalysis && (
                          <>
                            {headAnalysis.status === 'Normal' && (
                              <p><strong>Lingkar kepala anak normal!</strong> Menunjukkan perkembangan otak dan tengkorak kepala berjalan dengan sangat optimal sesuai usianya.</p>
                            )}
                            {headAnalysis.status === 'Kecil' && (
                              <p><strong>Lingkar Kepala Kecil (Risiko Mikrosefali):</strong> Ukuran kepala di bawah batas ideal. Direkomendasikan berkonsultasi dengan dokter anak untuk pemantauan tumbuh kembang saraf sensorik dan motorik secara teliti.</p>
                            )}
                            {headAnalysis.status === 'Sangat Kecil' && (
                              <p><strong>Lingkar Kepala Sangat Kecil:</strong> Terindikasi keterlambatan pertumbuhan tengkorak/otak. Segera bawa anak ke faskes atau dokter spesialis anak terdekat untuk pemeriksaan menyeluruh.</p>
                            )}
                            {headAnalysis.status === 'Sangat Besar' && (
                              <p><strong>Lingkar Kepala Sangat Besar (Risiko Makrosefali):</strong> Di atas rata-rata rujukan WHO. Segera konsultasikan ke dokter anak untuk memastikannya normal secara genetik atau membutuhkan penanganan medis khusus.</p>
                            )}
                          </>
                        )}

                        {activeChartTab === 'head' && !headAnalysis && (
                          <p><strong>Tips L. Kepala:</strong> Rutin mengukur lingkar kepala anak di bawah 2 tahun sangat penting untuk mendeteksi dini gangguan tumbuh kembang otak (mikrosefali / makrosefali).</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Advice Card with Gorgeous Gradient Background */}
                  <div className="bg-gradient-to-br from-sky-600 to-indigo-700 rounded-2xl shadow-lg shadow-sky-600/10 p-6 text-white relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2.5 py-1 rounded-full">Tips Bulan Ini</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold font-display leading-snug">Optimalkan Asupan Protein Hewani</h4>
                        <p className="text-xs text-sky-100 leading-relaxed mt-2">
                          Si Kecil membutuhkan protein kualitas tinggi dari telur, ikan, susu, atau daging ayam/sapi untuk mendukung pertumbuhan tulang linear yang mencegah stunting.
                        </p>
                      </div>

                      <div className="bg-white/20 p-3.5 rounded-xl backdrop-blur-sm border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center font-bold text-sm">
                            *
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold opacity-75">Jadwal Posyandu Terdekat</p>
                            <p className="text-xs font-bold">Selasa Depan (Pukul 08:00 - selesai)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-sky-400/20 rounded-full blur-xl"></div>
                  </div>
                </>
              )}
            </div>

          </div>
        )}
      </main>

      {/* Child Profile Modal */}
      <ChildProfileModal
        isOpen={isChildModalOpen}
        onClose={() => setIsChildModalOpen(false)}
        onSave={handleSaveChild}
        initialChild={editingChild}
      />

      {/* Measurement Modal */}
      {currentChild && (
        <AddMeasurementModal
          isOpen={isMeasureModalOpen}
          onClose={() => setIsMeasureModalOpen(false)}
          onSave={handleSaveMeasurement}
          selectedChild={currentChild}
          latestMeasurement={latestMeasurement}
          editingMeasurement={editingMeasurement}
        />
      )}

      {/* Book Guide Modal */}
      <BookGuideModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
      />
      <FamilyProfileModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        profile={familyProfile}
        onSave={(data) => setFamilyProfile(data)}
      />
    </div>
  );
}