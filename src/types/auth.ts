
import { User } from 'firebase/auth';

export type UserRole = 'user' | 'admin';

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  bio?: string;
  phone?: string;
  location?: string;
  company?: string;
  website?: string;
  updatedAt?: Date;
}

export interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
}
