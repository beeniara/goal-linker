import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { auth } from '../config/firebase';

export interface User {
  id: string;
  displayName: string;
  email: string;
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('id', '!=', auth.currentUser?.uid));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}; 