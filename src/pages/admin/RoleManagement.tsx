import React, { useState, useEffect } from 'react';
import { Pagination } from '../../components/Pagination';
import { roleService, Role, MasterAccess } from '../../services/roleService';
import { Edit2, Trash2, Plus, X, ShieldCheck } from 'lucide-react';
import { useToast } from '../../components/Toast';

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [masterAccesses, setMasterAccesses] = useState<MasterAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  
  // Form state
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    status: true,
    is_global_access: false
  });
  
  // Access state
  const [selectedAccessIds, setSelectedAccessIds] = useState<string[]>([]);
  const [selectedRoleForAccess, setSelectedRoleForAccess] = useState<Role | null>(null);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await roleService.getAll({ page, per_page: perPage });
      setRoles(response.data || []);
      if (response.metadata) {
        setTotalPages(response.metadata.total_page || 1);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMasterAccesses = async () => {
    try {
      const response = await roleService.getMasterAccess();
      setMasterAccesses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch master accesses:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page]);

  useEffect(() => {
    fetchMasterAccesses();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await roleService.update(editingRole.id, formData);
      } else {
        await roleService.create(formData);
      }
      setIsFormModalOpen(false);
      setEditingRole(null);
      setFormData({ code: '', name: '', status: true, is_global_access: false });
      fetchRoles();
      toast.success('Role berhasil disimpan.');
    } catch (error: any) {
      console.error('Failed to save role:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan role.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus role ini?')) {
      try {
        await roleService.delete(id);
        fetchRoles();
        toast.success('Role berhasil dihapus.');
      } catch (error: any) {
        console.error('Failed to delete role:', error);
        toast.error(error.response?.data?.message || 'Gagal menghapus role.');
      }
    }
  };

  const openFormModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({ 
        code: role.code, 
        name: role.name, 
        status: role.status, 
        is_global_access: role.is_global_access 
      });
    } else {
      setEditingRole(null);
      setFormData({ code: '', name: '', status: true, is_global_access: false });
    }
    setIsFormModalOpen(true);
  };

  const openAccessModal = async (role: Role) => {
    setSelectedRoleForAccess(role);
    try {
      // Fetch full role details to get accesses
      const response = await roleService.getById(role.id);
      const roleDetails = response.data;
      if (roleDetails.role_accesses) {
        setSelectedAccessIds(roleDetails.role_accesses.map((ra: any) => ra.master_id));
      } else {
        setSelectedAccessIds([]);
      }
      setIsAccessModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch role details for access', error);
    }
  };

  const handleSaveAccess = async () => {
    if (!selectedRoleForAccess) return;
    try {
      await roleService.updateAccess(selectedRoleForAccess.id, selectedAccessIds);
      setIsAccessModalOpen(false);
      setSelectedRoleForAccess(null);
      setSelectedAccessIds([]);
      toast.success('Hak akses berhasil diperbarui.');
    } catch (error: any) {
      console.error('Failed to update access:', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui hak akses.');
    }
  };

  const toggleAccess = (id: string) => {
    setSelectedAccessIds(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold text-slate-800">Role Management</h1>
        <button
          onClick={() => openFormModal()}
          className="bg-sky-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-sky-700 flex items-center gap-1.5"
        >
          <Plus size={15} /> Tambah Role
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-slate-400">Memuat data...</div>
        ) : roles.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">Belum ada data role.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 w-10 text-center">No</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Kode</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Nama</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Akses Global</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 w-28 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roles.map((role, index) => (
                  <tr key={role.id} className="hover:bg-slate-50/60">
                    <td className="px-3 py-1.5 text-center text-xs text-slate-500">
                      {(page - 1) * perPage + index + 1}
                    </td>
                    <td className="px-3 py-1.5 text-slate-700 font-mono text-xs">{role.code}</td>
                    <td className="px-3 py-1.5 text-slate-800 font-medium">{role.name}</td>
                    <td className="px-3 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${role.is_global_access ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                        {role.is_global_access ? 'Ya' : 'Tidak'}
                      </span>
                    </td>
                    <td className="px-3 py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${role.status ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {role.status ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          onClick={() => openAccessModal(role)}
                          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Atur Hak Akses"
                          disabled={role.is_global_access}
                        >
                          <ShieldCheck size={13} />
                        </button>
                        <button
                          onClick={() => openFormModal(role)}
                          className="p-1 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          title="Edit Role"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Hapus Role"
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

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">
                {editingRole ? 'Edit Role' : 'Tambah Role'}
              </h2>
              <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Role</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none uppercase font-mono"
                  placeholder="Misal: KADER"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Role</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  placeholder="Nama Tampilan Role"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                    className="w-3.5 h-3.5 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-700">Aktif</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_global_access}
                    onChange={(e) => setFormData({ ...formData, is_global_access: e.target.checked })}
                    className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">Global Access</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
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

      {/* Access Modal */}
      {isAccessModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800">Atur Hak Akses</h2>
                <p className="text-xs text-slate-500">Role: <span className="font-semibold text-slate-700">{selectedRoleForAccess?.name}</span></p>
              </div>
              <button onClick={() => setIsAccessModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-slate-50/50">
              <div className="space-y-2">
                {masterAccesses.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 py-4">Tidak ada master access tersedia.</p>
                ) : (
                  masterAccesses.map((access) => (
                    <label
                      key={access.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                        selectedAccessIds.includes(access.id)
                        ? 'bg-indigo-50 border-indigo-200'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAccessIds.includes(access.id)}
                        onChange={() => toggleAccess(access.id)}
                        className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-800">{access.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{access.code}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2 bg-white">
              <button
                type="button"
                onClick={() => setIsAccessModalOpen(false)}
                className="px-3 py-1.5 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAccess}
                className="px-3 py-1.5 text-sm bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
              >
                Simpan Akses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
