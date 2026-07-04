import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { UserDTO, AuthResponseDTO } from '@vestara/types';
import { apiClient } from '../../api/client';

interface AuthState {
  user: UserDTO | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const setUser = useCallback((user: UserDTO | null) => {
    setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    let cancelled = false;

    apiClient
      .get<{ user: UserDTO }>('/auth/me')
      .then((res) => {
        if (!cancelled) {
          if (res.data?.user) {
            setUser(res.data.user);
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [setUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<AuthResponseDTO>('/auth/login', { email, password });
    if (res.data) {
      localStorage.setItem('accessToken', res.data.tokens.accessToken);
      localStorage.setItem('refreshToken', res.data.tokens.refreshToken);
      setUser(res.data.user);
    }
  }, [setUser]);

  const register = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const res = await apiClient.post<AuthResponseDTO>('/auth/register', data);
    if (res.data) {
      localStorage.setItem('accessToken', res.data.tokens.accessToken);
      localStorage.setItem('refreshToken', res.data.tokens.refreshToken);
      setUser(res.data.user);
    }
  }, [setUser]);

  const logout = useCallback(async () => {
    const userId = state.user?.id;
    try {
      if (userId) {
        await apiClient.post('/auth/logout', { userId });
      }
    } catch {
      // Clear local state even if API call fails
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, [state.user?.id, setUser]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
