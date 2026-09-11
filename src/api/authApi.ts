import api from './axios';
import { AuthResponse, LoginRequest, RegisterRequest, UserDto } from '../types';

export const authApi = {
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', request);
    return res.data;
  },

  register: async (request: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', request);
    return res.data;
  },

  getCurrentUser: async (): Promise<UserDto> => {
    const res = await api.get<UserDto>('/auth/me');
    return res.data;
  },

  changePassword: async (passwords: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.post('/auth/change-password', passwords);
  },

  updateProfile: async (data: { firstName: string; lastName: string; profileImageUrl?: string }): Promise<UserDto> => {
    const res = await api.put<UserDto>('/auth/profile', data);
    return res.data;
  },
};
