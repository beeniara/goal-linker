
# Firebase Setup Guide for Project Linker

This guide will help you set up the Firebase services needed for the Project Linker app.

## Prerequisites

1. Node.js and npm installed
2. Firebase CLI installed (`npm install -g firebase-tools`)
3. A Google account

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "Project Linker")
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
    // Users can read and write their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
    
    // Projects rules
    match /projects/{projectId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || resource.data.collaborators[request.auth.uid] == true);
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Tasks rules
    match /tasks/{taskId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || resource.data.collaborators[request.auth.uid] == true);
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Goals rules
    match /goals/{goalId} {
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || resource.data.collaborators[request.auth.uid] == true);
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
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

## Step 9: Deploy Your App to Firebase Hosting (Optional)

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

Here's a recommended Firestore schema for your Project Linker app:

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

### Invitations Collection

```
/invitations/{invitationId}
{
  id: string,
  type: 'project' | 'goal',
  itemId: string, // projectId or goalId
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
  type: 'task_due' | 'invitation' | 'announcement' | 'milestone_reached',
  itemId: string (optional), // relevant itemId (projectId, taskId, goalId)
  read: boolean,
  createdAt: timestamp
}
```

## Working Offline

Firebase provides offline capabilities through its local caching. To enable this in your app:

1. For Firestore, this is enabled by default for web apps
2. For Authentication, you can persist the authentication state:
   ```typescript
   import { setPersistence, browserLocalPersistence } from 'firebase/auth';
   import { auth } from './firebase/config';
   
   setPersistence(auth, browserLocalPersistence);
   ```

## Recommended Firebase Extensions (Optional)

Consider adding these Firebase Extensions to enhance your app:

1. **Firebase Authentication with Google:** Already included in the setup above
2. **Send Email Verification:** For verifying user emails
3. **Firestore Scheduled Backups:** For regular backups of your database
4. **Resize Images:** For handling user-uploaded images efficiently

## Security Best Practices

1. Never expose your Firebase API keys in client-side code for production apps. Use environment variables.
2. Always validate user input on the server-side.
3. Keep your security rules updated as your application grows.
4. Regularly audit your database and storage access patterns.
5. Set up Firebase Authentication email verification for more secure user sign-ups.
