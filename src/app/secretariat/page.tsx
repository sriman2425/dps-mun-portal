"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Users } from "lucide-react";
import Image from "next/image";

export default function Secretariat() {
  const [secretariat, setSecretariat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Safety timeout in case Firebase gets blocked by adblockers and hangs
    const timeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 5000);

    const fetchSecretariat = async () => {
      try {
        // Force a timeout-protected fetch
        const snap = await getDocs(collection(db, "secretariat"));
        if (!isMounted) return;
        
        const fetched = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        fetched.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
        setSecretariat(fetched);
      } catch (error: any) {
        // Silently handle offline/firewall errors to prevent overlay
        console.warn("Secretariat fetch issue (likely offline/firewall):", error.message);
        
        // Try to fetch from cache as a fallback
        try {
          const { getDocsFromCache } = await import("firebase/firestore");
          const cacheSnap = await getDocsFromCache(collection(db, "secretariat"));
          if (isMounted && !cacheSnap.empty) {
            const cached = cacheSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
            cached.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
            setSecretariat(cached);
          }
        } catch (cacheErr) {
          // Both network and cache failed - show 'To Be Revealed'
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          clearTimeout(timeout);
        }
      }
    };
    
    fetchSecretariat();
    
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="container" style={{ padding: "4rem 0" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{ fontSize: "3rem" }}>The Secretariat</h1>
        <p style={{ color: "var(--text-light)", maxWidth: "700px", margin: "1rem auto" }}>
          Meet the leadership team behind DPSA MUN Season 2.
        </p>
        <div style={{ width: "60px", height: "4px", background: "var(--secondary)", margin: "1rem auto" }}></div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "var(--text-light)" }}>Loading...</div>
      ) : secretariat.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "rgba(255,255,255,0.03)", borderRadius: "16px" }}>
          <h2 style={{ color: "var(--primary)", marginBottom: "1rem" }}>To Be Revealed Soon ✨</h2>
          <p style={{ color: "var(--text-light)", maxWidth: "500px", margin: "0 auto" }}>
            The official Secretariat for Season 2 is currently being finalized. Stay tuned!
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "2rem" }}>
          {secretariat.map((member) => (
            <div
              key={member.id}
              className="glass fade-in"
              style={{
                padding: "2.5rem",
                borderTop: `5px solid ${member.color || "var(--primary)"}`,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              {member.imageUrl ? (
                <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", borderRadius: "12px", overflow: "hidden", marginBottom: "1.5rem" }}>
                  <Image src={member.imageUrl} alt={member.name} fill style={{ objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: `${member.color || "var(--primary)"}15`, display: "flex", alignItems: "center", justifyContent: "center", color: member.color || "var(--primary)", marginBottom: "1.5rem" }}>
                  <Users size={36} />
                </div>
              )}

              <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1.5px", color: member.color || "var(--primary)", marginBottom: "0.5rem" }}>
                {member.title}
              </h3>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{member.name}</h2>
              
              {member.tagline && (
                <p style={{ fontSize: "0.9rem", color: "var(--secondary)", fontWeight: 600, marginBottom: "1rem" }}>
                  {member.tagline}
                </p>
              )}

              <p style={{ color: "var(--text-light)", lineHeight: 1.7, fontSize: "0.95rem" }}>
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
