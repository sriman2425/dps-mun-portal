"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Search } from "lucide-react";

export default function Allocations() {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAllocations();
  }, []);

  const fetchAllocations = async () => {
    const q = query(collection(db, "registrations"), where("is_allocated", "==", true));
    const snapshot = await getDocs(q);
    setAllocations(snapshot.docs.map(d => d.data()));
    setLoading(false);
  };

  const filtered = allocations.filter(a => 
    a.name?.toLowerCase().includes(search.toLowerCase()) || 
    a.allocated_country?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: "4rem 0" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{ fontSize: "3rem" }}>Public Allocations</h1>
        <p style={{ color: "var(--text-light)" }}>Official list of delegate assignments.</p>
        <div style={{ width: "60px", height: "4px", background: "var(--secondary)", margin: "1rem auto" }}></div>
      </div>

      <div className="glass" style={{ padding: "2rem", marginBottom: "3rem" }}>
        <div style={{ position: "relative" }}>
          <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} size={20} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search by name or country..." 
            style={{ paddingLeft: "3rem" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center" }}>Loading allocations...</div>
      ) : (
        <div className="glass" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee", backgroundColor: "rgba(26, 35, 126, 0.05)" }}>
                <th style={{ padding: "1.5rem" }}>Delegate Name</th>
                <th style={{ padding: "1.5rem" }}>Committee</th>
                <th style={{ padding: "1.5rem" }}>Country</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f9f9f9" }}>
                  <td style={{ padding: "1.2rem" }}>{a.name || "Anonymous"}</td>
                  <td style={{ padding: "1.2rem" }}>{a.allocated_committee}</td>
                  <td style={{ padding: "1.2rem", fontWeight: 700, color: "var(--primary)" }}>{a.allocated_country}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: "3rem", textAlign: "center", color: "var(--text-light)" }}>
                    No allocations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
