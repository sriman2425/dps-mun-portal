"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { Plus, Trash, Bell } from "lucide-react";

export default function NoticesManager() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: "", content: "", type: "info" });

  const fetchNotices = async () => {
    try {
      const snap = await getDocs(query(collection(db, "notices"), orderBy("createdAt", "desc")));
      setNotices(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    } catch (err: any) {
      console.warn("Notices admin fetch issue:", err.message);
      try {
        const { getDocsFromCache } = await import("firebase/firestore");
        const cacheSnap = await getDocsFromCache(query(collection(db, "notices"), orderBy("createdAt", "desc")));
        if (!cacheSnap.empty) setNotices(cacheSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      } catch (ce) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "notices"), {
      ...formData,
      createdAt: serverTimestamp()
    });
    setFormData({ title: "", content: "", type: "info" });
    fetchNotices();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this notice?")) {
      await deleteDoc(doc(db, "notices", id));
      fetchNotices();
    }
  };

  if (loading) return <div>Loading notices...</div>;

  return (
    <div className="glass fade-in" style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "2rem" }}>Manage Site Notices</h2>
      
      <form onSubmit={handleAdd} style={{ display: "grid", gap: "1rem", marginBottom: "3rem", padding: "1.5rem", background: "rgba(0,0,0,0.02)", borderRadius: "8px" }}>
        <input className="form-input" placeholder="Notice Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
        <textarea className="form-input" placeholder="Notice Content" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required rows={3} />
        <select className="form-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
          <option value="info">Information (Blue)</option>
          <option value="warning">Warning (Yellow)</option>
          <option value="urgent">Urgent (Red)</option>
        </select>
        <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <Plus size={18} /> Post Notice
        </button>
      </form>

      <div style={{ display: "grid", gap: "1rem" }}>
        {notices.map(n => (
          <div key={n.id} style={{ padding: "1.5rem", background: "rgba(255,255,255,0.05)", borderRadius: "12px", borderLeft: `6px solid ${n.type === 'urgent' ? '#f44336' : n.type === 'warning' ? '#ff9800' : '#2196f3'}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <h4 style={{ margin: 0 }}>{n.title}</h4>
              <button onClick={() => handleDelete(n.id)} style={{ background: "none", color: "#f44336", cursor: "pointer" }}>
                <Trash size={18} />
              </button>
            </div>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-light)" }}>{n.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
