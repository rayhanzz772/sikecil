import React, { useState, useEffect } from 'react';
import { Pagination } from '../../components/Pagination';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ArrowRight } from 'lucide-react';
import { useNakes } from '../../context/NakesContext';
import { DashboardOverview } from './DashboardOverview';
import { ReportsOverview } from '../../components/ReportsOverview';
import { useToast } from '../../components/Toast';

export * from './ChildDetail';

export const NakesDashboard: React.FC = () => {
  return <DashboardOverview />;
};

export const NakesChildrenData: React.FC = () => {
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

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
      toast.success('Data anak berhasil ditambahkan.');
    } catch (error) {
      console.error('Failed to create child:', error);
      toast.error('Gagal menambahkan data anak.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold text-slate-800">Data Anak</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-sky-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-sky-700 flex items-center gap-1.5"
        >
          <Plus size={15} /> Tambah Anak
        </button>
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200">
        <label className="block text-xs font-medium text-slate-500 mb-1">Pencarian</label>
        <input
          type="text"
          placeholder="Cari nama atau NIK anak..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-slate-400">Memuat data...</div>
        ) : childrenData.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">Tidak ada data anak ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 w-10 text-center">No</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">NIK</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Nama Anak</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">JK</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Tgl Lahir</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Orang Tua</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 w-20 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {childrenData.map((child, index) => (
                  <tr key={child.id} className="hover:bg-slate-50/60">
                    <td className="px-3 py-1.5 text-center text-xs text-slate-500">
                      {(page - 1) * perPage + index + 1}
                    </td>
                    <td className="px-3 py-1.5 text-slate-600 font-mono text-xs">{child.nik || '-'}</td>
                    <td className="px-3 py-1.5 text-slate-800 font-medium">{child.name}</td>
                    <td className="px-3 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${child.gender === 'L' || child.gender === 'Laki-laki' ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'}`}>
                        {child.gender === 'L' || child.gender === 'Laki-laki' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-slate-600 text-xs">
                      {child.birth_date ? new Date(child.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-3 py-1.5 text-slate-600 text-xs">{child.user?.name || child.parent_name || '-'}</td>
                    <td className="px-3 py-1.5 text-center">
                      <button
                        onClick={() => navigate(`/nakes/children/${child.id}`)}
                        className="px-2 py-1 text-sky-700 font-medium rounded hover:bg-sky-50 border border-slate-200 text-xs inline-flex items-center gap-1"
                      >
                        Detail
                        <ArrowRight size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-base font-bold text-slate-800">Tambah Data Anak</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap Anak</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">NIK Anak</label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    required
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Kelamin</label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Orang Tua / Wali</label>
                <select
                  required
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none bg-white"
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">Alamat Lengkap</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  rows={2}
                  placeholder="Contoh: Jl. Merdeka No. 10, Bandung"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700"
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
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-slate-800">Input Pengukuran</h1>
      <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
        <p className="text-sm text-slate-600">Form untuk memasukkan data berat badan, tinggi badan, dan lingkar kepala anak.</p>
      </div>
    </div>
  );
};

export const HistoryChart: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-slate-800">Riwayat & Grafik Pertumbuhan</h1>
      <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
        <p className="text-sm text-slate-600">Grafik standar WHO (Z-Score) akan ditampilkan di sini.</p>
      </div>
    </div>
  );
};

export const Prediction: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-slate-800">Prediksi AI</h1>
      <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
        <p className="text-sm text-slate-600">Halaman untuk memprediksi potensi stunting menggunakan model GPR.</p>
      </div>
    </div>
  );
};

export const NakesReports: React.FC = () => {
  return <ReportsOverview />;
};

