import React, { useState, useEffect } from 'react';
import {
  Baby,
  Plus,
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
  Edit2
} from 'lucide-react';
import { Child, Measurement, GrowthStatus, WeightStatus, PredictionResponse } from './types';
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
    birthDate: getCurrentDateMinusMonths(4), // Exactly 4 Months old today
    gender: 'Laki-laki',
  }
];

const DEFAULT_MEASUREMENTS: Measurement[] = [
  {
    id: 'm-1',
    childId: 'child-1',
    date: getCurrentDateMinusMonths(4), // birth
    ageMonths: 0,
    height: 50.0,
    weight: 3.4,
    headCircumference: 34,
    notes: 'Kondisi lahir sehat dan normal'
  },
  {
    id: 'm-2',
    childId: 'child-1',
    date: getCurrentDateMinusMonths(3), // 1 month
    ageMonths: 1,
    height: 54.5,
    weight: 4.5,
    headCircumference: 37,
    notes: 'Imunisasi BCG & Polio 1'
  },
  {
    id: 'm-3',
    childId: 'child-1',
    date: getCurrentDateMinusMonths(2), // 2 months
    ageMonths: 2,
    height: 58.2,
    weight: 5.5,
    headCircumference: 39,
    notes: 'Imunisasi DPT-HB-Hib 1 & Polio 2'
  },
  {
    id: 'm-4',
    childId: 'child-1',
    date: getCurrentDateMinusMonths(1), // 3 months
    ageMonths: 3,
    height: 61.4,
    weight: 6.2,
    headCircumference: 41.5,
    notes: 'Tumbuh kembang aktif, merespon suara'
  },
  {
    id: 'm-5',
    childId: 'child-1',
    date: getCurrentDateMinusMonths(0), // 4 months (today)
    ageMonths: 4,
    height: 64.0,
    weight: 6.8,
    headCircumference: 43.0,
    notes: 'Mulai tengkurap mandiri'
  }
];

