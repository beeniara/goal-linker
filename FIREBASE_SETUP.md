# Firebase Setup Guide for TaskFlow

This guide will help you set up the Firebase services needed for the TaskFlow app.

## Prerequisites

1. Node.js and npm installed
2. Firebase CLI installed (`npm install -g firebase-tools`)
3. Google account

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "TaskFlow")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create Project"

## Step 2: Set Up Firebase Authentication

1. In the Firebase Console, select your project
2. Click on "Authentication" in the left sidebar
3. Click on "Get started"
4. Enable the following sign-in methods:
   - Email/Password
   - Google
5. Configure the sign-in methods according to your needs

## Step 3: Set Up Firebase Firestore

1. In the Firebase Console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" or "Start in test mode" (for development)
4. Select a location closest to your users
5. Click "Enable"

## Step 4: Set Up Firebase Storage

1. In the Firebase Console, click on "Storage" in the left sidebar
2. Click "Get started"
3. Review and accept the default rules (you can modify them later)
4. Click "Next" and "Done"

## Step 5: Create Firestore Security Rules

1. In the Firebase Console, go to "Firestore Database"
2. Click on the "Rules" tab
3. Replace the default rules with the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access based on user authentication
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Savings collection rules
    match /savings/{savingsId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || 
                                              resource.data.members.hasAny([request.auth.uid]));
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                             (resource.data.userId == request.auth.uid || 
                              resource.data.members.hasAny([request.auth.uid]));
    }
    
    // Savings Invitations collection rules
    match /savingsInvitations/{invitationId} {
      // Allow authenticated users to create invitations
      allow create: if request.auth != null;
      
      // Allow any authenticated user to query invitations (for checking existing ones)
      allow list: if request.auth != null;
      
      // The creator of the invitation can read, update and delete
      allow read, update, delete: if request.auth != null && 
                                  resource.data.inviterId == request.auth.uid;
      
      // The invitee can read invitations sent to their email
      allow read: if request.auth != null && 
                 resource.data.inviteeEmail == request.auth.token.email;
      
      // The invitee can update the status when accepting/declining
      allow update: if request.auth != null && 
                   resource.data.inviteeEmail == request.auth.token.email &&
                   request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'inviteeId']);
    }
    
    // Reminders collection rules
    match /reminders/{reminderId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Support collection rules
    match /support/{supportId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Projects rules
    match /projects/{projectId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || 
                                             resource.data.collaborators[request.auth.uid] == true);
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Tasks rules
    match /tasks/{taskId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || 
                                             resource.data.collaborators[request.auth.uid] == true);
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Goals rules
    match /goals/{goalId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || 
                                             resource.data.collaborators[request.auth.uid] == true);
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Notifications collection rules
    match /notifications/{notificationId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Admin rules (optional - only if you implement admin features)
    match /{document=**} {
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

4. Click "Publish"

## Step 6: Create Storage Security Rules

1. In the Firebase Console, go to "Storage"
2. Click on the "Rules" tab
3. Replace the default rules with the following:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Files are only accessible to the user who uploaded them
    match /user/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Project files can be accessed by project collaborators
    match /projects/{projectId}/{allPaths=**} {
      allow read: if request.auth != null && 
        (exists(/databases/$(database)/documents/projects/$(projectId)) && 
        (get(/databases/$(database)/documents/projects/$(projectId)).data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/projects/$(projectId)).data.collaborators[request.auth.uid] == true));
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/projects/$(projectId)) && 
        get(/databases/$(database)/documents/projects/$(projectId)).data.userId == request.auth.uid;
    }
    
    // Admin can access all files (optional - only if you implement admin features)
    match /{allPaths=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

4. Click "Publish"

## Step 7: Get Your Firebase Config

1. In the Firebase Console, click on the gear icon next to "Project Overview" and select "Project settings"
2. Scroll down to the "Your apps" section
3. Click the web app icon (`</>`), or "Add app" if you haven't added one yet
4. Register your app with a nickname
5. Copy the Firebase configuration object

## Step 8: Update Your App's Firebase Config

1. Open the file `src/firebase/config.ts` in your project
2. Replace the placeholder configuration with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 9: Set Up Environment Variables (Recommended for Production)

For better security in production environments, use environment variables instead of hardcoded Firebase config:

1. Create a `.env` file in your project root (add it to `.gitignore`)
2. Add your Firebase configuration as environment variables:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

3. Update your `firebase/config.ts` to use environment variables:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## Step 10: Deploy Your App to Firebase Hosting (Optional)

1. Initialize Firebase in your project:
   ```
   firebase login
   firebase init
   ```
2. Select Hosting and any other Firebase services you want to use
3. Build your project:
   ```
   npm run build
   ```
4. Deploy to Firebase:
   ```
   firebase deploy
   ```

## Firestore Database Schema

Here's a recommended Firestore schema for your TaskFlow app:

### Users Collection

```
/users/{userId}
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  role: 'user' | 'admin',
  createdAt: timestamp,
  lastLogin: timestamp
}
```

### Projects Collection

```
/projects/{projectId}
{
  id: string,
  title: string,
  description: string,
  userId: string, // owner
  collaborators: {
    [userId]: boolean // set to true for each collaborator
  },
  createdAt: timestamp,
  updatedAt: timestamp,
  dueDate: timestamp (optional),
  category: string,
  tags: array<string>,
  tasksTotal: number,
  tasksCompleted: number
}
```

### Tasks Collection

```
/tasks/{taskId}
{
  id: string,
  title: string,
  description: string,
  userId: string, // owner
  projectId: string (optional),
  projectTitle: string (optional),
  collaborators: {
    [userId]: boolean // set to true for each collaborator
  },
  createdAt: timestamp,
  updatedAt: timestamp,
  dueDate: timestamp,
  dueTime: string (optional),
  completedAt: timestamp (optional),
  completed: boolean,
  urgency: 'low' | 'medium' | 'high',
  priority: number (1-5),
  category: string,
  tags: array<string>,
  recurring: {
    enabled: boolean,
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
    interval: number
  } (optional),
  parentTaskId: string (optional),
  subtasks: array<string> (optional), // array of subtask IDs
  attachments: array<{
    name: string,
    url: string,
    contentType: string,
    size: number,
    createdAt: timestamp
  }> (optional)
}
```

### Goals Collection

```
/goals/{goalId}
{
  id: string,
  title: string,
  description: string,
  userId: string, // owner
  projectId: string (optional),
  collaborators: {
    [userId]: boolean // set to true for each collaborator
  },
  createdAt: timestamp,
  updatedAt: timestamp,
  dueDate: timestamp (optional),
  completedAt: timestamp (optional),
  completed: boolean,
  type: 'fundraising' | 'purchase' | 'general',
  // For fundraising and purchase types
  target: number (optional),
  current: number (optional),
  currency: string (optional),
  // For general type
  milestones: number (optional),
  completed: number (optional),
  category: string,
  tags: array<string>,
  expenses: array<{
    id: string,
    description: string,
    amount: number,
    date: timestamp
  }> (optional)
}
```

### Savings Collection

```
/savings/{savingsId}
{
  id: string,
  userId: string, // owner
  title: string,
  description: string,
  target: number,
  current: number,
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly',
  contributionAmount: number,
  method: 'individual' | 'group',
  members: array<string>, // array of user IDs for group savings
  createdAt: timestamp,
  updatedAt: timestamp,
  contributions: array<{
    id: string,
    userId: string,
    amount: number,
    note: string,
    createdAt: timestamp
  }>,
  completed: boolean
}
```

### Reminders Collection

```
/reminders/{reminderId}
{
  id: string,
  userId: string,
  title: string,
  description: string,
  dueDate: timestamp,
  repeating: boolean,
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' (optional),
  priority: 'low' | 'medium' | 'high',
  completed: boolean,
  category: string (optional),
  relatedItemId: string (optional), // ID of related task, goal, etc.
  relatedItemType: string (optional), // 'task', 'goal', 'savings', etc.
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Invitations Collection

```
/invitations/{invitationId}
{
  id: string,
  type: 'project' | 'goal' | 'savings',
  itemId: string, // projectId, goalId, or savingsId
  itemTitle: string,
  senderId: string,
  senderName: string,
  recipientEmail: string,
  recipientId: string (optional),
  status: 'pending' | 'accepted' | 'declined',
  createdAt: timestamp
}
```

### Notifications Collection

```
/notifications/{notificationId}
{
  id: string,
  userId: string, // recipient
  title: string,
  message: string,
  type: 'task_due' | 'invitation' | 'announcement' | 'milestone_reached' | 'savings_contribution',
  itemId: string (optional), // relevant itemId (projectId, taskId, goalId, savingsId)
  itemType: string (optional), // 'project', 'task', 'goal', 'savings'
  read: boolean,
  createdAt: timestamp
}
```

## Working Offline

Firebase provides offline capabilities through its local caching. To enable this in your app:

1. For Firestore, use `enableIndexedDbPersistence` to enable offline data:
   ```typescript
   import { enableIndexedDbPersistence } from 'firebase/firestore';
   import { db } from './firebase/config';
   
   enableIndexedDbPersistence(db)
     .catch((err) => {
       if (err.code === 'failed-precondition') {
         // Multiple tabs open, persistence can only be enabled in one tab
         console.log('Persistence failed: Multiple tabs open');
       } else if (err.code === 'unimplemented') {
         // The current browser does not support persistence
         console.log('Persistence is not available in this browser');
       }
     });
   ```

2. For Authentication, you can persist the authentication state:
   ```typescript
   import { setPersistence, browserLocalPersistence } from 'firebase/auth';
   import { auth } from './firebase/config';
   
   setPersistence(auth, browserLocalPersistence);
   ```

## Firebase Initialization Best Practices

To avoid initialization errors and ensure your app works correctly:

1. Always check if Firebase is already initialized before initializing again:
   ```typescript
   import { initializeApp, getApps } from 'firebase/app';
   
   // Initialize Firebase only if it hasn't been initialized already
   let app;
   if (!getApps().length) {
     app = initializeApp(firebaseConfig);
   } else {
     app = getApps()[0]; // Use existing app if already initialized
   }
   ```

2. Log your Firebase configuration (without sensitive info) during development to verify it's correct:
   ```typescript
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
   ```

## Troubleshooting Common Firebase Issues

1. **Authentication Error - "No Firebase App '[DEFAULT]' has been created"**:
   - Ensure Firebase is initialized before using any Firebase services
   - Check that `firebase/config.ts` is imported correctly in all files that use Firebase

2. **Authentication Error - "Firebase App named '[DEFAULT]' already exists"**:
   - Use the `getApps()` check as shown above to prevent multiple initializations

3. **Firestore Permission Denied**:
   - Check your security rules to ensure they allow the operation you're trying to perform
   - Verify the user is authenticated if your rules require authentication
   - Use the Firestore Rules Playground in the Firebase Console to test your rules

4. **Authentication State Not Persisting**:
   - Ensure you've set up persistence with `setPersistence(auth, browserLocalPersistence)`

5. **Offline Data Not Working**:
   - Verify you've enabled IndexedDB persistence with `enableIndexedDbPersistence(db)`
   - Check browser console for errors related to persistence

## Recommended Firebase Extensions (Optional)

Consider adding these Firebase Extensions to enhance your app:

1. **Firebase Authentication with Google:** Already included in the setup above
2. **Send Email Verification:** For verifying user emails
3. **Firestore Scheduled Backups:** For regular backups of your database
4. **Resize Images:** For handling user-uploaded images efficiently
5. **Trigger Email:** For sending reminders and notifications to users
6. **Stripe Payments:** For implementing premium features or subscription plans

## Security Best Practices

1. Never expose your Firebase API keys in client-side code for production apps. Use environment variables.
2. Always validate user input on the server-side using Cloud Functions when possible.
3. Keep your security rules updated as your application grows.
4. Regularly audit your database and storage access patterns.
5. Set up Firebase Authentication email verification for more secure user sign-ups.
6. Use Firebase App Check to protect your backend resources from abuse.
7. Implement proper error handling in your Firebase operations to provide clear feedback to users.
