import React, { useState, useEffect } from 'react';
import { Pagination } from '../../components/Pagination';
import { roleService, Role, MasterAccess } from '../../services/roleService';
import { Edit2, Trash2, Plus, X, ShieldCheck } from 'lucide-react';

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [masterAccesses, setMasterAccesses] = useState<MasterAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
    } catch (error: any) {
      console.error('Failed to save role:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan role.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus role ini?')) {
      try {
        await roleService.delete(id);
        fetchRoles();
      } catch (error: any) {
        console.error('Failed to delete role:', error);
        alert(error.response?.data?.message || 'Gagal menghapus role.');
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
    } catch (error: any) {
      console.error('Failed to update access:', error);
      alert(error.response?.data?.message || 'Gagal memperbarui hak akses.');
    }
  };

  const toggleAccess = (id: string) => {
    setSelectedAccessIds(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-slate-800">Role Management</h1>
        <button 
          onClick={() => openFormModal()}
          className="bg-sky-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-sky-700 flex items-center gap-2"
        >
          <Plus size={18} /> Tambah Role
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Memuat data...</div>
        ) : roles.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Belum ada data role.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600 text-sm">Kode</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Nama</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Akses Global</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Status</th>
                <th className="p-4 font-bold text-slate-600 text-sm w-48 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-slate-800 font-mono text-sm">{role.code}</td>
                  <td className="p-4 text-slate-800 font-medium">{role.name}</td>
                  <td className="p-4 text-slate-600">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${role.is_global_access ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                      {role.is_global_access ? 'Ya' : 'Tidak'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${role.status ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {role.status ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => openAccessModal(role)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Atur Hak Akses"
                        disabled={role.is_global_access} // Global access means all access anyway
                      >
                        <ShieldCheck size={16} />
                      </button>
                      <button 
                        onClick={() => openFormModal(role)}
                        className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        title="Edit Role"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(role.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Role"
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

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingRole ? 'Edit Role' : 'Tambah Role'}
              </h2>
              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Kode Role</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none uppercase font-mono"
                  placeholder="Misal: KADER"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Role</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  placeholder="Nama Tampilan Role"
                />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="statusCheckbox"
                  checked={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <label htmlFor="statusCheckbox" className="text-sm font-bold text-slate-700">Aktif</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="globalAccessCheckbox"
                  checked={formData.is_global_access}
                  onChange={(e) => setFormData({ ...formData, is_global_access: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="globalAccessCheckbox" className="text-sm font-bold text-slate-700">Global Access (Akses Semua Menu)</label>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
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

      {/* Access Modal */}
      {isAccessModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Atur Hak Akses</h2>
                <p className="text-sm text-slate-500">Role: <span className="font-bold text-slate-700">{selectedRoleForAccess?.name}</span></p>
              </div>
              <button 
                onClick={() => setIsAccessModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              <div className="space-y-3">
                {masterAccesses.length === 0 ? (
                  <p className="text-center text-slate-500">Tidak ada master access tersedia.</p>
                ) : (
                  masterAccesses.map((access) => (
                    <label 
                      key={access.id} 
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                        selectedAccessIds.includes(access.id) 
                        ? 'bg-indigo-50 border-indigo-200' 
                        : 'bg-white border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAccessIds.includes(access.id)}
                        onChange={() => toggleAccess(access.id)}
                        className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-bold text-slate-800">{access.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{access.code}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button
                type="button"
                onClick={() => setIsAccessModalOpen(false)}
                className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAccess}
                className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
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
