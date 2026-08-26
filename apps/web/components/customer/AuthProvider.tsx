'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, type VerifyOtpResponse } from '@/lib/auth-api';
import { getAuthToken, clearAuthToken } from '@/lib/auth';
import type { CustomerUser } from '@/lib/types';

interface AuthContextType {
  user: CustomerUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    phone: string,
    code: string,
    sessionId?: string,
    wishlistSession?: string,
    name?: string
  ) => Promise<VerifyOtpResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<CustomerUser | null>;
  updateProfile: (data: { name?: string; phone?: string; email?: string }) => Promise<CustomerUser>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async (): Promise<CustomerUser | null> => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return null;
    }

    try {
      setToken(currentToken);
      const res = await authApi.me();
      setUser(res.user);
      return res.user;
    } catch {
      clearAuthToken();
      setUser(null);
      setToken(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (
    phone: string,
    code: string,
    sessionId?: string,
    wishlistSession?: string,
    name?: string
  ): Promise<VerifyOtpResponse> => {
    const res = await authApi.verifyOtp(phone, code, sessionId, wishlistSession, name);
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const updateProfile = async (data: {
    name?: string;
    phone?: string;
    email?: string;
  }): Promise<CustomerUser> => {
    const res = await authApi.updateProfile(data);
    setUser(res.user);
    return res.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
