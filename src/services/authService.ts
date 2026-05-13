import apiClient, { setToken, clearAuth } from './api';
import type { LoginRequest, LoginResponse, UserDto } from '../types/api';

export const authService = {
  /**
   * Login user and store JWT token
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    const { token, expiresAt, user } = response.data;

    // Store token and user role
    setToken(token, expiresAt);
    localStorage.setItem('userRole', user.role);

    return response.data;
  },

  /**
   * Logout user
   */
  logout(): void {
    clearAuth();
    window.location.href = '/';
  },

  /**
   * Get current user info
   */
  async me(): Promise<UserDto> {
    const response = await apiClient.get<UserDto>('/auth/me');
    return response.data;
  },
};
