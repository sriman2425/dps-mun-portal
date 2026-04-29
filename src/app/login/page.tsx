"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Direct redirect based on email domain or known admin emails first for speed
      const isAdminEmail = user.email?.toLowerCase().endsWith("@dpsmun.in") || 
                           user.email?.toLowerCase().endsWith("@dpsamun.com") ||
                           user.email?.toLowerCase() === "tathagat.banerjee2009@gmail.com";

      if (isAdminEmail) {
        router.push("/admin");
      } else {
        // For others, try a quick role check but don't hang forever
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && (userDoc.data().role === "admin" || userDoc.data().role === "secretariat")) {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        } catch (err) {
          // If Firestore fails, default to dashboard (safe for participants)
          router.push("/dashboard");
        }
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "8rem 0" }}>
      <div className="glass" style={{ maxWidth: "400px", margin: "0 auto", padding: "3rem" }}>
        <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="dpssecgen@dpsmun.in" 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.9rem", color: "var(--text-light)" }}>
          Don't have an account? <Link href="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
