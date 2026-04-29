"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Shield, Users, Info, Scale, Globe, Target } from "lucide-react";
import Image from "next/image";

export default function Committees() {
  const [committees, setCommittees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback icon mapper
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Shield": return <Shield size={32} />;
      case "Scale": return <Scale size={32} />;
      case "Users": return <Users size={32} />;
      case "Info": return <Info size={32} />;
      default: return <Globe size={32} />;
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // Safety timeout in case Firebase gets blocked by adblockers and hangs
    const timeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 5000);

    const fetchCommittees = async () => {
      try {
        const snap = await getDocs(collection(db, "committees"));
        if (!isMounted) return;
        
        const fetched = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        fetched.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setCommittees(fetched);
      } catch (err: any) {
        console.warn("Committees fetch issue:", err.message);
        try {
          const { getDocsFromCache } = await import("firebase/firestore");
          const cacheSnap = await getDocsFromCache(collection(db, "committees"));
          if (isMounted && !cacheSnap.empty) {
             const cached = cacheSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
             cached.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
             setCommittees(cached);
          }
        } catch (ce) {}
      } finally {
        if (isMounted) {
          setLoading(false);
          clearTimeout(timeout);
        }
      }
    };

    fetchCommittees();
    
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="container" style={{ padding: "4rem 0" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>The Committees</h1>
        <p style={{ color: "var(--text-light)", fontSize: "1.2rem", maxWidth: "700px", margin: "0 auto" }}>
          Explore the diverse agendas and specialized forums for DPSA MUN Season 2.
        </p>
        <div style={{ width: "80px", height: "4px", background: "var(--secondary)", margin: "1.5rem auto" }}></div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "var(--text-light)", padding: "4rem" }}>Loading committees...</div>
      ) : committees.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "rgba(255,255,255,0.03)", borderRadius: "24px", border: "1px dashed rgba(0,0,0,0.1)" }}>
          <h2 style={{ color: "var(--primary)", marginBottom: "1rem" }}>To Be Revealed Soon ✨</h2>
          <p style={{ color: "var(--text-light)", maxWidth: "500px", margin: "0 auto" }}>
            The official committees and agendas are currently being finalized by the Secretariat. Stay tuned for the big reveal!
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "2.5rem" }}>
          {committees.map((c, i) => (
            <div 
              key={c.id} 
              className="glass fade-in" 
              style={{ 
                padding: "0", 
                overflow: "hidden", 
                borderRadius: "20px",
                borderTop: `6px solid ${c.color || "var(--primary)"}`,
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-8px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              {c.imageUrl && (
                <div style={{ position: "relative", width: "100%", height: "240px" }}>
                  <img src={c.imageUrl} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.7))", padding: "2rem 1.5rem 1rem", color: "white" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Target size={16} color={c.color || "white"} />
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Season 2 Official</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div style={{ padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                   <h2 style={{ fontSize: "1.5rem", margin: 0, color: "var(--primary)", flex: 1 }}>{c.name}</h2>
                   <div style={{ color: c.color || "var(--primary)", opacity: 0.6 }}>{getIcon(c.icon)}</div>
                </div>
                
                <p style={{ marginBottom: "2rem", color: "var(--text-light)", lineHeight: 1.7, fontSize: "0.95rem" }}>{c.desc}</p>
                
                <div style={{ padding: "1.5rem", backgroundColor: `${c.color || "var(--primary)"}08`, borderRadius: "12px", border: `1px solid ${c.color || "var(--primary)"}20`, marginBottom: "1.5rem" }}>
                  <h4 style={{ color: c.color || "var(--secondary)", marginBottom: "0.75rem", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "1px", fontWeight: 800 }}>Agenda</h4>
                  <p style={{ fontWeight: 600, fontSize: "1.1rem", lineHeight: 1.4 }}>{c.agenda}</p>
                </div>

                {c.showGuide && c.guideUrl && (
                  <a 
                    href={c.guideUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn-primary" 
                    style={{ 
                      width: "100%", 
                      textAlign: "center", 
                      padding: "0.8rem", 
                      fontSize: "0.9rem",
                      background: c.color || "#1b5e20",
                      borderColor: c.color || "#1b5e20",
                      display: "block"
                    }}
                  >
                    Download Background Guide
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
