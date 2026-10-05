import type { User } from '../types';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'access_token';

interface JWTPayload {
  id: number;
  username: string;
  iat?: number;
  exp?: number;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// decode JWT và kiểm tra hạn sử dụng
export function decodeToken(token: string): User | null {
  try {
    const payload = jwtDecode<JWTPayload>(token);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    return { id: payload.id, username: payload.username };
  } catch {
    return null;
  }
}

// lấy user trực tiếp từ token lưu trong localStorage
export function getStoredUser(): User | null {
  const token = getStoredToken();
  if (!token) return null;
  return decodeToken(token);
}

// chỉ lưu token, không lưu object user riêng
export function saveSession(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
}
