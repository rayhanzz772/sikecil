export * from './RoleManagement';
import React, { useState, useEffect } from 'react';
import { Pagination } from '../../components/Pagination';
import { desaService, Desa } from '../../services/desaService';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import { DashboardOverview } from '../nakes/DashboardOverview';
import { ReportsOverview } from '../../components/ReportsOverview';

export const MasterDesa: React.FC = () => {
  const [desas, setDesas] = useState<Desa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesa, setEditingDesa] = useState<Desa | null>(null);
  const [formData, setFormData] = useState({ name: '', kecamatan: '', kabupaten: '' });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10; // For testing pagination with a small dataset

  const fetchDesas = async () => {
    setIsLoading(true);
    try {
      const response = await desaService.getAll({ page, per_page: perPage });
      setDesas(response.data || []);
      if (response.metadata) {
        setTotalPages(response.metadata.total_page || 1);
      }
    } catch (error) {
      console.error('Failed to fetch desas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesas();
  }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDesa) {
        await desaService.update(editingDesa.id, formData);
      } else {
        await desaService.create(formData);
      }
      setIsModalOpen(false);
      setEditingDesa(null);
      setFormData({ name: '', kecamatan: '', kabupaten: '' });
      fetchDesas();
    } catch (error) {
      console.error('Failed to save desa:', error);
      alert('Gagal menyimpan data desa.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus desa ini?')) {
      try {
        await desaService.delete(id);
        fetchDesas();
      } catch (error) {
        console.error('Failed to delete desa:', error);
        alert('Gagal menghapus desa.');
      }
    }
  };

  const openModal = (desa?: Desa) => {
    if (desa) {
      setEditingDesa(desa);
      setFormData({ name: desa.name, kecamatan: desa.kecamatan || '', kabupaten: desa.kabupaten || '' });
    } else {
      setEditingDesa(null);
      setFormData({ name: '', kecamatan: '', kabupaten: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-slate-800">Master Data Desa</h1>
        <button
          onClick={() => openModal()}
          className="bg-sky-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-sky-700 flex items-center gap-2"
        >
          <Plus size={18} /> Tambah Desa
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Memuat data...</div>
        ) : desas.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Belum ada data desa.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600 text-sm">No</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Nama Desa</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Kecamatan</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Kabupaten</th>
                <th className="p-4 font-bold text-slate-600 text-sm w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {desas.map((desa, index) => (
                <tr key={desa.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-slate-700">{index + 1}</td>
                  <td className="p-4 text-slate-800 font-medium">{desa.name}</td>
                  <td className="p-4 text-slate-600">{desa.kecamatan || '-'}</td>
                  <td className="p-4 text-slate-600">{desa.kabupaten || '-'}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal(desa)}
                        className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(desa.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingDesa ? 'Edit Desa' : 'Tambah Desa'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nama Desa</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    placeholder="Masukkan nama desa..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Kecamatan</label>
                  <input
                    type="text"
                    required
                    value={formData.kecamatan}
                    onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    placeholder="Masukkan kecamatan..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Kabupaten</label>
                  <input
                    type="text"
                    required
                    value={formData.kabupaten}
                    onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    placeholder="Masukkan kabupaten..."
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
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

export const AdminDashboard: React.FC = () => {
  return <DashboardOverview />;
};

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [posyandus, setPosyandus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role_id: '',
    status: true,
    posyandu_id: ''
  });

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10; // Testing pagination

  const fetchPosyandus = async () => {
    try {
      const { posyanduService } = await import('../../services/posyanduService');
      const response = await posyanduService.getAll();
      setPosyandus(response.data || []);
    } catch (error) {
      console.error('Failed to fetch posyandus:', error);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { userService } = await import('../../services/userService');
      const response = await userService.getAll({
        search: search || undefined,
        role: filterRole || undefined,
        page,
        per_page: perPage
      });
      setUsers(response.data || []);
      if (response.metadata) {
        setTotalPages(response.metadata.total_page || 1);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosyandus();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [search, filterRole, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { userService } = await import('../../services/userService');
      const payload: any = { ...formData };

      // Don't send empty posyandu_id
      if (!payload.posyandu_id) {
        payload.posyandu_id = null;
      }

      // If editing and password is empty, don't send it
      if (editingUser && !payload.password) {
        delete payload.password;
      }

      // We might need to map role if backend expects role ID, but assuming string or object code
      if (editingUser) {
        await userService.update(editingUser.id, payload);
      } else {
        await userService.create(payload);
      }
      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Gagal menyimpan data pengguna.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        const { userService } = await import('../../services/userService');
        await userService.delete(id);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Gagal menghapus pengguna.');
      }
    }
  };

  const openModal = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        username: user.username,
        email: user.email,
        password: '',
        role_id: user.role?.id || user.role_id || '',
        status: user.status !== undefined ? user.status : true,
        posyandu_id: user.posyandu?.id || user.posyandu_id || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        role_id: '',
        status: true,
        posyandu_id: ''
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-slate-800">User Management</h1>
        <button
          onClick={() => openModal()}
          className="bg-sky-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-sky-700 flex items-center gap-2"
        >
          <Plus size={18} /> Tambah Pengguna
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-500 mb-1">Pencarian</label>
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
          />
        </div>
        <div className="w-full sm:w-1/3">
          <label className="block text-xs font-bold text-slate-500 mb-1">Filter Role</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
          >
            <option value="">-- Semua Role --</option>
            <option value="ADMIN">Admin</option>
            <option value="NAKES">Nakes</option>
            <option value="ORTU">Orang Tua</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Memuat data...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Tidak ada data pengguna ditemukan.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600 text-sm w-16 text-center">No</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Nama</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Username/Email</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Role</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Posyandu</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Status</th>
                <th className="p-4 font-bold text-slate-600 text-sm w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-center text-sm text-slate-500 font-medium">
                    {(page - 1) * perPage + index + 1}
                  </td>
                  <td className="p-4 text-slate-800 font-medium">{user.name}</td>
                  <td className="p-4 text-slate-600 text-sm">
                    <div>{user.username}</div>
                    <div className="text-slate-400 text-xs">{user.email}</div>
                  </td>
                  <td className="p-4 text-slate-600">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-bold">
                      {user.role?.name || user.role?.code || user.role || '-'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">{user.posyandu?.name || '-'}</td>
                  <td className="p-4">
                    {user.status ? (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold">Aktif</span>
                    ) : (
                      <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-bold">Nonaktif</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openModal(user)}
                        className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
              <h2 className="text-xl font-bold text-slate-800">
                {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
              </h2>
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
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Password {editingUser && <span className="text-xs font-normal text-slate-400">(Kosongkan jika tidak diubah)</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                  <select
                    required
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value, posyandu_id: '' })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white"
                  >
                    <option value="" disabled>-- Pilih Role --</option>
                    <option value="role_admin_id_001">Admin</option>
                    <option value="role_nakes_id_001">Nakes</option>
                    <option value="role_ortu_id_001">Orang Tua</option>
                  </select>
                </div>

                {/* Posyandu dropdown only for NAKES or ORTU */}
                {(formData.role_id === 'role_nakes_id_001' || formData.role_id === 'role_ortu_id_001') && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Posyandu</label>
                    <select
                      value={formData.posyandu_id}
                      onChange={(e) => setFormData({ ...formData, posyandu_id: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white"
                    >
                      <option value="">-- Tidak ada --</option>
                      {posyandus.map(posyandu => (
                        <option key={posyandu.id} value={posyandu.id}>{posyandu.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <span className="text-sm font-bold text-slate-700">User Aktif</span>
                </label>
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

export const MasterPosyandu: React.FC = () => {
  const [posyandus, setPosyandus] = useState<any[]>([]);
  const [desas, setDesas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosyandu, setEditingPosyandu] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', desa_id: '' });
  const [filterDesaId, setFilterDesaId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10; // Testing pagination

  const fetchDesas = async () => {
    try {
      // Fetch all desas for the dropdown filter
      const response = await desaService.getAll({ per_page: 1000 });
      setDesas(response.data || []);
    } catch (error) {
      console.error('Failed to fetch desas:', error);
    }
  };

  const fetchPosyandus = async () => {
    setIsLoading(true);
    try {
      const { posyanduService } = await import('../../services/posyanduService');
      const response = await posyanduService.getAll({
        desa_id: filterDesaId || undefined,
        page,
        per_page: perPage
      });
      setPosyandus(response.data || []);
      if (response.metadata) {
        setTotalPages(response.metadata.total_page || 1);
      }
    } catch (error) {
      console.error('Failed to fetch posyandus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesas();
  }, []);

  useEffect(() => {
    fetchPosyandus();
  }, [filterDesaId, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { posyanduService } = await import('../../services/posyanduService');
      if (editingPosyandu) {
        await posyanduService.update(editingPosyandu.id, formData);
      } else {
        await posyanduService.create(formData);
      }
      setIsModalOpen(false);
      setEditingPosyandu(null);
      setFormData({ name: '', desa_id: '' });
      fetchPosyandus();
    } catch (error) {
      console.error('Failed to save posyandu:', error);
      alert('Gagal menyimpan data posyandu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus posyandu ini?')) {
      try {
        const { posyanduService } = await import('../../services/posyanduService');
        await posyanduService.delete(id);
        fetchPosyandus();
      } catch (error) {
        console.error('Failed to delete posyandu:', error);
        alert('Gagal menghapus posyandu.');
      }
    }
  };

  const openModal = (posyandu?: any) => {
    if (posyandu) {
      setEditingPosyandu(posyandu);
      setFormData({ name: posyandu.name, desa_id: posyandu.desa_id || posyandu.desa?.id || '' });
    } else {
      setEditingPosyandu(null);
      setFormData({ name: '', desa_id: filterDesaId || '' });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-slate-800">Master Data Posyandu</h1>
        <button
          onClick={() => openModal()}
          className="bg-sky-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-sky-700 flex items-center gap-2"
        >
          <Plus size={18} /> Tambah Posyandu
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <label className="font-bold text-slate-700">Filter Desa:</label>
        <select
          value={filterDesaId}
          onChange={(e) => setFilterDesaId(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none min-w-[200px]"
        >
          <option value="">-- Semua Desa --</option>
          {desas.map(desa => (
            <option key={desa.id} value={desa.id}>{desa.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Memuat data...</div>
        ) : posyandus.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Belum ada data posyandu.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600 text-sm">No</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Nama Posyandu</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Desa</th>
                <th className="p-4 font-bold text-slate-600 text-sm w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {posyandus.map((posyandu, index) => (
                <tr key={posyandu.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-slate-700">{index + 1}</td>
                  <td className="p-4 text-slate-800 font-medium">{posyandu.name}</td>
                  <td className="p-4 text-slate-600">{posyandu.desa?.name || '-'}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal(posyandu)}
                        className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(posyandu.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingPosyandu ? 'Edit Posyandu' : 'Tambah Posyandu'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Posyandu</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  placeholder="Masukkan nama posyandu..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Desa</label>
                <select
                  required
                  value={formData.desa_id}
                  onChange={(e) => setFormData({ ...formData, desa_id: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white"
                >
                  <option value="" disabled>-- Pilih Desa --</option>
                  {desas.map(desa => (
                    <option key={desa.id} value={desa.id}>{desa.name}</option>
                  ))}
                </select>
              </div>
              <div className="mt-8 flex justify-end gap-3">
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

export const AdminChildrenData: React.FC = () => {
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10; // Testing pagination

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
      console.error('Failed to fetch children for admin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [search, page]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-800">Data Anak (Global)</h1>

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
                <th className="p-4 font-bold text-slate-600 text-sm w-16 text-center">No</th>
                <th className="p-4 font-bold text-slate-600 text-sm">NIK</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Nama Anak</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Jenis Kelamin</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Tanggal Lahir</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Posyandu</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Orang Tua</th>
              </tr>
            </thead>
            <tbody>
              {childrenData.map((child, index) => (
                <tr key={child.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-center text-sm text-slate-500 font-medium">
                    {(page - 1) * perPage + index + 1}
                  </td>
                  <td className="p-4 text-slate-700 font-mono text-sm">{child.nik || '-'}</td>
                  <td className="p-4 text-slate-800 font-bold">{child.name}</td>
                  <td className="p-4 text-slate-600">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${child.gender === 'Laki-laki' ? 'bg-sky-100 text-sky-700' : 'bg-pink-100 text-pink-700'}`}>
                      {child.gender}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">
                    {child.birth_date ? new Date(child.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </td>
                  <td className="p-4 text-slate-600 text-sm font-bold text-sky-700">{child.user?.posyandu?.name || '-'}</td>
                  <td className="p-4 text-slate-600 text-sm">{child.user.name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export const AdminReports: React.FC = () => {
  return <ReportsOverview />;
};
