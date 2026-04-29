"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Settings, Lock, Unlock } from "lucide-react";

export default function ConfigManager() {
  const [isRegOpen, setIsRegOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, "config", "registration");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsRegOpen(docSnap.data().open);
        }
      } catch (error: any) {
        console.warn("Config fetch issue (offline?):", error.message);
        try {
          const { getDocFromCache } = await import("firebase/firestore");
          const cacheSnap = await getDocFromCache(doc(db, "config", "registration"));
          if (cacheSnap.exists()) setIsRegOpen(cacheSnap.data().open);
        } catch (ce) {}
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const toggleRegistration = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "config", "registration"), {
        open: !isRegOpen,
        updatedAt: new Date().toISOString()
      });
      setIsRegOpen(!isRegOpen);
    } catch (error) {
      console.error("Error updating config:", error);
      alert("Failed to update settings.");
    }
    setSaving(false);
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="glass fade-in" style={{ padding: "2.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <Settings style={{ color: "var(--primary)" }} />
        <h2 style={{ margin: 0 }}>System Settings</h2>
      </div>

      <div className="glass" style={{ padding: "2rem", background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: "0 0 0.5rem 0" }}>Delegate Registration</h3>
            <p style={{ margin: 0, color: "var(--text-light)", fontSize: "0.95rem" }}>
              Control whether new delegates can register for the conference.
            </p>
          </div>
          
          <button 
            onClick={toggleRegistration}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.3s ease",
              background: isRegOpen ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: isRegOpen ? "#10b981" : "#ef4444"
            }}
          >
            {isRegOpen ? (
              <><Unlock size={18} /> Registrations Open</>
            ) : (
              <><Lock size={18} /> Registrations Closed</>
            )}
          </button>
        </div>
      </div>

      <div style={{ marginTop: "2rem", color: "var(--text-light)", fontSize: "0.85rem", fontStyle: "italic" }}>
        Note: Closing registrations will hide the Register button from the website navigation and block the registration page.
      </div>
    </div>
  );
}
