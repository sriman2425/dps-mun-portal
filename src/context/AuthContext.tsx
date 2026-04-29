"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type UserRole = "participant" | "admin" | "secretariat" | null;

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  // Admin emails that automatically get admin role
  const ADMIN_EMAILS = [
    "secgendps@dpsmun.in",
    "tathagat.banerjee2009@gmail.com"
  ];

  useEffect(() => {
    // Safety timeout to prevent infinite loading screen
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const email = user.email?.toLowerCase() || "";

        // Check if this is a known admin email
        if (ADMIN_EMAILS.includes(email) || email.endsWith("@dpsmun.in") || email.endsWith("@dpsamun.com")) {
          setRole("admin");

          // Ensure the Firestore doc also reflects admin role
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists() || userDoc.data().role !== "admin") {
              await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email,
                role: "admin",
                name: user.displayName || email.split("@")[0],
                status: "approved",
              }, { merge: true });
            }
          } catch (e: any) { 
            console.warn("Admin role sync issue (offline?):", e.message);
            // SILENT CACHE FALLBACK
            try {
              const { getDocFromCache } = await import("firebase/firestore");
              const cacheDoc = await getDocFromCache(doc(db, "users", user.uid));
              if (cacheDoc.exists() && cacheDoc.data().role === "admin") setRole("admin");
            } catch (ce) {}
          }
        } else {
          // Regular user — fetch role from Firestore
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              setRole(userDoc.data().role as UserRole);
            } else {
              setRole("participant");
            }
          } catch (e: any) { 
            console.warn("Role fetch issue (offline?):", e.message);
            // SILENT CACHE FALLBACK
            try {
              const { getDocFromCache } = await import("firebase/firestore");
              const cacheDoc = await getDocFromCache(doc(db, "users", user.uid));
              if (cacheDoc.exists()) setRole(cacheDoc.data().role as UserRole);
              else setRole("participant");
            } catch (ce) {
              setRole("participant"); // Ultimate fallback
            }
          }
        }
      } else {
        setRole(null);
      }
      setLoading(false);
      clearTimeout(timeout);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
