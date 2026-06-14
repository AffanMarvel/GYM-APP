// ============================================================
// FIREBASE CONFIGURATION
// ============================================================
// To set up Firebase:
// 1. Go to https://console.firebase.google.com
// 2. Click "Add project" → name it (e.g. "gym-tracker")
// 3. Disable Google Analytics → Create project
// 4. Click "Web" icon (</>), register the app
// 5. Copy the firebaseConfig object values below
// 6. In Firebase Console:
//    - Go to Authentication → Sign-in method → Enable "Email/Password"
//    - Go to Firestore Database → Create database → Start in production mode
//      → Choose a region (e.g. asia-south1 for India)
//    - Go to Firestore → Rules → Paste this rule and Publish:
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /users/{userId}/{document=**} {
//          allow read, write: if request.auth != null && request.auth.uid == userId;
//        }
//      }
//    }
// ============================================================

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⬇️  PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyBj-JyX-GS3y5WzDp--CzAwopUeTcM3k_U",
  authDomain: "gym-tracker-baecc.firebaseapp.com",
  projectId: "gym-tracker-baecc",
  storageBucket: "gym-tracker-baecc.firebasestorage.app",
  messagingSenderId: "1065135937763",
  appId: "1:1065135937763:web:88c0130ff733b40e478dd6",
  measurementId: "G-CS5PWZRLSG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
