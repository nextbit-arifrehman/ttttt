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
            ...firebaseUser,
            role: "user",
            verified: false,
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          };
          
          // Set user immediately for better UX
          setUser(userWithDefaults);
          
          // Try to sync with backend in the background
          try {
            // First try login since user might already exist
            const loginResponse = await apiClient.post("/auth/login", {
              email: firebaseUser.email,
              idToken: idToken,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL
            });
            
            if (loginResponse.status === 200) {
              const { user: dbUser, token } = loginResponse.data;
              localStorage.setItem('backendToken', token);
              setUser({ ...firebaseUser, ...dbUser });
              console.log("Successfully synced with MongoDB backend (existing user)");
            }
          } catch (loginError) {
            // If login fails, try registration
            try {
              const response = await apiClient.post("/auth/register", {
                email: firebaseUser.email,
                idToken: idToken,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: "user"
              });
              
              if (response.status === 201 || response.status === 200) {
                const { user: dbUser, token } = response.data;
                localStorage.setItem('backendToken', token);
                setUser({ ...firebaseUser, ...dbUser });
                console.log("Successfully registered new user in MongoDB backend");
              }
            } catch (syncError) {
              console.warn("Backend sync failed, using Firebase user data:", syncError.message);
              // Continue with Firebase user data - backend is optional
            }
          }
        } catch (error) {
          console.error("Error processing user authentication:", error);
          setUser(null);
        }
      } else {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('backendToken');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
