
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// Replace these placeholder values with your actual Firebase config
// You can find this in your Firebase project settings
const firebaseConfig = {
  // IMPORTANT: Replace these values with your actual Firebase config
  // If you're seeing authentication errors, this is likely the cause
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Debug Firebase config
console.log("Firebase config being used:", 
  Object.keys(firebaseConfig).reduce((acc, key) => {
    // Only show first few chars of API key for security
    if (key === 'apiKey') {
      acc[key] = firebaseConfig[key].substring(0, 5) + '...[HIDDEN]';
    } else {
      acc[key] = firebaseConfig[key];
    }
    return acc;
  }, {})
);

// Initialize Firebase app instance with configuration
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app); // Authentication service
export const db = getFirestore(app); // Firestore database service
export const storage = getStorage(app); // Storage service for files

// Enable offline persistence when possible
// This allows the app to work offline by caching Firestore data
try {
  console.log("Attempting to enable Firestore persistence...");
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log("Firestore persistence successfully enabled");
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time
        console.log('Persistence failed: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        // The current browser does not support persistence
        console.log('Persistence is not available in this browser');
      } else {
        console.error('Unknown error enabling persistence:', err);
      }
    });
} catch (error) {
  console.error("Error enabling persistence:", error);
}

// DEBUGGING TIP: If you're seeing authentication or permission errors:
// 1. Check that your Firebase API keys are correct in your environment variables
// 2. Ensure Authentication is enabled in Firebase console
// 3. Verify Firestore security rules allow the operations you're attempting
// 4. Make sure the user is properly authenticated before accessing data

export default app;
