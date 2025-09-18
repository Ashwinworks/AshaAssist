import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { signInWithGoogle, signOutUser } from '../services/firebase';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'user' | 'asha_worker' | 'admin';
  beneficiaryCategory?: 'maternity' | 'palliative';
  isFirstLogin: boolean;
  profileCompleted: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  showCategorySelection: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
    userType: string;
    beneficiaryCategory: string;
  }) => Promise<void>;
  checkEmailAvailability: (email: string) => Promise<{ available: boolean; message?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  hideCategorySelection: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCategorySelection, setShowCategorySelection] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth...');
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      console.log('Token from localStorage:', token ? 'exists' : 'not found');
      console.log('User from localStorage:', savedUser ? 'exists' : 'not found');

      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('Setting user from localStorage:', userData);
          setUser(userData);
          // Optionally verify token with backend
          await authAPI.getProfile();
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
      console.log('Auth initialization complete');
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      
      const { access_token, user: userData } = response;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('Login successful!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
    userType: string;
    beneficiaryCategory: string;
  }) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);

      // User data is stored in database, but we don't auto-login
      // User needs to manually login after registration

      toast.success('Registration successful! Please login with your credentials.');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkEmailAvailability = async (email: string) => {
    try {
      const response = await authAPI.checkEmailAvailability(email);
      return response;
    } catch (error: any) {
      // If the endpoint doesn't exist yet, assume email is available for now
      // This will be replaced when the backend implements the endpoint
      return { available: true };
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('Starting Google sign-in...');
      const firebaseUser = await signInWithGoogle();
      
      if (firebaseUser) {
        console.log('Firebase user obtained:', firebaseUser.email);
        // Get the ID token from Firebase
        const idToken = await firebaseUser.getIdToken();
        console.log('ID token obtained');
        
        // Send the token to your backend for verification and user creation/login
        const response = await authAPI.googleLogin(idToken);
        console.log('Backend response:', response);
        
        const { access_token, user: userData } = response;
        
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        console.log('User set in context:', userData);
        
        // Check if user needs to select category (new Google users)
        if (userData.isFirstLogin && userData.beneficiaryCategory === 'maternity' && !userData.profileCompleted) {
          console.log('New Google user detected, showing category selection');
          setShowCategorySelection(true);
        }
        
        toast.success('Google sign-in successful!');
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      const message = error.response?.data?.error || 'Google sign-in failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Sign out from Firebase
      await signOutUser();
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if Firebase logout fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const hideCategorySelection = () => {
    setShowCategorySelection(false);
  };

  const value: AuthContextType = {
    user,
    loading,
    showCategorySelection,
    login,
    loginWithGoogle,
    register,
    checkEmailAvailability,
    logout,
    updateUser,
    hideCategorySelection,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};