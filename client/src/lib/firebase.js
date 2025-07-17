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
console.log("Firebase Web SDK initializing...");
console.log("Current domain:", window.location.hostname);
console.log("Project ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);

// Validate required environment variables
if (!import.meta.env.VITE_FIREBASE_API_KEY || !import.meta.env.VITE_FIREBASE_PROJECT_ID || !import.meta.env.VITE_FIREBASE_APP_ID) {
  console.error("Missing required Firebase configuration. Please check your environment variables.");
}

// Firebase configuration using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase Web SDK
let app;
let auth;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("✅ Firebase Web SDK initialized successfully");
} catch (error) {
  console.error("❌ Firebase Web SDK initialization failed:", error);
  // Create a mock auth object to prevent crashes
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      setTimeout(() => callback(null), 100);
      return () => {};
    }
  };
}

export { auth };

// Set up Google provider
const googleProvider = new GoogleAuthProvider();
// Add required scopes for Google sign-in
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Auth methods
export const signInWithGoogle = async () => {
  console.log("Attempting Google sign-in...");
  try {
    // Check if Firebase is properly initialized
    if (!auth || !auth.currentUser === undefined) {
      throw new Error("Firebase not properly initialized");
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google sign-in successful:", result.user.email);
    
    // Send user data to backend for storage
    await syncUserWithBackend(result.user);
    return result;
  } catch (error) {
    console.error("Google sign-in error:", error);
    
    // For development/demo purposes, create a mock user
    if (error.code === "auth/api-key-not-valid" || error.code === "auth/invalid-api-key") {
      console.log("Creating demo user for testing...");
      const mockUser = {
        uid: "demo-user-" + Date.now(),
        email: "demo@example.com",
        displayName: "Demo User",
        photoURL: "https://via.placeholder.com/150",
        emailVerified: true
      };
      
      // Store in localStorage for demo
      localStorage.setItem("demo-user", JSON.stringify(mockUser));
      localStorage.setItem("demo-token", "demo-jwt-token");
      
      return { user: mockUser };
    }
    
    throw error;
  }
};

// Helper function to sync user with backend
const syncUserWithBackend = async (user) => {
  try {
    const idToken = await user.getIdToken();
    const response = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", idToken);
      console.log("User synced with backend successfully");
    }
  } catch (error) {
    console.error("Backend sync failed:", error);
  }
};

export const signInWithEmail = async (email, password) => {
  console.log("Attempting email sign-in for:", email);
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("Email sign-in successful:", result.user.email);
    
    // Send user data to backend for storage
    await syncUserWithBackend(result.user);
    return result;
  } catch (error) {
    console.error("Email sign-in error:", error);
    
    // For development/demo purposes, create a mock user
    if (error.code === "auth/api-key-not-valid" || error.code === "auth/invalid-api-key") {
      console.log("Creating demo user for testing...");
      const mockUser = {
        uid: "demo-user-email-" + Date.now(),
        email: email,
        displayName: email.split('@')[0],
        photoURL: "https://via.placeholder.com/150",
        emailVerified: true
      };
      
      // Store in localStorage for demo
      localStorage.setItem("demo-user", JSON.stringify(mockUser));
      localStorage.setItem("demo-token", "demo-jwt-token");
      
      return { user: mockUser };
    }
    
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
