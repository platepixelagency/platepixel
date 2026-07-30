import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types/index';
import { getAuthToken, setAuthToken, removeAuthToken, fetchWithAuth } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    companyName?: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => void;
  seedAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getAuthToken();
      if (storedToken) {
        try {
          const res = await fetchWithAuth<{ user: User }>('/auth/me');
          setUser(res.user);
        } catch (error) {
          console.error('Session expired or invalid:', error);
          removeAuthToken();
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await fetchWithAuth<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (regData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    companyName?: string;
    phone?: string;
  }): Promise<User> => {
    const data = await fetchWithAuth<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(regData),
    });

    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
  };

  const seedAdmin = async () => {
    await fetchWithAuth('/auth/seed-admin', { method: 'POST' });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, seedAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
