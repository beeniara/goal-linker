
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useToast } from '@/hooks/use-toast';
import { UserData, AuthContextType } from '@/types/auth';
import { 
  fetchUserData, 
  signupUser, 
  loginUser, 
  logoutUser, 
  googleSignInUser, 
  resetUserPassword 
} from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const refreshUserData = async () => {
    if (!currentUser) return;
    const data = await fetchUserData(currentUser);
    if (data) {
      setUserData(data);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const data = await fetchUserData(user);
        if (data) {
          setUserData(data);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    try {
      const user = await signupUser(email, password, name);
      const userData = await fetchUserData(user);
      if (userData) {
        setUserData(userData);
      }
      
      toast({
        title: 'Account created',
        description: 'Your account has been created successfully!',
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup failed',
        description: error.message || 'Failed to create your account. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await loginUser(email, password);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.message || 'Incorrect email or password. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const googleSignIn = async () => {
    try {
      const user = await googleSignInUser();
      
      // Check if it's a new user by comparing userData state before and after
      if (!userData || userData.uid !== user.uid) {
        toast({
          title: 'Account created',
          description: 'Your account has been created successfully!',
        });
      } else {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in with Google.',
        });
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: 'Google Sign-in failed',
        description: error.message || 'Failed to sign in with Google. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout failed',
        description: error.message || 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await resetUserPassword(email);
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for a link to reset your password.',
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: 'Password reset failed',
        description: error.message || 'Failed to send password reset email. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const isAdmin = userData?.role === 'admin';

  const value = {
    currentUser,
    userData,
    signup,
    login,
    logout,
    googleSignIn,
    resetPassword,
    refreshUserData,
    loading,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
