"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Navbar() {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isRegOpen, setIsRegOpen] = useState(true);

  const handleLogout = () => signOut(auth);

  useEffect(() => {
    const checkRegStatus = async () => {
      try {
        const docSnap = await getDoc(doc(db, "config", "registration"));
        if (docSnap.exists()) {
          setIsRegOpen(docSnap.data().open);
        }
      } catch (error: any) {
        // Silently handle offline/firewall errors
        console.warn("Navbar reg status fetch issue:", error.message);
        try {
          const { getDocFromCache } = await import("firebase/firestore");
          const cacheSnap = await getDocFromCache(doc(db, "config", "registration"));
          if (cacheSnap.exists()) setIsRegOpen(cacheSnap.data().open);
        } catch (ce) {}
      }
    };
    checkRegStatus();
  }, []);

  return (
    <nav className="glass" style={{ position: "sticky", top: 0, zIndex: 1000, margin: "1rem", padding: "0.5rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>
          <Image src="/logo.png" alt="DPSA MUN Logo" width={40} height={40} style={{ objectFit: "contain" }} />
          <span>DPSA <span style={{ color: "var(--secondary)" }}>MUN</span></span>
        </Link>

        {/* Desktop Menu */}
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }} className="desktop-menu">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/committees">Committees</Link>
          <Link href="/secretariat">Secretariat</Link>
          <Link href="/allocations">Allocations</Link>
          <Link href="/notifications">Notifications</Link>
          
          {user ? (
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <Link href={(role === "admin" || role === "secretariat") ? "/admin" : "/dashboard"} className="btn-primary" style={{ padding: "0.5rem 1rem" }}>
                Dashboard
              </Link>
              <button onClick={handleLogout} style={{ background: "none", color: "var(--secondary)", fontWeight: 600 }}>Logout</button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "1rem" }}>
              <Link href="/login" className="btn-secondary" style={{ padding: "0.5rem 1rem" }}>Login</Link>
              {isRegOpen && (
                <Link href="/register" className="btn-primary" style={{ padding: "0.5rem 1rem" }}>Register</Link>
              )}
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="mobile-toggle" style={{ display: "none", background: "none" }}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
