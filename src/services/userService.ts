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

  update: async (id: string, data: Partial<UserDTO>) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};
