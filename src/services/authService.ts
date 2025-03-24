
import { 
  User,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserData } from '@/types/auth';

export const fetchUserData = async (user: User): Promise<UserData | null> => {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    } else {
      // Create user document if it doesn't exist
      const newUserData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'user', // Default role
      };
      
      await setDoc(userDocRef, newUserData);
      return newUserData;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

export const signupUser = async (email: string, password: string, name: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });
  
  // Create user document
  const newUserData: UserData = {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    displayName: name,
    photoURL: null,
    role: 'user',
  };
  
  await setDoc(doc(db, 'users', userCredential.user.uid), newUserData);
  return userCredential.user;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const googleSignInUser = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  
  // Check if it's a new user
  const userDocRef = doc(db, 'users', result.user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) {
    // Create user document for new Google sign-in
    const newUserData: UserData = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      role: 'user',
    };
    
    await setDoc(userDocRef, newUserData);
  }
  
  return result.user;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const resetUserPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const updateUserProfile = async (user: User, profileData: Partial<UserData>): Promise<void> => {
  const userDocRef = doc(db, 'users', user.uid);
  
  // Update user document in Firestore
  await updateDoc(userDocRef, {
    ...profileData,
    updatedAt: new Date(),
  });
  
  // Update display name in Firebase Auth if provided
  if (profileData.displayName) {
    await updateProfile(user, {
      displayName: profileData.displayName,
    });
  }
  
  // Update photo URL in Firebase Auth if provided
  if (profileData.photoURL) {
    await updateProfile(user, {
      photoURL: profileData.photoURL,
    });
  }
};
