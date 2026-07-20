import api from './api';

export interface UserDTO {
  id?: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role_id: string;
  status: boolean;
  posyandu_id?: string | null;
}

export interface OrtuDTO {
  name: string;
  username: string;
  email: string;
  password: string;
  nik?: string | null;
  phone?: string | null;
  address?: string | null;
}

export const userService = {
  getAll: async (params?: { search?: string, role?: string, page?: number, per_page?: number }) => {
    const response = await api.get('/users', { params: { q: params?.search, role: params?.role, page: params?.page, per_page: params?.per_page } });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: UserDTO) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // NAKES only — POST /users/ortu (role & posyandu auto-assigned server-side)
  createOrtu: async (data: OrtuDTO) => {
    const response = await api.post('/users/ortu', data);
    return response.data;
  },

  // NAKES only — GET /users/ortu/:id (get detail + children)
  getOrtuDetail: async (id: string) => {
    const response = await api.get(`/users/ortu/${id}`);
    return response.data;
  },

  // NAKES only — PUT /users/ortu/:id (edit ortu)
  updateOrtu: async (id: string, data: Partial<OrtuDTO> & { status?: boolean }) => {
    const response = await api.put(`/users/ortu/${id}`, data);
    return response.data;
  },

  // NAKES only — DELETE /users/ortu/:id (delete ortu)
  deleteOrtu: async (id: string) => {
    const response = await api.delete(`/users/ortu/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<UserDTO>) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};
