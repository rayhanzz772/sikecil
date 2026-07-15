import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

export type Role = 'admin' | 'nakes' | 'ortu';

export interface User {
  id: string;
  username: string;
  role: Role;
  name?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Call backend to clear httpOnly cookie
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // Endpoint that returns user info based on httpOnly cookie
      const response = await api.get('/auth/me');
      if (response.data && response.data.data) {
        const userData = response.data.data;
        let roleStr = '';
        if (typeof userData.role === 'string') {
          roleStr = userData.role;
        } else if (userData.role) {
          roleStr = userData.role.code || userData.role.name || JSON.stringify(userData.role);
        }
        
        const rawRole = roleStr.toLowerCase();
        let normalizedRole: Role = 'nakes';
        if (rawRole.includes('admin')) normalizedRole = 'admin';
        else if (rawRole.includes('ortu') || rawRole.includes('orang tua')) normalizedRole = 'ortu';
        
        const user: User = {
          ...userData,
          role: normalizedRole
        };
        setUser(user);
      }
    } catch (error) {
      console.error('Not authenticated', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
