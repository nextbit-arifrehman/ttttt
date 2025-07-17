import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import apiClient from "../lib/api";

const AuthContext = createContext({
  user: null,
  loading: true
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Store the token in localStorage for API requests
          localStorage.setItem('token', idToken);
          
          // Create user object with Firebase data and default role
          const userWithDefaults = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            photoURL: firebaseUser.photoURL,
            role: "user",
            verified: false,
            isFraud: false
          };
          
          // Check if user data exists in localStorage first
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
              console.log("✅ User loaded from localStorage");
            } catch (e) {
              console.warn("Invalid user data in localStorage, using Firebase data");
              setUser(userWithDefaults);
            }
          } else {
            // Set user immediately for better UX
            setUser(userWithDefaults);
            localStorage.setItem('user', JSON.stringify(userWithDefaults));
          }
          
          // Try to sync with backend in the background
          try {
            const loginResponse = await apiClient.post("/auth/login", {
              idToken: idToken
            });
            
            if (loginResponse.status === 200) {
              const { user: dbUser } = loginResponse.data;
              const mergedUser = { ...userWithDefaults, ...dbUser };
              localStorage.setItem('user', JSON.stringify(mergedUser));
              setUser(mergedUser);
              console.log("✅ User synced with MongoDB backend");
            }
          } catch (loginError) {
            console.log("Backend sync failed, using Firebase user data");
            // User data already set above, no need to retry
          }
        } catch (error) {
          console.error("Error processing user authentication:", error);
          // Create fallback user data
          const fallbackUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            photoURL: firebaseUser.photoURL,
            role: "user",
            verified: false,
            isFraud: false
          };
          setUser(fallbackUser);
          localStorage.setItem('user', JSON.stringify(fallbackUser));
        }
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log("User signed out");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};