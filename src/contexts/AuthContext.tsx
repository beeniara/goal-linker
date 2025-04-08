import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, getAuth } from 'firebase/auth';
import { db } from '../config/firebase';
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

const auth = getAuth();

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
  
  const refreshUserData = async (user: User) => {
    try {
      const data = await fetchUserData(user);
      if (!data) {
        throw new Error('Failed to fetch user data');
      }
      setUserData(data);
      return data;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh user data. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const data = await refreshUserData(user);
          setUserData(data);
        } catch (error) {
          console.error('Error setting up user data:', error);
          setUserData(null);
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
      const userData = await refreshUserData(user);
      
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
      const user = await loginUser(email, password);
      await refreshUserData(user);
      
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
      const newUserData = await refreshUserData(user);
      
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
      setUserData(null);
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
    refreshUserData: () => currentUser ? refreshUserData(currentUser) : Promise.reject(new Error('No user logged in')),
    loading,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
