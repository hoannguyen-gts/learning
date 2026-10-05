import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { getStoredToken, getStoredUser, saveSession, clearSession } from '../lib/storage';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  /** Legacy: isAuthenticated() — app.js:36 */
  isAuthenticated: boolean;
  /** Legacy: app.js:148-150 */
  login: (token: string, user: User) => void;
  /** Legacy: logout() — app.js:102-111 */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const isAuthenticated = Boolean(token) && Boolean(user);

  const login = useCallback((newToken: string, newUser: User) => {
    saveSession(newToken, newUser); 
    setToken(newToken);               
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
