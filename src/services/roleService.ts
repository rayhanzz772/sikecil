import api from './api';

export interface MasterAccess {
  id: string;
  name: string;
  code: string;
  slug: string;
  icon: string;
  head: string | null;
  sequence: number;
  type_allowed: string;
}

export interface RoleAccess {
  role_id: string;
  master_id: string;
  master_access: MasterAccess;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  status: boolean;
  is_global_access: boolean;
  role_accesses?: RoleAccess[];
  created_at?: string;
  updated_at?: string;
}

export const roleService = {
  getAll: async (params?: { search?: string, status?: boolean, page?: number, per_page?: number }) => {
    const response = await api.get('/roles', { 
      params: { 
        q: params?.search, 
        status: params?.status, 
        page: params?.page, 
        per_page: params?.per_page 
      } 
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  create: async (data: { code: string; name: string; status?: boolean; is_global_access?: boolean }) => {
    const response = await api.post('/roles', data);
    return response.data;
  },

  update: async (id: string, data: { code?: string; name?: string; status?: boolean; is_global_access?: boolean }) => {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },

  updateAccess: async (id: string, master_ids: string[]) => {
    const response = await api.put(`/roles/${id}/access`, { master_ids });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },

  getMasterAccess: async () => {
    const response = await api.get('/roles/master-access');
    return response.data;
  }
};
