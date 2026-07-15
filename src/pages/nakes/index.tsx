import React, { useState, useEffect } from 'react';
import { Pagination } from '../../components/Pagination';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ArrowRight } from 'lucide-react';
import { useNakes } from '../../context/NakesContext';

export * from './ChildDetail';

export const NakesDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-800">Dashboard Posyandu</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <p className="text-slate-600">Statistik dan ringkasan data posyandu Anda.</p>
      </div>
    </div>
  );
};

export const NakesChildrenData: React.FC = () => {
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10; // Testing pagination

  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    birth_date: '',
    gender: 'L',
    user_id: '',
    address: ''
  });

  const [parents, setParents] = useState<any[]>([]);

  useEffect(() => {
    if (isModalOpen) {
      fetchParents('');
    }
  }, [isModalOpen]);

  const fetchParents = async (searchQuery: string) => {
    try {
      const { childService } = await import('../../services/childService');
      const response = await childService.getParents(searchQuery);
      setParents(response.data || []);
    } catch (error) {
      console.error('Failed to fetch parents:', error);
    }
  };

  const fetchChildren = async () => {
    setIsLoading(true);
    try {
      const { childService } = await import('../../services/childService');
      const response = await childService.getAll({
        search: search || undefined,
        page,
        per_page: perPage
      });
      setChildrenData(response.data || []);
      if (response.metadata) {
        setTotalPages(response.metadata.total_page || 1);
      }
    } catch (error) {
      console.error('Failed to fetch children:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [search, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { childService } = await import('../../services/childService');
      await childService.create(formData as any);
      setIsModalOpen(false);
      setFormData({
        name: '',
        nik: '',
        birth_date: '',
        gender: 'L',
        user_id: '',
        address: ''
      });
      fetchChildren();
    } catch (error) {
      console.error('Failed to create child:', error);
      alert('Gagal menambahkan data anak.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-slate-800">Data Anak</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-sky-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-sky-700 flex items-center gap-2"
        >
          <Plus size={18} /> Tambah Anak
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <label className="block text-xs font-bold text-slate-500 mb-1">Pencarian</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Cari nama atau NIK anak..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-1/2 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Memuat data...</div>
        ) : childrenData.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Tidak ada data anak ditemukan.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600 text-sm">NIK</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Nama Anak</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Jenis Kelamin</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Tanggal Lahir</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Orang Tua</th>
                <th className="p-4 font-bold text-slate-600 text-sm w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {childrenData.map((child) => (
                <tr key={child.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-slate-700 font-mono text-sm">{child.nik || '-'}</td>
                  <td className="p-4 text-slate-800 font-bold">{child.name}</td>
                  <td className="p-4 text-slate-600">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${child.gender === 'L' || child.gender === 'Laki-laki' ? 'bg-sky-100 text-sky-700' : 'bg-pink-100 text-pink-700'}`}>
                      {child.gender === 'L' || child.gender === 'Laki-laki' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">
                    {child.birth_date ? new Date(child.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </td>
                  <td className="p-4 text-slate-600 text-sm">{child.user?.name || child.parent_name || '-'}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => navigate(`/nakes/children/${child.id}`)}
                      className="px-3 py-1.5 bg-slate-100 text-sky-700 font-bold rounded-lg hover:bg-sky-50 border border-slate-200 transition-colors text-sm flex items-center gap-1 mx-auto"
                    >
                      Detail
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">Tambah Data Anak</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap Anak</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">NIK Anak</label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    required
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Orang Tua / Wali</label>
                  <select
                    required
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white"
                  >
                    <option value="" disabled>Pilih Orang Tua...</option>
                    {parents.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name} {parent.nik ? `(${parent.nik})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    rows={2}
                    placeholder="Contoh: Jl. Merdeka No. 10, Bandung"
                  ></textarea>
                </div>
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

export const MeasurementInput: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-800">Input Pengukuran</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <p className="text-slate-600">Form untuk memasukkan data berat badan, tinggi badan, dan lingkar kepala anak.</p>
      </div>
    </div>
  );
};

export const HistoryChart: React.FC = () => {
  // Nanti akan memuat komponen GrowthChart.tsx
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-800">Riwayat & Grafik Pertumbuhan</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <p className="text-slate-600">Grafik standar WHO (Z-Score) akan ditampilkan di sini.</p>
      </div>
    </div>
  );
};

export const Prediction: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-800">Prediksi AI</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <p className="text-slate-600">Halaman untuk memprediksi potensi stunting menggunakan model GPR.</p>
      </div>
    </div>
  );
};
