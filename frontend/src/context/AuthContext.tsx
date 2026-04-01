import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logoutApi, verifyAuth } from '../api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  /** True while the initial /auth/verify/ check is in flight. */
  isLoading: boolean;
  /** Call after a successful login — no tokens needed, they live in cookies. */
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Start in loading state so PrivateRoute waits for the verify check before
  // redirecting to /login (avoids a flash redirect for already-logged-in users).
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    verifyAuth()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsLoading(false));
  }, []);

  const login = () => setIsAuthenticated(true);

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // Server-side cookie clearing is best-effort; clear local state regardless.
    }
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
