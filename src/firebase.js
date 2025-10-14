
// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCP5X8kfMiOIMnx3riZfLplkaFvTGKvA80",
  authDomain: "flexwrk-10612.firebaseapp.com",
  projectId: "flexwrk-10612",
  storageBucket: "flexwrk-10612.firebasestorage.app",
  messagingSenderId: "90745104339",
  appId: "1:90745104339:web:f2fba2b90183f21618f126",
  measurementId: "G-V85810RW83"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you'll need
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app, 'gs://flexwrk-10612.firebasestorage.app');
