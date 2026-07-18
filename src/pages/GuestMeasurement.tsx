import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Baby,
  Ruler,
  Scale,
  Activity,
  ArrowLeft,
  Trash2,
  Plus,
  Info,
  Calendar
} from 'lucide-react';
import { Gender, Measurement } from '../types';
import {
  calculateAge,
  getStuntingStatus,
  getWeightStatus,
  getHeadCircumferenceStatus
} from '../utils/whoStandards';
import GrowthChart from '../components/GrowthChart';

export const GuestMeasurement: React.FC = () => {
  const navigate = useNavigate();

  // Core State
  const [childProfile, setChildProfile] = useState<{
    name: string;
    gender: Gender;
    birthDate: string;
  } | null>(null);

  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  // UI State
  const [activeChartTab, setActiveChartTab] = useState<'height' | 'weight' | 'head'>('height');
  const [timeRange, setTimeRange] = useState<string>('0-24m');
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(true);
  
  // Temporary Form States
  const [profileForm, setProfileForm] = useState({
    name: '',
    gender: 'L' as Gender,
    birthDate: ''
  });

  const [measureForm, setMeasureForm] = useState({
    date: new Date().toISOString().split('T')[0],
    height: '',
    weight: '',
    headCircumference: '',
    notes: ''
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.birthDate) return;
    setChildProfile({ ...profileForm });
    setIsProfileFormOpen(false);
  };

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childProfile) return;

    const age = calculateAge(childProfile.birthDate, measureForm.date);
    
    // Recalculate z-scores manually so we can save them in the measurement object
    const hStatus = getStuntingStatus(Number(measureForm.height), age.totalMonthsFloat, childProfile.gender);
    const wStatus = getWeightStatus(Number(measureForm.weight), age.totalMonthsFloat, childProfile.gender);
    const hcStatus = measureForm.headCircumference 
      ? getHeadCircumferenceStatus(Number(measureForm.headCircumference), age.totalMonthsFloat, childProfile.gender) 
      : null;

    const newMeasurement: Measurement = {
      id: `guest-m-${Date.now()}`,
      childId: 'guest-child',
      date: measureForm.date,
      ageMonths: age.totalMonthsFloat,
      height: Number(measureForm.height),
      weight: Number(measureForm.weight),
      headCircumference: measureForm.headCircumference ? Number(measureForm.headCircumference) : undefined,
      notes: measureForm.notes,
      haz: hStatus.zScore,
      waz: wStatus.zScore,
      hcaz: hcStatus?.zScore,
      status_haz: hStatus.status,
      status_waz: wStatus.status,
      status_hcaz: hcStatus?.status
    };

    setMeasurements(prev => [...prev, newMeasurement].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setMeasureForm(prev => ({
      ...prev,
      height: '',
      weight: '',
      headCircumference: '',
      notes: ''
    }));
  };

  const handleDeleteMeasurement = (id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;

  const isGirl = childProfile?.gender === 'Perempuan' || childProfile?.gender === 'P';
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
  };

  const stuntingAnalysis = childProfile && latestMeasurement
    ? getStuntingStatus(latestMeasurement.height, latestMeasurement.ageMonths, childProfile.gender, latestMeasurement.haz, latestMeasurement.status_haz)
    : null;

  const weightAnalysis = childProfile && latestMeasurement
    ? getWeightStatus(latestMeasurement.weight, latestMeasurement.ageMonths, childProfile.gender, latestMeasurement.waz, latestMeasurement.status_waz)
    : null;

  const headAnalysis = childProfile && latestMeasurement && latestMeasurement.headCircumference !== undefined
    ? getHeadCircumferenceStatus(latestMeasurement.headCircumference, latestMeasurement.ageMonths, childProfile.gender, latestMeasurement.hcaz, latestMeasurement.status_hcaz)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-20">
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-600 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Pengukuran Guest
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Coba Tanpa Akun</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 flex-1 flex flex-col gap-6 w-full">
        
        {/* Info Banner */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex gap-3 shadow-sm items-start">
          <Info className="text-sky-600 shrink-0 mt-0.5" size={18} />
          <div className="text-sm text-sky-800">
            <p className="font-bold">Mode Guest (Data Tidak Disimpan)</p>
            <p className="mt-1">
              Seluruh data anak dan pengukuran di halaman ini hanya disimpan sementara di perangkat Anda dan akan hilang jika Anda menyegarkan (refresh) halaman. Untuk menyimpan riwayat dan menggunakan prediksi AI, silakan mendaftar via Posyandu.
            </p>
          </div>
        </div>

        {!childProfile || isProfileFormOpen ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 max-w-xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 shadow-sm flex items-center justify-center text-white">
                <Baby size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Profil Anak (Guest)</h2>
                <p className="text-xs text-slate-500">Masukkan profil dasar untuk memulai.</p>
              </div>
            </div>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Panggilan (Opsional)</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="Contoh: Budi"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jenis Kelamin *</label>
                  <select
                    required
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none bg-white"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    value={profileForm.birthDate}
                    onChange={(e) => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                {childProfile && (
                  <button
                    type="button"
                    onClick={() => setIsProfileFormOpen(false)}
                    className="px-4 py-2 text-sm text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  {childProfile ? 'Simpan Profil' : 'Mulai Ukur'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Left/Center Column: Charts & Stats */}
            <div className="md:col-span-2 space-y-6 flex flex-col">
              
              {/* Profile Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${theme.gradient} shadow-sm flex items-center justify-center text-white font-extrabold text-xl`}>
                    {(childProfile.name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 leading-tight">
                      {childProfile.name || 'Anak Guest'}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                      {childProfile.gender === 'P' || childProfile.gender === 'Perempuan' ? 'Perempuan' : 'Laki-laki'} • Lahir: {new Date(childProfile.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileFormOpen(true)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-100 hover:bg-sky-50 transition-colors"
                >
                  Edit Profil
                </button>
              </div>

              {/* Quick Stats Grid */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Metrik Terakhir</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {/* Card Height */}
                  <div
                    onClick={() => setActiveChartTab('height')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-center relative ${
                      activeChartTab === 'height'
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
                        <span className={`mt-2 px-2 py-1 rounded-full text-[10px] font-bold ${stuntingAnalysis.colorClass}`}>
                          {stuntingAnalysis.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Weight */}
                  <div
                    onClick={() => setActiveChartTab('weight')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-center relative ${
                      activeChartTab === 'weight'
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
                        <span className={`mt-2 px-2 py-1 rounded-full text-[10px] font-bold ${weightAnalysis.colorClass}`}>
                          {weightAnalysis.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Head Circ */}
                  <div
                    onClick={() => setActiveChartTab('head')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-center relative ${
                      activeChartTab === 'head'
                        ? `${theme.bgLight80} ${theme.border} ring-2 ${theme.ring10}`
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Activity className={`w-4 h-4 ${activeChartTab === 'head' ? theme.text : 'text-slate-400'}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${activeChartTab === 'head' ? theme.text : 'text-slate-400'}`}>L. Kepala</span>
                      <span className={`text-sm font-extrabold block leading-tight ${activeChartTab === 'head' ? theme.textDark : 'text-slate-800'}`}>
                        {latestMeasurement?.headCircumference ? `${latestMeasurement.headCircumference} cm` : '--'}
                      </span>
                      {headAnalysis && (
                        <span className={`mt-2 px-2 py-1 rounded-full text-[10px] font-bold ${headAnalysis.colorClass}`}>
                          {headAnalysis.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Area */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                      <Activity className="text-sky-500 w-5 h-5" /> Kurva Pertumbuhan
                    </h2>
                  </div>

                  <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg w-fit">
                    {activeChartTab === 'head' ? (
                      <>
                        <button
                          onClick={() => setTimeRange('0-13w')}
                          className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${timeRange === '0-13w' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          13 Mgg
                        </button>
                        <button
                          onClick={() => setTimeRange('0-24m')}
                          className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${timeRange === '0-24m' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          2 Thn
                        </button>
                        <button
                          onClick={() => setTimeRange('0-60m')}
                          className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${timeRange === '0-60m' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          5 Thn
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setTimeRange('0-6m')}
                          className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${timeRange === '0-6m' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          6 Bln
                        </button>
                        <button
                          onClick={() => setTimeRange('0-24m')}
                          className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${timeRange === '0-24m' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          2 Thn
                        </button>
                        <button
                          onClick={() => setTimeRange('24-60m')}
                          className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${timeRange === '24-60m' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          5 Thn
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Tab Selector: Height vs Weight vs Head Circumference */}
                <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl mb-4">
                  <button
                    onClick={() => setActiveChartTab('height')}
                    className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${activeChartTab === 'height'
                      ? `bg-white ${theme.textDark} shadow-sm border-b border-slate-200/50`
                      : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    Tinggi (HAZ)
                  </button>
                  <button
                    onClick={() => setActiveChartTab('weight')}
                    className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${activeChartTab === 'weight'
                      ? `bg-white ${theme.textDark} shadow-sm border-b border-slate-200/50`
                      : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    Berat (WAZ)
                  </button>
                  <button
                    onClick={() => setActiveChartTab('head')}
                    className={`py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${activeChartTab === 'head'
                      ? `bg-white ${theme.textDark} shadow-sm border-b border-slate-200/50`
                      : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    L. Kepala (HCAZ)
                  </button>
                </div>

                <div className="w-full relative min-h-[350px]">
                  <GrowthChart
                    gender={childProfile.gender}
                    measurements={measurements}
                    timeRange={timeRange}
                    chartType={activeChartTab}
                  />
                </div>

                {/* Chart Legend Explanation */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-500 font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100 mt-4">
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

            </div>

            {/* Right Column: Input Form & History */}
            <div className="md:col-span-1 space-y-6">
              
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Plus className="text-sky-500 w-4 h-4" /> Catat Pertumbuhan
                </h3>
                
                <form onSubmit={handleAddMeasurement} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Pengukuran *</label>
                    <input
                      type="date"
                      required
                      value={measureForm.date}
                      onChange={(e) => setMeasureForm({ ...measureForm, date: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tinggi (cm) *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={measureForm.height}
                        onChange={(e) => setMeasureForm({ ...measureForm, height: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        placeholder="Cth: 75"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Berat (kg) *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={measureForm.weight}
                        onChange={(e) => setMeasureForm({ ...measureForm, weight: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        placeholder="Cth: 9.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Lingkar Kepala (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={measureForm.headCircumference}
                      onChange={(e) => setMeasureForm({ ...measureForm, headCircumference: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                      placeholder="Cth: 46 (Opsional)"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md"
                  >
                    Tambah Data
                  </button>
                </form>
              </div>

              {measurements.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Calendar className="text-sky-500 w-4 h-4" /> Riwayat Sementara
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {measurements.slice().reverse().map(m => (
                      <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center group">
                        <div>
                          <p className="text-xs font-bold text-slate-700">{new Date(m.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">TB: {m.height}cm • BB: {m.weight}kg</p>
                        </div>
                        <button
                          onClick={() => handleDeleteMeasurement(m.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-50 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </main>
    </div>
  );
};
