import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Activity, X, Sparkles, RefreshCw } from 'lucide-react';
import GrowthChart from '../../components/GrowthChart';
import { getHeadCircumferenceStatus, getStuntingStatus, getWeightStatus } from '../../utils/whoStandards';
import { childService } from '../../services/childService';
import { measurementService } from '../../services/measurementService';
import { predictionService } from '../../services/predictionService';
import { PredictionResponse } from '../../types';
import { useToast } from '../../components/Toast';

export const ChildDetail: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [child, setChild] = useState<any>(null);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'height' | 'weight' | 'head'>('height');
  const [timeRange, setTimeRange] = useState<'0-13w' | '0-24m' | '0-60m'>('0-24m');

  const [predictions, setPredictions] = useState<PredictionResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionStale, setPredictionStale] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    height: '',
    weight: '',
    headCircumference: '',
    notes: ''
  });

  const fetchData = async () => {
    if (!childId) return;
    setIsLoading(true);
    try {
      const childRes = await childService.getById(childId);
      const childData = childRes.data;
      setChild(childData);
      const measurementsRes = await measurementService.getByChildId(childId);

      const birthDate = new Date(childData.birth_date);

      // Ensure we format it for GrowthChart
      const formattedMeasurements = (measurementsRes.data || []).map((m: any) => {
        const measDate = new Date(m.date);
        const ageDiffMs = measDate.getTime() - birthDate.getTime();
        const calculatedAgeMonths = ageDiffMs / (1000 * 60 * 60 * 24 * 30.44); // approx months

        return {
          id: m.id,
          childId: m.child_id,
          date: m.date,
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
      setMeasurements(formattedMeasurements);
    } catch (error) {
      console.error('Failed to fetch child detail:', error);
      toast.error('Gagal mengambil data anak.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLatestPrediction = async () => {
    if (!childId) return;
    try {
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
        setPredictionStale(data.is_stale || false);
      }
    } catch (error) {
      console.error('Failed to fetch prediction:', error);
    }
  };

  const handleGeneratePrediction = async () => {
    if (!childId) return;
    if (measurements.length < 3) {
      toast.info('Butuh minimal 3 data pengukuran untuk prediksi AI');
      return;
    }
    setIsPredicting(true);
    try {
      const res = await predictionService.generate(childId, 6);
      const predictionData = res.data;
      let record = null;
      if (Array.isArray(predictionData) && predictionData.length > 0) {
        record = predictionData[0];
      } else if (predictionData?.results) {
        record = predictionData;
      }

      if (record && record.results) {
        let results = record.results;
        if (typeof results === 'string') {
          try {
            results = JSON.parse(results);
          } catch (e) {
            console.error('Failed to parse generate results', e);
          }
        }
        setPredictions(results);
        setPredictionStale(false);
      }
    } catch (error: any) {
      console.error('Failed to generate prediction:', error);
      toast.error(error?.response?.data?.message || 'Gagal memproses prediksi AI');
    } finally {
      setIsPredicting(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchLatestPrediction();
  }, [childId]);

  const handleSubmitMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId) return;
    try {
      await measurementService.create(childId, {
        date: formData.date,
        height: Number(formData.height) || 0,
        weight: Number(formData.weight) || 0,
        headCircumference: Number(formData.headCircumference) || 0,
        notes: formData.notes
      });
      setIsModalOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        height: '',
        weight: '',
        headCircumference: '',
        notes: ''
      });
      fetchData(); // Refresh data
      toast.success('Pengukuran berhasil disimpan.');
    } catch (error) {
      console.error('Failed to create measurement:', error);
      toast.error('Gagal menyimpan pengukuran.');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Memuat data...</div>;
  }

  if (!child) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Data anak tidak ditemukan.</p>
        <button onClick={() => navigate('/nakes/dashboard')} className="text-sky-600 mt-4 hover:underline">Kembali ke Dashboard</button>
      </div>
    );
  }

  const sortedMeasurements = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latestMeasurement = sortedMeasurements.length > 0 ? sortedMeasurements[sortedMeasurements.length - 1] : null;

  const stuntingStatus = latestMeasurement ? getStuntingStatus(latestMeasurement.height, latestMeasurement.ageMonths, child.gender, latestMeasurement.haz, latestMeasurement.status_haz) : null;
  const weightStatus = latestMeasurement ? getWeightStatus(latestMeasurement.weight, latestMeasurement.ageMonths, child.gender, latestMeasurement.waz, latestMeasurement.status_waz) : null;
  const headStatus = latestMeasurement ? getHeadCircumferenceStatus(latestMeasurement.headCircumference, latestMeasurement.ageMonths, child.gender, latestMeasurement.hcaz, latestMeasurement.status_hcaz) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 bg-white text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Detail Anak</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-bold ${child.gender === 'L' ? 'bg-sky-500' : 'bg-pink-500'}`}>
              {child.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">{child.name}</h2>
              <p className="text-xs text-slate-500">{child.gender}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 text-xs">NIK</span>
              <span className="font-medium text-slate-700 font-mono text-xs">{child.nik || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 text-xs">Tanggal Lahir</span>
              <span className="font-medium text-slate-700 text-xs">{new Date(child.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 text-xs">Orang Tua / Wali</span>
              <span className="font-medium text-slate-700 text-xs">{child.user.name || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 text-xs">Posyandu</span>
              <span className="font-medium text-slate-700 text-xs">{child.user.posyandu.name || '-'}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-700 mb-2 text-xs flex items-center gap-1.5">
              <Activity size={14} className="text-sky-600" />
              Status Gizi Terakhir
            </h3>
            {latestMeasurement ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Tinggi/Panjang</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${stuntingStatus?.status === 'Normal' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {stuntingStatus?.status || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Berat Badan</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${weightStatus?.status === 'Normal' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {weightStatus?.status || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Lingkar Kepala</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${headStatus?.status === 'Normal' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {headStatus?.status || 'N/A'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Belum ada data pengukuran.</p>
            )}
          </div>
        </div>

        {/* Chart and Measurements */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800">Grafik Pertumbuhan</h2>
                <button
                  onClick={handleGeneratePrediction}
                  disabled={isPredicting || measurements.length < 3}
                  className="px-2.5 py-1 bg-indigo-600 text-white text-[11px] font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Sparkles size={12} />
                  {isPredicting ? 'Memproses...' : 'Prediksi AI'}
                </button>
                {predictionStale && predictions && (
                  <span className="text-[10px] text-amber-600 font-medium">Data baru tersedia</span>
                )}
              </div>
              <div className="flex gap-1.5 items-center">
                {activeTab === 'head' && (
                  <div className="flex bg-slate-100 p-0.5 rounded-lg">
                    <button
                      onClick={() => setTimeRange('0-13w')}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold ${timeRange === '0-13w' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      0-13 Mgg
                    </button>
                    <button
                      onClick={() => setTimeRange('0-24m')}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold ${timeRange === '0-24m' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      0-2 Thn
                    </button>
                    <button
                      onClick={() => setTimeRange('0-60m')}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold ${timeRange === '0-60m' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      0-5 Thn
                    </button>
                  </div>
                )}
                <div className="flex bg-slate-100 p-0.5 rounded-lg">
                  <button
                    onClick={() => setActiveTab('height')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold ${activeTab === 'height' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Tinggi
                  </button>
                  <button
                    onClick={() => setActiveTab('weight')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold ${activeTab === 'weight' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Berat
                  </button>
                  <button
                    onClick={() => setActiveTab('head')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold ${activeTab === 'head' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    L. Kepala
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full relative">
              <GrowthChart
                gender={child.gender}
                measurements={measurements}
                timeRange={activeTab === 'head' ? timeRange : '0-24m'}
                chartType={activeTab}
                predictions={predictions?.prediction}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-800">Riwayat Pengukuran</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-sky-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-sky-700 flex items-center gap-1"
              >
                <Plus size={14} /> Catat
              </button>
            </div>

            <div className="overflow-x-auto">
              {measurements.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">Belum ada data pengukuran.</div>
              ) : (
                <table className="w-full text-left text-sm min-w-[450px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Tanggal</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Usia (Bln)</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">TB (cm)</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">BB (kg)</th>
                      <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">LK (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedMeasurements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-3 py-2 text-slate-600">
                          {new Date(m.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-3 py-2 text-slate-700 font-medium">{m.ageMonths?.toFixed(1) || '-'}</td>
                        <td className="px-3 py-2 text-sky-700 font-medium">{m.height}</td>
                        <td className="px-3 py-2 text-emerald-700 font-medium">{m.weight}</td>
                        <td className="px-3 py-2 text-purple-700 font-medium">{m.headCircumference || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">Catat Pengukuran</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitMeasurement} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tanggal Pengukuran</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tinggi Badan (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    placeholder="Contoh: 65.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Berat Badan (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    placeholder="Contoh: 7.2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Lingkar Kepala (cm) <span className="text-slate-400 font-normal text-xs">(Opsional)</span></label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.headCircumference}
                  onChange={(e) => setFormData({ ...formData, headCircumference: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  placeholder="Contoh: 42.1"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none min-h-[80px]"
                  placeholder="Kondisi anak, imunisasi, dll..."
                />
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-colors shadow-sm shadow-sky-600/20"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
