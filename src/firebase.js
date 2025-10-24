// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp, updateDoc, getDocs, collectionGroup, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Your web app's Firebase configuration (env-first, fallback to defaults)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC8rR1v7mxjBWMhAjEfAA6m7rw2nzClPwI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "flexwrk-10612.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "flexwrk-10612",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "flexwrk-10612.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "456722344056",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:456722344056:web:cd5c32e8c2d3aa5ece7a77",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Export authentication functions
export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup
};

// Export Firestore functions
export {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  getDocs,
  collectionGroup,
  writeBatch
};

// Export Storage functions
export {
  ref,
  uploadBytes,
  getDownloadURL
};

console.log('🚀 Firebase initialized successfully!');
console.log('🔥 Connected to Firebase project: flexwrk-10612');
