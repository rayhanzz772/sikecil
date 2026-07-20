import React, { useState, useEffect } from 'react';
import { Pagination } from '../../components/Pagination';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ArrowRight, UserPlus, Eye, EyeOff, Search, Users, CheckCircle2, AlertCircle, Baby, Pencil, Trash2 } from 'lucide-react';
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
        <div>
          <h1 className="text-lg font-bold text-slate-800">Data Anak</h1>
          <p className="text-sm text-slate-500 mt-0.5">Buat dan kelola data anak di seluruh posyandu</p>
        </div>
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// NAKES ORTU MANAGEMENT â€” Tambah & Lihat Akun Orang Tua
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export const NakesOrtuManagement: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [ortuList, setOrtuList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    nik: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrtuDetail, setSelectedOrtuDetail] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Password strength
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6) return { level: 'weak', label: 'Terlalu pendek', color: 'bg-red-400', width: 'w-1/4' };
    if (pwd.length < 8) return { level: 'fair', label: 'Cukup', color: 'bg-amber-400', width: 'w-2/4' };
    if (/(?=.*[A-Z])(?=.*[0-9])/.test(pwd)) return { level: 'strong', label: 'Kuat', color: 'bg-emerald-500', width: 'w-full' };
    return { level: 'good', label: 'Baik', color: 'bg-sky-400', width: 'w-3/4' };
  };
  const passwordStrength = getPasswordStrength(formData.password);

  const fetchOrtuList = async () => {
    setIsLoading(true);
    try {
      const { userService } = await import('../../services/userService');
      const response = await userService.getAll({ role: 'ORTU', search: search || undefined, page, per_page: perPage });
      setOrtuList(response.data?.rows || response.data || []);
      if (response.metadata) {
        setTotalPages(response.metadata.total_page || 1);
      }
    } catch (error) {
      console.error('Failed to fetch ortu list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrtuList();
  }, [search, page]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nama wajib diisi';
    if (!formData.username.trim()) newErrors.username = 'Username wajib diisi';
    if (formData.username.includes(' ')) newErrors.username = 'Username tidak boleh mengandung spasi';
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Format email tidak valid';
    if (!editingId && !formData.password) newErrors.password = 'Password wajib diisi';
    if (formData.password.length > 0 && formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    if (formData.nik && formData.nik.length !== 16) newErrors.nik = 'NIK harus 16 digit angka';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({ name: '', username: '', email: '', password: '', nik: '', phone: '', address: '' });
    setErrors({});
    setShowPassword(false);
    setEditingId(null);
  };

  const openDetailModal = async (id: string) => {
    try {
      const { userService } = await import('../../services/userService');
      const detail = await userService.getOrtuDetail(id);
      setSelectedOrtuDetail(detail.data || detail);
      setIsDetailModalOpen(true);
    } catch (error: any) {
      toast.error('Gagal memuat detail orang tua');
    }
  };

  const handleEdit = (ortu: any) => {
    setEditingId(ortu.id);
    setFormData({
      name: ortu.name,
      username: ortu.username,
      email: ortu.email,
      password: '',
      nik: ortu.nik || '',
      phone: ortu.phone || '',
      address: ortu.address || ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun orang tua "${name}"?`)) return;
    try {
      const { userService } = await import('../../services/userService');
      await userService.deleteOrtu(id);
      toast.success(`Akun orang tua "${name}" berhasil dihapus.`);
      fetchOrtuList();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gagal menghapus akun orang tua.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const { userService } = await import('../../services/userService');
      const payload: any = { ...formData };
      
      if (editingId && !payload.password) {
        delete payload.password; // Don't send empty password when editing
      }

      if (editingId) {
        await userService.updateOrtu(editingId, payload);
        toast.success(`Akun orang tua "${formData.name}" berhasil diupdate.`);
      } else {
        await userService.createOrtu(payload);
        toast.success(`Akun orang tua "${formData.name}" berhasil dibuat.`);
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchOrtuList();
    } catch (error: any) {
      const msg = error?.response?.data?.message || (editingId ? 'Gagal mengupdate akun orang tua.' : 'Gagal membuat akun orang tua.');
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Kelola Akun Orang Tua</h1>
          <p className="text-sm text-slate-500 mt-0.5">Buat dan kelola akun login untuk orang tua anak di posyandu Anda</p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); resetForm(); }}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 flex items-center gap-2 shadow-sm shadow-sky-600/20 transition-all"
        >
          <UserPlus size={15} /> Tambah Akun Ortu
        </button>
      </div>

      {/* Search bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-2">
        <Search size={15} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Cari nama, username, atau email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-slate-400">Memuat data...</p>
          </div>
        ) : ortuList.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Users size={32} className="text-slate-300 mx-auto" />
            <p className="text-sm text-slate-400">Belum ada akun orang tua terdaftar.</p>
            <button
              onClick={() => { setIsModalOpen(true); resetForm(); }}
              className="text-xs font-semibold text-sky-600 hover:underline"
            >
              Buat akun pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 w-10 text-center">No</th>
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Nama</th>
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Username</th>
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Posyandu</th>
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 text-center">Status</th>
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 text-center w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ortuList.map((ortu, index) => (
                  <tr key={ortu.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-3 py-2.5 text-center text-xs text-slate-400">
                      {(page - 1) * perPage + index + 1}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-xs shrink-0">
                          {(ortu.name || ortu.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800">{ortu.name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 font-mono text-xs">@{ortu.username}</td>
                    <td className="px-3 py-2.5 text-slate-500 text-xs">{ortu.email || '-'}</td>
                    <td className="px-3 py-2.5 text-slate-500 text-xs">{ortu.posyandu?.name || '-'}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ortu.status ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        {ortu.status ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openDetailModal(ortu.id)}
                          className="px-2 py-1 text-sky-700 font-medium rounded hover:bg-sky-50 border border-slate-200 text-xs inline-flex items-center gap-1 transition-colors"
                          title="Detail"
                        >
                          <ArrowRight size={11} />
                        </button>
                        <button
                          onClick={() => handleEdit(ortu)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(ortu.id, ortu.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Add Ortu Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                  <UserPlus size={16} className="text-sky-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">{editingId ? 'Edit Akun Orang Tua' : 'Buat Akun Orang Tua'}</h2>
                  <p className="text-[10px] text-slate-400">{editingId ? 'Ubah informasi akun orang tua' : 'Akun akan otomatis terdaftar di posyandu Anda'}</p>
                </div>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-all ${errors.name ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400'}`}
                />
                {errors.name && (
                  <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.name}
                  </p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">@</span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    placeholder="budi_santoso"
                    className={`w-full pl-7 pr-3 py-2.5 border rounded-lg text-sm outline-none transition-all ${errors.username ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400'}`}
                  />
                </div>
                {errors.username && (
                  <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="budi@email.com"
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-all ${errors.email ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400'}`}
                />
                {errors.email && (
                  <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Password {editingId ? '' : <span className="text-red-500">*</span>}
                  <span className="font-normal text-slate-400 ml-1">
                    {editingId ? '(Kosongkan jika tidak ingin diubah)' : '(min. 6 karakter)'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm outline-none transition-all ${errors.password ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Password strength bar */}
                {formData.password.length > 0 && passwordStrength && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`}></div>
                    </div>
                    <p className={`text-[10px] font-semibold ${passwordStrength.level === 'weak' ? 'text-red-500' : passwordStrength.level === 'fair' ? 'text-amber-500' : passwordStrength.level === 'good' ? 'text-sky-500' : 'text-emerald-600'}`}>
                      Kekuatan: {passwordStrength.label}
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.password}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* NIK */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    NIK <span className="font-normal text-slate-400 ml-1">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    placeholder="16 digit NIK"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-all ${errors.nik ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400'}`}
                  />
                  {errors.nik && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.nik}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    No. HP <span className="font-normal text-slate-400 ml-1">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Contoh: 08123456789"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Alamat Lengkap <span className="font-normal text-slate-400 ml-1">(Opsional)</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Contoh: Jl. Merdeka No. 10, Bandung"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                ></textarea>
              </div>

              {/* Info box (Only for Create) */}
              {!editingId && (
                <div className="flex items-start gap-2.5 bg-sky-50 border border-sky-100 rounded-xl p-3">
                  <CheckCircle2 size={14} className="text-sky-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-sky-700 leading-relaxed">
                    Akun orang tua akan otomatis mendapatkan peran <strong>ORTU</strong> dan terdaftar di posyandu Anda. Role dan posyandu tidak perlu diisi manual.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 disabled:bg-sky-300 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      {editingId ? <Pencil size={14} /> : <UserPlus size={14} />} 
                      {editingId ? 'Simpan Perubahan' : 'Buat Akun'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedOrtuDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-base font-bold text-slate-800">Detail Orang Tua</h2>
              <button
                onClick={() => { setIsDetailModalOpen(false); setSelectedOrtuDetail(null); }}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Info Pribadi */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Informasi Akun</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <p className="text-[10px] text-slate-500 mb-0.5">Nama Lengkap</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedOrtuDetail.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 mb-0.5">Username</p>
                    <p className="text-sm font-medium text-slate-800">@{selectedOrtuDetail.username}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 mb-0.5">Email</p>
                    <p className="text-sm font-medium text-slate-800">{selectedOrtuDetail.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 mb-0.5">Posyandu</p>
                    <p className="text-sm font-medium text-slate-800">{selectedOrtuDetail.posyandu?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 mb-0.5">NIK</p>
                    <p className="text-sm font-medium text-slate-800">{selectedOrtuDetail.nik || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 mb-0.5">No. HP</p>
                    <p className="text-sm font-medium text-slate-800">{selectedOrtuDetail.phone || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-500 mb-0.5">Alamat</p>
                    <p className="text-sm font-medium text-slate-800">{selectedOrtuDetail.address || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100"></div>

              {/* Daftar Anak */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Baby size={14} /> Daftar Anak ({selectedOrtuDetail.children?.length || 0})
                </h3>
                
                {selectedOrtuDetail.children && selectedOrtuDetail.children.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrtuDetail.children.map((child: any) => (
                      <div key={child.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{child.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              {child.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{child.birth_date ? new Date(child.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/nakes/children/${child.id}`)}
                          className="px-2 py-1 text-[10px] font-bold text-sky-600 bg-sky-100 hover:bg-sky-200 rounded transition-colors"
                        >
                          Lihat
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 border-dashed text-center">
                    <p className="text-xs text-slate-500">Belum ada data anak yang didaftarkan</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => { setIsDetailModalOpen(false); setSelectedOrtuDetail(null); }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
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

