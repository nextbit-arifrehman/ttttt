import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";

// Debug: log env variables to verify they are loading
// Firebase configuration is ready
console.log("Firebase initialized successfully");
console.log("Current domain:", window.location.hostname);

// Validate required environment variables
if (!import.meta.env.VITE_FIREBASE_API_KEY || !import.meta.env.VITE_FIREBASE_PROJECT_ID || !import.meta.env.VITE_FIREBASE_APP_ID) {
  console.error("Missing required Firebase configuration. Please check your environment variables.");
}

// Firebase configuration using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`, // fixed bucket domain
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set up Google provider
const googleProvider = new GoogleAuthProvider();
// Add required scopes for Google sign-in
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Auth methods
export const signInWithGoogle = async () => {
  console.log("Attempting Google sign-in...");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google sign-in successful:", result.user.email);
    return result;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  console.log("Attempting email sign-in for:", email);
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("Email sign-in successful:", result.user.email);
    return result;
  } catch (error) {
    console.error("Email sign-in error:", error);
    throw error;
  }
};

export const registerWithEmail = async (email, password) => {
  console.log("Attempting email registration for:", email);
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Email registration successful:", result.user.email);
    return result;
  } catch (error) {
    console.error("Email registration error:", error);
    throw error;
  }
};

export const updateUserProfile = (user, profile) => {
  console.log("Updating user profile for:", user.email);
  return updateProfile(user, profile);
};

export const logout = () => {
  console.log("Logging out user...");
  localStorage.removeItem('token');
  return signOut(auth);
};
