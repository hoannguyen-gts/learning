import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

export const UNAUTHORIZED = 'Unauthorized';

export function useApi() {
  const { token, isAuthenticated, logout } = useAuth();


  const apiFetch = useCallback(
    async <T>(path: string, options: RequestInit = {}): Promise<T> => {
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> | undefined),
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (options.body && options.method !== 'GET' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

      const data: unknown = await res.json().catch(() => ({}));
      const message =
        typeof data === 'object' && data !== null && 'message' in data
          ? String((data as { message: unknown }).message)
          : '';

      if (res.status === 401 || res.status === 403) {
        console.warn('Auth failed:', message);
        if (isAuthenticated) {
          alert(message || 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
          logout();
        }
        throw new ApiRequestError(message || UNAUTHORIZED, res.status);
      }

      if (!res.ok) {
        throw new ApiRequestError(message || `HTTP ${res.status}`, res.status);
      }

      return data as T;
    },
    [token, isAuthenticated, logout],
  );

  return { apiFetch };
}
