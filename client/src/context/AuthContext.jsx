import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_STORAGE_KEY } from '../constants/auth';
import { login as loginRequest } from '../services/authService';

const AuthContext = createContext({
  user: null,
  token: null,
  initializing: true,
  authLoading: false,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setInitializing(false);
      return;
    }
    try {
      const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token && parsed?.user) {
          setUser(parsed.user);
          setToken(parsed.token);
        }
      }
    } catch (error) {
      console.warn('Failed to parse stored auth information', error);
    } finally {
      setInitializing(false);
    }
  }, []);

  const persistSession = useCallback((data) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    }
  }, []);

  const clearSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const login = async (credentials) => {
    setAuthLoading(true);
    try {
      const data = await loginRequest(credentials);
      setUser(data.user);
      setToken(data.token);
      persistSession(data);
      return data;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const handler = () => {
      logout();
    };
    window.addEventListener('workmanager:unauthorized', handler);
    return () => {
      window.removeEventListener('workmanager:unauthorized', handler);
    };
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      authLoading,
      login,
      logout,
    }),
    [user, token, initializing, authLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);


