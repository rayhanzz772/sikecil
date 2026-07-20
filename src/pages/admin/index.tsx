export * from './RoleManagement';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/Pagination';
import { desaService, Desa } from '../../services/desaService';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import { DashboardOverview } from '../nakes/DashboardOverview';
import { ReportsOverview } from '../../components/ReportsOverview';
import { useToast } from '../../components/Toast';

export const MasterDesa: React.FC = () => {
  const [desas, setDesas] = useState<Desa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesa, setEditingDesa] = useState<Desa | null>(null);
  const [formData, setFormData] = useState({ name: '', kecamatan: '', kabupaten: '' });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const toast = useToast();

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
      toast.success('Data desa berhasil disimpan.');
    } catch (error) {
      console.error('Failed to save desa:', error);
      toast.error('Gagal menyimpan data desa.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus desa ini?')) {
      try {
        await desaService.delete(id);
        fetchDesas();
        toast.success('Desa berhasil dihapus.');
      } catch (error) {
        console.error('Failed to delete desa:', error);
        toast.error('Gagal menghapus desa.');
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold text-slate-800">Master Data Desa</h1>
        <button
          onClick={() => openModal()}
          className="bg-sky-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-sky-700 flex items-center gap-1.5"
        >
          <Plus size={15} /> Tambah Desa
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-slate-400">Memuat data...</div>
        ) : desas.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">Belum ada data desa.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 w-10">No</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Nama Desa</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Kecamatan</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Kabupaten</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 w-20 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {desas.map((desa, index) => (
                  <tr key={desa.id} className="hover:bg-slate-50/60">
                    <td className="px-3 py-1.5 text-slate-500 text-xs">{(page - 1) * perPage + index + 1}</td>
                    <td className="px-3 py-1.5 text-slate-800 font-medium">{desa.name}</td>
                    <td className="px-3 py-1.5 text-slate-600">{desa.kecamatan || '-'}</td>
                    <td className="px-3 py-1.5 text-slate-600">{desa.kabupaten || '-'}</td>
                    <td className="px-3 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          onClick={() => openModal(desa)}
                          className="p-1 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(desa.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">
                {editingDesa ? 'Edit Desa' : 'Tambah Desa'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Desa</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  placeholder="Masukkan nama desa"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kecamatan</label>
                <input
                  type="text"
                  required
                  value={formData.kecamatan}
                  onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  placeholder="Masukkan kecamatan"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kabupaten</label>
                <input
                  type="text"
                  required
                  value={formData.kabupaten}
                  onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  placeholder="Masukkan kabupaten"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors"
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
  const toast = useToast();

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
      toast.success('Data pengguna berhasil disimpan.');
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error('Gagal menyimpan data pengguna.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        const { userService } = await import('../../services/userService');
        await userService.delete(id);
        fetchUsers();
        toast.success('Pengguna berhasil dihapus.');
      } catch (error) {
        console.error('Failed to delete user:', error);
        toast.error('Gagal menghapus pengguna.');
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold text-slate-800">User Management</h1>
        <button
          onClick={() => openModal()}
          className="bg-sky-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-sky-700 flex items-center gap-1.5"
        >
          <Plus size={15} /> Tambah Pengguna
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-end gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-500 mb-1">Pencarian</label>
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-xs font-medium text-slate-500 mb-1">Filter Role</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
          >
            <option value="">Semua Role</option>
            <option value="ADMIN">Admin</option>
            <option value="NAKES">Nakes</option>
            <option value="ORTU">Orang Tua</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-slate-400">Memuat data...</div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">Tidak ada data pengguna ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 w-10 text-center">No</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Nama</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Username/Email</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Posyandu</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 w-16 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-slate-50/60">
                    <td className="px-3 py-1.5 text-center text-xs text-slate-500">
                      {(page - 1) * perPage + index + 1}
                    </td>
                    <td className="px-3 py-1.5 text-slate-800 font-medium">{user.name}</td>
                    <td className="px-3 py-1.5 text-slate-600">
                      <div>{user.username}</div>
                      <div className="text-slate-400 text-xs">{user.email}</div>
                    </td>
                    <td className="px-3 py-1.5">
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs font-medium">
                        {user.role?.name || user.role?.code || user.role || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-slate-600 text-xs">{user.posyandu?.name || '-'}</td>
                    <td className="px-3 py-2">
                      {user.status ? (
                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-xs font-medium">Aktif</span>
                      ) : (
                        <span className="text-red-700 bg-red-50 px-1.5 py-0.5 rounded text-xs font-medium">Nonaktif</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          onClick={() => openModal(user)}
                          className="p-1 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-base font-bold text-slate-800">
                {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Password {editingUser && <span className="text-xs font-normal text-slate-400">(Kosongkan jika tidak diubah)</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
                  <select
                    required
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value, posyandu_id: '' })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="" disabled>Pilih Role</option>
                    <option value="role_admin_id_001">Admin</option>
                    <option value="role_nakes_id_001">Nakes</option>
                    <option value="role_ortu_id_001">Orang Tua</option>
                  </select>
                </div>

                {(formData.role_id === 'role_nakes_id_001' || formData.role_id === 'role_ortu_id_001') && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Posyandu</label>
                    <select
                      value={formData.posyandu_id}
                      onChange={(e) => setFormData({ ...formData, posyandu_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none bg-white"
                    >
                      <option value="">Tidak ada</option>
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
                    className="w-3.5 h-3.5 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <span className="text-sm font-medium text-slate-700">User Aktif</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors"
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
  const toast = useToast();

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
      toast.success('Data posyandu berhasil disimpan.');
    } catch (error) {
      console.error('Failed to save posyandu:', error);
      toast.error('Gagal menyimpan data posyandu.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus posyandu ini?')) {
      try {
        const { posyanduService } = await import('../../services/posyanduService');
        await posyanduService.delete(id);
        fetchPosyandus();
        toast.success('Posyandu berhasil dihapus.');
      } catch (error) {
        console.error('Failed to delete posyandu:', error);
        toast.error('Gagal menghapus posyandu.');
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold text-slate-800">Master Data Posyandu</h1>
        <button
          onClick={() => openModal()}
          className="bg-sky-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-sky-700 flex items-center gap-1.5"
        >
          <Plus size={15} /> Tambah Posyandu
        </button>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <label className="text-xs font-medium text-slate-500">Filter Desa:</label>
        <select
          value={filterDesaId}
          onChange={(e) => setFilterDesaId(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none min-w-[180px]"
        >
          <option value="">Semua Desa</option>
          {desas.map(desa => (
            <option key={desa.id} value={desa.id}>{desa.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-slate-400">Memuat data...</div>
        ) : posyandus.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">Belum ada data posyandu.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 w-10">No</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Nama Posyandu</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Desa</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 w-20 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posyandus.map((posyandu, index) => (
                  <tr key={posyandu.id} className="hover:bg-slate-50/60">
                    <td className="px-3 py-1.5 text-xs text-slate-500">{(page - 1) * perPage + index + 1}</td>
                    <td className="px-3 py-1.5 text-slate-800 font-medium">{posyandu.name}</td>
                    <td className="px-3 py-1.5 text-slate-600">{posyandu.desa?.name || '-'}</td>
                    <td className="px-3 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          onClick={() => openModal(posyandu)}
                          className="p-1 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(posyandu.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">
                {editingPosyandu ? 'Edit Posyandu' : 'Tambah Posyandu'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Posyandu</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  placeholder="Masukkan nama posyandu"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Desa</label>
                <select
                  required
                  value={formData.desa_id}
                  onChange={(e) => setFormData({ ...formData, desa_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="" disabled>Pilih Desa</option>
                  {desas.map(desa => (
                    <option key={desa.id} value={desa.id}>{desa.name}</option>
                  ))}
                </select>
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

export const AdminChildrenData: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-slate-800">Data Anak (Global)</h1>
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
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Posyandu</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Orang Tua</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 text-center w-20">Aksi</th>
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
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${child.gender === 'Laki-laki' ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'}`}>
                        {child.gender}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-slate-600 text-xs">
                      {child.birth_date ? new Date(child.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-3 py-1.5 text-sky-700 font-medium text-xs">{child.user?.posyandu?.name || '-'}</td>
                    <td className="px-3 py-1.5 text-slate-600 text-xs">{child.user.name || '-'}</td>
                    <td className="px-3 py-1.5 text-center">
                      <button
                        onClick={() => navigate(`/admin/children/${child.id}`)}
                        className="px-2 py-1 text-sky-700 font-medium rounded hover:bg-sky-50 border border-slate-200 text-xs inline-flex items-center gap-1 transition-colors"
                      >
                        Detail
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
    </div>
  );
};

export const AdminReports: React.FC = () => {
  return <ReportsOverview />;
};
