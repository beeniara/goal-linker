
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// Replace with your own Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

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

// Important: If you're seeing authentication or permission errors, check:
// 1. Your Firebase API keys are correct
// 2. Authentication is enabled in Firebase console
// 3. Firestore security rules allow the operations you're attempting
// 4. The user is properly authenticated before accessing data

export default app;
