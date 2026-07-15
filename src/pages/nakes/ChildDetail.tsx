import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Activity, X } from 'lucide-react';
import GrowthChart from '../../components/GrowthChart';
import { getStuntingStatus, getWeightStatus } from '../../utils/whoStandards';
import { childService } from '../../services/childService';
import { measurementService } from '../../services/measurementService';

export const ChildDetail: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<any>(null);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'height' | 'weight' | 'head'>('height');

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
          headCircumference: m.head_circumference,
          notes: m.notes
        };
      });
      setMeasurements(formattedMeasurements);
    } catch (error) {
      console.error('Failed to fetch child detail:', error);
      alert('Gagal mengambil data anak.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
    } catch (error) {
      console.error('Failed to create measurement:', error);
      alert('Gagal menyimpan pengukuran.');
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

  const stuntingStatus = latestMeasurement ? getStuntingStatus(latestMeasurement.height, latestMeasurement.ageMonths, child.gender) : null;
  const weightStatus = latestMeasurement ? getWeightStatus(latestMeasurement.weight, latestMeasurement.ageMonths, child.gender) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-extrabold text-slate-800">Detail Anak</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-sm ${child.gender === 'Laki-laki' ? 'bg-sky-500' : 'bg-pink-500'}`}>
              {child.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{child.name}</h2>
              <p className="text-sm font-semibold text-slate-500">{child.gender}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 text-sm">NIK</span>
              <span className="font-bold text-slate-700 font-mono text-sm">{child.nik || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 text-sm">Tanggal Lahir</span>
              <span className="font-bold text-slate-700 text-sm">{new Date(child.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 text-sm">Orang Tua / Wali</span>
              <span className="font-bold text-slate-700 text-sm">{child.parent_name || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 text-sm">Posyandu</span>
              <span className="font-bold text-slate-700 text-sm">{child.posyandu?.name || '-'}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-3 text-sm flex items-center gap-2">
              <Activity size={16} className="text-sky-600" />
              Status Gizi Terakhir
            </h3>
            {latestMeasurement ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Tinggi/Panjang</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                    stuntingStatus?.status === 'Normal' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {stuntingStatus?.status || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Berat Badan</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                    weightStatus?.status === 'Normal' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {weightStatus?.status || 'N/A'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Belum ada data pengukuran.</p>
            )}
          </div>
        </div>

        {/* Chart and Measurements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Grafik Pertumbuhan</h2>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setActiveTab('height')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeTab === 'height' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Tinggi
                </button>
                <button 
                  onClick={() => setActiveTab('weight')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeTab === 'weight' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Berat
                </button>
                <button 
                  onClick={() => setActiveTab('head')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeTab === 'head' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  L. Kepala
                </button>
              </div>
            </div>
            
            <div className="h-80 w-full relative">
              <GrowthChart 
                gender={child.gender}
                measurements={measurements}
                timeRange="0-24m"
                chartType={activeTab}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Riwayat Pengukuran</h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-sky-600 text-white px-3 py-1.5 rounded-xl text-sm font-bold hover:bg-sky-700 flex items-center gap-1"
              >
                <Plus size={16} /> Catat
              </button>
            </div>
            
            <div className="overflow-x-auto">
              {measurements.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Belum ada data pengukuran.</div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-4 font-bold text-slate-600 text-sm">Tanggal</th>
                      <th className="p-4 font-bold text-slate-600 text-sm">Usia (Bulan)</th>
                      <th className="p-4 font-bold text-slate-600 text-sm">TB (cm)</th>
                      <th className="p-4 font-bold text-slate-600 text-sm">BB (kg)</th>
                      <th className="p-4 font-bold text-slate-600 text-sm">LK (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMeasurements.map((m) => (
                      <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-4 text-slate-700 text-sm">
                          {new Date(m.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-4 text-slate-700 text-sm font-bold">{m.ageMonths?.toFixed(1) || '-'}</td>
                        <td className="p-4 text-slate-700 text-sm font-bold text-sky-700">{m.height}</td>
                        <td className="p-4 text-slate-700 text-sm font-bold text-emerald-700">{m.weight}</td>
                        <td className="p-4 text-slate-700 text-sm font-bold text-purple-700">{m.headCircumference || '-'}</td>
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
