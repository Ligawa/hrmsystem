'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  applicantId: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const applicantId = localStorage.getItem('applicant_id');
        const userEmail = localStorage.getItem('user_email');
        const userFirstName = localStorage.getItem('user_first_name');
        const userLastName = localStorage.getItem('user_last_name');
        const userId = localStorage.getItem('user_id');

        if (applicantId && userEmail && userId) {
          setUser({
            id: userId,
            email: userEmail,
            firstName: userFirstName || '',
            lastName: userLastName || '',
            applicantId,
          });
        }
      } catch (error) {
        console.error('[v0] Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const userData: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        applicantId: data.applicantId,
      };

      // Store in localStorage for persistence
      localStorage.setItem('applicant_id', data.applicantId);
      localStorage.setItem('user_email', data.user.email);
      localStorage.setItem('user_first_name', data.user.firstName);
      localStorage.setItem('user_last_name', data.user.lastName);
      localStorage.setItem('user_id', data.user.id);

      setUser(userData);
    } catch (error) {
      console.error('[v0] Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Clear localStorage
      localStorage.removeItem('applicant_id');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_first_name');
      localStorage.removeItem('user_last_name');
      localStorage.removeItem('user_id');
      setUser(null);
    } catch (error) {
      console.error('[v0] Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    const applicantId = localStorage.getItem('applicant_id');
    if (!applicantId) return;

    try {
      const response = await fetch(`/api/applicant/profile?applicantId=${applicantId}`);
      if (response.ok) {
        const data = await response.json();
        const updatedUser: AuthUser = {
          id: data.auth_user_id,
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          applicantId: data.applicant_id,
        };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('[v0] Refresh user error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
