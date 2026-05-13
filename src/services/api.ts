import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Token storage keys
const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Token expired or invalid
    if (error.response?.status === 401) {
      clearAuth();
      // Redirect to login
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    // Extract error message
    const apiError: ApiError = error.response?.data || {
      message: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
    };

    return Promise.reject(apiError);
  }
);

// ============================================================================
// AUTH HELPERS
// ============================================================================

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!token || !expiry) {
    return null;
  }

  // Check if token is expired
  if (new Date(expiry) < new Date()) {
    clearAuth();
    return null;
  }

  return token;
}

export function setToken(token: string, expiresAt: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt);
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem('userRole'); // Clear role too
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default apiClient;
