
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For development, we'll use some default values if environment variables are not set
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ||  "AIzaSyD-jZE3bsJO0ahNgRda4pPzC_heaQpDh5s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "projectpanner.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "projectpanner",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "projectpanner.appspot.com", // Fixed the storage bucket URL format
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "428222471810",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:428222471810:web:1e81cf4057d4ed9d501e9b",
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

// Check if we have valid configuration
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.error("WARNING: Firebase API key is missing or using default value.");
  console.error("For production, set the VITE_FIREBASE_API_KEY environment variable.");
  console.log("Using demo Firebase project for development purposes.");
} else {
  console.log("Firebase configuration is valid.");
}

// Initialize Firebase only if it hasn't been initialized already
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]; // Use existing app if already initialized
}

// Initialize Firebase services
export const auth = getAuth(app); // Authentication service
export const db = getFirestore(app); // Firestore database service
export const storage = getStorage(app); // Storage service for files

// Enable offline persistence when possible
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

export default app;
