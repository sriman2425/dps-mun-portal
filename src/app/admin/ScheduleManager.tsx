"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, deleteDoc, doc, orderBy } from "firebase/firestore";
import { Plus, Trash, Calendar as CalendarIcon, Clock } from "lucide-react";

export default function ScheduleManager() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ day: "Day 1", time: "", activity: "", location: "" });

  const fetchSchedule = async () => {
    try {
      const snap = await getDocs(query(collection(db, "schedule"), orderBy("time")));
      setSchedule(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    } catch (err: any) {
      console.warn("Schedule admin fetch issue:", err.message);
      try {
        const { getDocsFromCache } = await import("firebase/firestore");
        const cacheSnap = await getDocsFromCache(query(collection(db, "schedule"), orderBy("time")));
        if (!cacheSnap.empty) setSchedule(cacheSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      } catch (ce) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "schedule"), formData);
    setFormData({ day: "Day 1", time: "", activity: "", location: "" });
    fetchSchedule();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this event?")) {
      await deleteDoc(doc(db, "schedule", id));
      fetchSchedule();
    }
  };

  if (loading) return <div>Loading schedule...</div>;

  return (
    <div className="glass fade-in" style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "2rem" }}>Manage Event Schedule</h2>
      
      <form onSubmit={handleAdd} style={{ display: "grid", gap: "1rem", marginBottom: "3rem", padding: "1.5rem", background: "rgba(0,0,0,0.02)", borderRadius: "8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <select className="form-input" value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})}>
            <option>Day 1</option>
            <option>Day 2</option>
            <option>Day 3</option>
          </select>
          <input className="form-input" placeholder="Time (e.g. 09:00 AM)" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required />
          <input className="form-input" placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
        </div>
        <input className="form-input" placeholder="Activity (e.g. Opening Ceremony)" value={formData.activity} onChange={e => setFormData({...formData, activity: e.target.value})} required />
        <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <Plus size={18} /> Add Event
        </button>
      </form>

      <div style={{ display: "grid", gap: "1rem" }}>
        {schedule.map(item => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <div style={{ fontWeight: 800, color: "var(--primary)", minWidth: "80px" }}>{item.time}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{item.activity}</div>
                <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>{item.day} • {item.location}</div>
              </div>
            </div>
            <button onClick={() => handleDelete(item.id)} style={{ background: "none", color: "#f44336", cursor: "pointer" }}>
              <Trash size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
