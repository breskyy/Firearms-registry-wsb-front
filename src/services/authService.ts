import api, { setToken, clearAuth } from './api';
import type { LoginRequest, LoginResponse, UserDto } from '../types/api';

const ROLE_MAP: Record<string, string> = {
  Citizen: 'citizen',
  WpaOfficer: 'officer',
  Shop: 'shop',
  Admin: 'admin',
};

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const data = await api.post<LoginResponse>('/auth/login', credentials);
    setToken(data.token, data.expiresAt);
    localStorage.setItem('userRole', ROLE_MAP[data.user.role] ?? data.user.role.toLowerCase());
    return data;
  },

  logout(): void {
    clearAuth();
    window.location.href = '/';
  },

  async me(): Promise<UserDto> {
    return api.get<UserDto>('/auth/me');
  },
};
