import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import { AuthResponse, LoginRequest, RegisterRequest, RoleName } from '../types';

interface AuthContextType {
  user: AuthResponse | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (requestOrEmail: LoginRequest | string, password?: string) => Promise<AuthResponse>;
  register: (request: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
  hasRole: (role: RoleName) => boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  isStudent: boolean;
  quickLogin: (role: 'admin' | 'instructor' | 'student') => Promise<void>;
  updateUser: (updatedFields: Partial<AuthResponse>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('elearning_token');
      const storedUser = localStorage.getItem('elearning_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse cached auth state:', e);
      localStorage.removeItem('elearning_token');
      localStorage.removeItem('elearning_user');
    } finally {
      setIsLoading(false);
    }

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (requestOrEmail: LoginRequest | string, password?: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const req: LoginRequest =
        typeof requestOrEmail === 'string'
          ? { email: requestOrEmail, password: password || '' }
          : requestOrEmail;
      const response = await authApi.login(req);
      setToken(response.accessToken);
      setUser(response);
      localStorage.setItem('elearning_token', response.accessToken);
      localStorage.setItem('elearning_user', JSON.stringify(response));
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (request: RegisterRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const rawRole = (request.role || (request.roles?.[0] as string) || 'STUDENT')
        .replace(/^ROLE_/i, '')
        .toUpperCase() as RoleName;

      const req: RegisterRequest = {
        firstName: request.firstName.trim(),
        lastName: request.lastName.trim(),
        email: request.email.trim().toLowerCase(),
        password: request.password,
        role: rawRole === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'STUDENT',
      };
      const response = await authApi.register(req);
      setToken(response.accessToken);
      setUser(response);
      localStorage.setItem('elearning_token', response.accessToken);
      localStorage.setItem('elearning_user', JSON.stringify(response));
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('elearning_token');
    localStorage.removeItem('elearning_user');
  };

  const hasRole = (role: RoleName): boolean => {
    if (!user || !user.roles) return false;
    const roleString = `ROLE_${role}`;
    return user.roles.includes(roleString) || user.roles.includes(role);
  };

  const isAdmin = hasRole('ADMIN');
  const isInstructor = hasRole('INSTRUCTOR');
  const isStudent = hasRole('STUDENT');

  const quickLogin = async (role: 'admin' | 'instructor' | 'student') => {
    let creds: LoginRequest;
    if (role === 'admin') {
      creds = { email: 'admin@elearning.com', password: 'Admin@123' };
    } else if (role === 'instructor') {
      creds = { email: 'john.doe@elearning.com', password: 'Instructor@123' };
    } else {
      creds = { email: 'alice.smith@student.com', password: 'Student@123' };
    }
    await login(creds);
  };

  const updateUser = (updatedFields: Partial<AuthResponse>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('elearning_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        hasRole,
        isAdmin,
        isInstructor,
        isStudent,
        quickLogin,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
