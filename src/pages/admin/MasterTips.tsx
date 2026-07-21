import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Pagination } from '../../components/Pagination';
import { tipsService } from '../../services/tipsService';
import { posyanduService, Posyandu } from '../../services/posyanduService';
import { Edit2, Trash2, Plus, X, Search, Filter } from 'lucide-react';
import { useToast } from '../../components/Toast';

export const MasterTips: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const toast = useToast();

  const [tips, setTips] = useState<any[]>([]);
  const [posyandus, setPosyandus] = useState<Posyandu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    posyandu_id: '',
    month: '',
    year: ''
  });

  const [filter, setFilter] = useState({
    month: '',
    year: '',
    posyandu_id: ''
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
    { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
  ];

  const fetchTips = async () => {
    setIsLoading(true);
    try {
      const response = await tipsService.getTips({
        page,
        per_page: perPage,
        month: filter.month ? parseInt(filter.month) : undefined,
        year: filter.year ? parseInt(filter.year) : undefined,
        posyandu_id: filter.posyandu_id || undefined,
      });
      setTips(response.data || []);
      if (response.metadata) {
        setTotalPages(response.metadata.total_page || 1);
      }
    } catch (error) {
      console.error('Failed to fetch tips:', error);
      toast.error('Gagal mengambil data tips.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPosyandus = async () => {
    if (!isAdmin) return;
    try {
      // Assuming per_page: 100 is enough to get all for the dropdown, 
      // or the endpoint supports getting all if not paginated.
      const res = await posyanduService.getAll({ per_page: 100 });
      setPosyandus(res.data || []);
    } catch (error) {
      console.error('Failed to fetch posyandu:', error);
    }
  };

  useEffect(() => {
    fetchPosyandus();
  }, [isAdmin]);

  useEffect(() => {
    fetchTips();
  }, [page, filter.month, filter.year, filter.posyandu_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
      };

      if (formData.image) payload.image = formData.image;
      if (formData.month) payload.month = parseInt(formData.month);
      if (formData.year) payload.year = parseInt(formData.year);
      if (isAdmin && formData.posyandu_id) payload.posyandu_id = formData.posyandu_id;

      if (editingTip) {
        await tipsService.updateTip(editingTip.id, payload);
        toast.success('Tips berhasil diperbarui.');
      } else {
        await tipsService.createTip(payload);
        toast.success('Tips berhasil ditambahkan.');
      }
      setIsModalOpen(false);
      setEditingTip(null);
      resetForm();
      fetchTips();
    } catch (error: any) {
      console.error('Failed to save tips:', error);
      toast.error(error?.response?.data?.message || 'Gagal menyimpan data tips.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tips ini?')) {
      try {
        await tipsService.deleteTip(id);
        fetchTips();
        toast.success('Tips berhasil dihapus.');
      } catch (error) {
        console.error('Failed to delete tips:', error);
        toast.error('Gagal menghapus tips.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      posyandu_id: '',
      month: '',
      year: ''
    });
  };

  const openModal = (tip?: any) => {
    if (tip) {
      setEditingTip(tip);
      setFormData({
        title: tip.title,
        description: tip.description,
        image: tip.image || '',
        posyandu_id: tip.posyandu_id || '',
        month: tip.month ? tip.month.toString() : '',
        year: tip.year ? tip.year.toString() : ''
      });
    } else {
      setEditingTip(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Master Tips Bulanan</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola konten edukasi dan tips untuk orang tua</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filters */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <Filter size={16} className="text-slate-400 ml-1" />
            
            {isAdmin && (
              <select
                name="posyandu_id"
                value={filter.posyandu_id}
                onChange={handleFilterChange}
                className="text-sm border-slate-200 rounded-lg focus:ring-sky-500 focus:border-sky-500 outline-none p-1.5 bg-slate-50 text-slate-700"
              >
                <option value="">Semua Posyandu</option>
                {posyandus.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}

            <select
              name="month"
              value={filter.month}
              onChange={handleFilterChange}
              className="text-sm border-slate-200 rounded-lg focus:ring-sky-500 focus:border-sky-500 outline-none p-1.5 bg-slate-50 text-slate-700"
            >
              <option value="">Semua Bulan</option>
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            
            <select
              name="year"
              value={filter.year}
              onChange={handleFilterChange}
              className="text-sm border-slate-200 rounded-lg focus:ring-sky-500 focus:border-sky-500 outline-none p-1.5 bg-slate-50 text-slate-700"
            >
              <option value="">Semua Tahun</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => openModal()}
            className="bg-sky-600 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-sky-700 flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={16} /> Tambah Tips
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600 w-12 text-center">No</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Bulan / Tahun</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Judul Tips</th>
                  {isAdmin && <th className="px-4 py-3 font-semibold text-slate-600">Posyandu</th>}
                  <th className="px-4 py-3 font-semibold text-slate-600 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tips.length > 0 ? (
                  tips.map((tip, index) => (
                    <tr key={tip.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-center text-slate-500">
                        {(page - 1) * perPage + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 font-medium text-xs">
                          {tip.month ? months.find(m => m.value === tip.month)?.label : 'Semua'} {tip.year || ''}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{tip.title}</div>
                        <div className="text-xs text-slate-500 truncate max-w-xs" title={tip.description}>
                          {tip.description}
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-slate-600 text-sm">
                          {tip.Posyandu?.name || <span className="text-slate-400 italic">Umum (Semua)</span>}
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openModal(tip)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(tip.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-4 py-8 text-center text-slate-500">
                      Belum ada data tips.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isLoading && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {editingTip ? 'Edit Tips' : 'Tambah Tips Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Judul Tips *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                  placeholder="Contoh: Cegah Stunting dengan Gizi Seimbang"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Deskripsi *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm resize-none"
                  placeholder="Tuliskan detail tips di sini..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  URL Gambar (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                  placeholder="Contoh: https://example.com/image.jpg"
                />
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Posyandu Spesifik (Opsional)
                  </label>
                  <select
                    value={formData.posyandu_id}
                    onChange={(e) => setFormData({ ...formData, posyandu_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                  >
                    <option value="">Berlaku untuk Semua Posyandu (Umum)</option>
                    {posyandus.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Bulan (Opsional)
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                  >
                    <option value="">Pilih Bulan</option>
                    {months.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Tahun (Opsional)
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                  >
                    <option value="">Pilih Tahun</option>
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-colors"
                >
                  Simpan Tips
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