export default function App() {
  // LocalStorage state initialization
  const [children, setChildren] = useState<Child[]>(() => {
    const saved = localStorage.getItem('sikecil-children');
    return saved ? JSON.parse(saved) : DEFAULT_CHILDREN;
  });

  const [measurements, setMeasurements] = useState<Measurement[]>(() => {
    const saved = localStorage.getItem('sikecil-measurements');
    return saved ? JSON.parse(saved) : DEFAULT_MEASUREMENTS;
  });

  const [selectedChildId, setSelectedChildId] = useState<string>(() => {
    return children[0]?.id || '';
  });

  // UI state
  const [activeChartTab, setActiveChartTab] = useState<'height' | 'weight' | 'head'>('height');
  const [maxMonthsFilter, setMaxMonthsFilter] = useState<number>(12); // 12, 24, or 60
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [isMeasureModalOpen, setIsMeasureModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [predictions, setPredictions] = useState<PredictionResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('sikecil-children', JSON.stringify(children));
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  useEffect(() => {
    localStorage.setItem('sikecil-measurements', JSON.stringify(measurements));
  }, [measurements]);

  // Derived state
  const currentChild = children.find(c => c.id === selectedChildId) || children[0] || null;

  const currentMeasurements = currentChild
    ? measurements.filter(m => m.childId === currentChild.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  const latestMeasurement = currentMeasurements.length > 0
    ? currentMeasurements[currentMeasurements.length - 1]
    : null;

  // Calculate stats for current child
  const stuntingAnalysis = currentChild && latestMeasurement
    ? getStuntingStatus(latestMeasurement.height, latestMeasurement.ageMonths, currentChild.gender)
    : null;

  const weightAnalysis = currentChild && latestMeasurement
    ? getWeightStatus(latestMeasurement.weight, latestMeasurement.ageMonths, currentChild.gender)
    : null;

  const headAnalysis = currentChild && latestMeasurement && latestMeasurement.headCircumference
    ? getHeadCircumferenceStatus(latestMeasurement.headCircumference, latestMeasurement.ageMonths, currentChild.gender)
    : null;

  // Manage child saving
  const handleSaveChild = (childData: Omit<Child, 'id'> & { id?: string }) => {
    if (childData.id) {
      // Edit
      setChildren(prev => prev.map(c => c.id === childData.id ? { ...c, ...childData } as Child : c));
      triggerStatus('Profil anak berhasil diubah', 'success');
    } else {
      // Create new
      const newChild: Child = {
        ...childData,
        id: `child-${Date.now()}`
      };
      setChildren(prev => [...prev, newChild]);
      setSelectedChildId(newChild.id);
      triggerStatus('Profil anak berhasil ditambahkan', 'success');
    }
  };

  // Manage measurement saving
  const handleSaveMeasurement = (measureData: Omit<Measurement, 'id' | 'ageMonths'> & { id?: string }) => {
    if (!currentChild) return;

    // Calculate age months at measurement date
    const ageDetails = calculateAge(currentChild.birthDate, measureData.date);
    const ageMonths = ageDetails.totalMonthsFloat;

    if (measureData.id) {
      // Edit existing
      setMeasurements(prev => prev.map(m => m.id === measureData.id ? { ...m, ...measureData, ageMonths } as Measurement : m));
      triggerStatus('Catatan pertumbuhan berhasil diperbarui', 'success');
    } else {
      // Create new
      const newMeasure: Measurement = {
        ...measureData,
        id: `m-${Date.now()}`,
        ageMonths
      };
      setMeasurements(prev => [...prev, newMeasure]);
      triggerStatus('Catatan pertumbuhan baru berhasil ditambahkan', 'success');
    }
  };

  // Manage deletion
  const handleDeleteChild = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus profil anak ini beserta semua catatan pertumbuhannya?')) {
      setChildren(prev => prev.filter(c => c.id !== id));
      setMeasurements(prev => prev.filter(m => m.childId !== id));
      if (selectedChildId === id) {
        setSelectedChildId('');
      }
      triggerStatus('Profil anak berhasil dihapus', 'success');
    }
  };

  const handleDeleteMeasurement = (id: string) => {
    if (window.confirm('Hapus catatan pertumbuhan ini?')) {
      setMeasurements(prev => prev.filter(m => m.id !== id));
      triggerStatus('Catatan pertumbuhan dihapus', 'success');
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
      const history = currentMeasurements.map(m => ({
        age: Math.round(m.ageMonths),
        height: m.height
      }));

      const payload = {
        sex: currentChild.gender === 'Laki-laki' ? 'L' : 'P',
        history,
        horizon: 6
      };

      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi API');
      }

      const data = await response.json();
      setPredictions(data);
      triggerStatus('Prediksi berhasil dimuat', 'success');
      setActiveChartTab('height'); // Switch to height tab to view
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
            {/* User Profile Badge */}
            <div className="hidden sm:flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-sky-100 border-2 border-white flex items-center justify-center font-extrabold text-sky-700 text-xs">
                {currentChild ? currentChild.name.charAt(0).toUpperCase() : 'R'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-700">rayhanzz772@gmail.com</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Ibu Terhubung</span>
              </div>
            </div>

            {/* Backup Action Buttons */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                onClick={handleExportData}
                title="Ekspor Cadangan"
                className="p-2 text-slate-500 hover:text-sky-600 hover:bg-white rounded-lg transition-all"
              >
                <FileDown className="w-4 h-4" />
              </button>

              <label
                title="Impor Cadangan"
                className="p-2 text-slate-500 hover:text-sky-600 hover:bg-white rounded-lg transition-all cursor-pointer block animate-pulse-slow"
              >
                <FileUp className="w-4 h-4" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 flex-1 flex flex-col gap-6 w-full">

        {/* PWA Install Promotion Banner */}
        <PWAInstallPrompt />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

          {/* Left / Center Column: Charts and Records (Takes 2/3 space on desktop) */}
          <div className="md:col-span-2 space-y-6 flex flex-col">

            {/* Profile Switcher Section */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
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
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Metrik Terakhir</h3>
              <div className="grid grid-cols-3 gap-3">
                {/* Card Height */}
                <div
                  onClick={() => setActiveChartTab('height')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-center relative ${activeChartTab === 'height'
                    ? 'bg-sky-50/80 border-sky-200 ring-2 ring-sky-500/10'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Ruler className={`w-4 h-4 ${activeChartTab === 'height' ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Tinggi</span>
                    <span className="text-sm font-extrabold text-slate-800 block leading-tight">
                      {latestMeasurement ? `${latestMeasurement.height} cm` : '--'}
                    </span>
                  </div>
                </div>

                {/* Card Weight */}
                <div
                  onClick={() => setActiveChartTab('weight')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-center relative ${activeChartTab === 'weight'
                    ? 'bg-sky-50/80 border-sky-200 ring-2 ring-sky-500/10'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Scale className={`w-4 h-4 ${activeChartTab === 'weight' ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Berat</span>
                    <span className="text-sm font-extrabold text-slate-800 block leading-tight">
                      {latestMeasurement ? `${latestMeasurement.weight} kg` : '--'}
                    </span>
                  </div>
                </div>

                {/* Card Head */}
                <div
                  onClick={() => setActiveChartTab('head')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-center relative ${activeChartTab === 'head'
                    ? 'bg-sky-50/80 border-sky-200 ring-2 ring-sky-500/10'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Heart className={`w-4 h-4 ${activeChartTab === 'head' ? 'text-pink-600' : 'text-slate-400'}`} />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">L. Kepala</span>
                    <span className="text-sm font-extrabold text-slate-800 block leading-tight">
                      {latestMeasurement?.headCircumference ? `${latestMeasurement.headCircumference} cm` : '--'}
                    </span>
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
                        <TrendingUp className="w-5 h-5 text-sky-600" />
                        Grafik Standar WHO
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Memantau tumbuh kembang anak secara mandiri</p>
                    </div>

                    {/* Select range dropdown */}
                    <div className="flex gap-2">
                      <select
                        value={maxMonthsFilter}
                        onChange={(e) => setMaxMonthsFilter(Number(e.target.value))}
                        className="bg-slate-50 border border-slate-200 text-[11px] font-extrabold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer uppercase tracking-wider"
                      >
                        <option value={12}>0 - 12 Bulan</option>
                        <option value={24}>0 - 24 Bulan</option>
                        <option value={60}>0 - 60 Bulan</option>
                      </select>
                    </div>
                  </div>

                  {/* Tab Selector: Height vs Weight vs Head Circumference */}
                  <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl">
                    <button
                      onClick={() => setActiveChartTab('height')}
                      className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${activeChartTab === 'height'
                        ? 'bg-white text-sky-700 shadow-sm border-b border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      Tinggi
                    </button>
                    <button
                      onClick={() => setActiveChartTab('weight')}
                      className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${activeChartTab === 'weight'
                        ? 'bg-white text-sky-700 shadow-sm border-b border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      Berat
                    </button>
                    <button
                      onClick={() => setActiveChartTab('head')}
                      className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${activeChartTab === 'head'
                        ? 'bg-white text-sky-700 shadow-sm border-b border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      L. Kepala
                    </button>
                  </div>

                  {/* The Actual Graph Component */}
                  <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                    <GrowthChart
                      gender={currentChild.gender}
                      measurements={currentMeasurements}
                      maxMonths={maxMonthsFilter}
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
                </div>

                {/* Historical Entries Logs */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-800 flex items-center gap-1.5 font-display text-base">
                      <History className="w-5 h-5 text-sky-600" />
                      Riwayat
                    </h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      Total: {currentMeasurements.length} Entri
                    </span>
                  </div>

                  {currentMeasurements.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">Belum ada riwayat tercatat untuk profil ini.</p>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {currentMeasurements.slice().reverse().map(m => {
                        const hStat = getStuntingStatus(m.height, m.ageMonths, currentChild.gender);
                        const wStat = getWeightStatus(m.weight, m.ageMonths, currentChild.gender);

                        return (
                          <div key={m.id} className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between gap-3 transition-all text-xs group">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-850 text-sm">
                                  {new Date(m.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                <span className="text-[10px] text-sky-700 font-bold bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                                  {m.ageMonths === 0 ? 'Lahir' : `${m.ageMonths.toFixed(1)} bln`}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-slate-600 font-semibold">
                                <span className="flex items-center gap-1">Tinggi: <strong className="text-slate-800">{m.height} cm</strong> ({hStat.status})</span>
                                <span className="flex items-center gap-1">Berat: <strong className="text-slate-800">{m.weight} kg</strong> ({wStat.status})</span>
                                {m.headCircumference && <span className="flex items-center gap-1">L. Kepala: <strong className="text-slate-800">{m.headCircumference} cm</strong></span>}
                              </div>

                              {m.notes && (
                                <p className="text-[10px] text-slate-500 italic bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 leading-relaxed mt-1">
                                  Catatan: {m.notes}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-1">
                              <button
                                onClick={() => {
                                  setEditingMeasurement(m);
                                  setIsMeasureModalOpen(true);
                                }}
                                className="p-2 text-slate-300 hover:text-sky-600 rounded-xl hover:bg-white transition-colors"
                                title="Edit Catatan"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMeasurement(m.id)}
                                className="p-2 text-slate-300 hover:text-red-500 rounded-xl hover:bg-white transition-colors"
                                title="Hapus Catatan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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

                {/* AI Prediction Card */}
                {activeChartTab === 'height' && currentChild && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-800 flex items-center gap-1.5 font-display text-sm">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        Prediksi AI Tinggi Badan
                      </h3>
                    </div>

                    <div className="p-3.5 bg-purple-50/50 rounded-xl space-y-3 border border-purple-100">
                      <p className="text-xs text-slate-600">
                        Prediksi tinggi badan anak 6 bulan ke depan menggunakan model Machine Learning berdasarkan riwayat pertumbuhannya.
                      </p>

                      <button
                        onClick={handlePredictHeight}
                        disabled={isPredicting}
                        className={`w-full py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
                          isPredicting ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
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
                        <div className="pt-3 border-t border-purple-200/60 space-y-2 mt-2 text-xs">
                          <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-purple-100">
                            <span className="text-slate-500 font-semibold">Model AI</span>
                            <span className="font-bold text-purple-700">{predictions.selected_model}</span>
                          </div>
                          <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-purple-100">
                            <span className="text-slate-500 font-semibold">Error (MAE)</span>
                            <span className="font-bold text-slate-700">{predictions.metrics[predictions.selected_model]?.mae.toFixed(3)} cm</span>
                          </div>
                        </div>
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
      </main>

      {/* Floating Call to Action button at the absolute bottom center */}
      {currentChild && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-20 flex justify-center pointer-events-none">
          <button
            onClick={() => {
              setEditingMeasurement(null);
              setIsMeasureModalOpen(true);
            }}
            className="w-full max-w-md px-6 py-4 bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-sky-600/30 cursor-pointer pointer-events-auto"
          >
            <Plus className="w-5 h-5" />
            Catat Data Pertumbuhan Baru
          </button>
        </div>
      )}

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
    </div>
  );
}
