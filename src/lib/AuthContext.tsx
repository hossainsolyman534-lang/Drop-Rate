import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signInAnonymously } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userData: any | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, userData: null });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          // Create user doc if it doesn't exist
          const newData = {
            email: user.email || "anonymous",
            isAnonymous: user.isAnonymous,
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, "users", user.uid), newData);
          setUserData(newData);
        }
        setLoading(false);
      } else {
        // Sign in anonymously if no user
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Anonymous auth failed:", error);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, userData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
