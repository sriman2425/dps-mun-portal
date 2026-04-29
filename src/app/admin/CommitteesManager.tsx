"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Trash, Save, HelpCircle, ImageIcon, Type, AlignLeft, List, Settings } from "lucide-react";

export default function CommitteesManager() {
  const [committees, setCommittees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    desc: "", 
    agenda: "", 
    icon: "Users",
    imageUrl: "",
    showGuide: false,
    guideUrl: "",
    color: "#1b5e20"
  });

  const fetchCommittees = async () => {
    try {
      const snap = await getDocs(query(collection(db, "committees")));
      setCommittees(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    } catch (err: any) {
      console.warn("Committees admin fetch issue:", err.message);
      try {
        const { getDocsFromCache } = await import("firebase/firestore");
        const cacheSnap = await getDocsFromCache(query(collection(db, "committees")));
        if (!cacheSnap.empty) setCommittees(cacheSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      } catch (ce) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommittees();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    setUploading(true);
    let finalImageUrl = formData.imageUrl;

    if (file) {
      try {
        const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
        const { storage } = await import("@/lib/firebase");
        const fileRef = ref(storage, `committees/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        finalImageUrl = await getDownloadURL(fileRef);
      } catch (err) {
        console.error("Upload failed", err);
      }
    }

    await addDoc(collection(db, "committees"), { ...formData, imageUrl: finalImageUrl });
    setFormData({ 
      name: "", 
      desc: "", 
      agenda: "", 
      icon: "Users", 
      imageUrl: "", 
      showGuide: false, 
      guideUrl: "", 
      color: "#1b5e20" 
    });
    setFile(null);
    setUploading(false);
    fetchCommittees();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this committee?")) {
      await deleteDoc(doc(db, "committees", id));
      fetchCommittees();
    }
  };

  if (loading) return <div>Loading committees...</div>;

  return (
    <div className="glass fade-in" style={{ padding: "0", overflow: "hidden", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)" }}>
      <div style={{ padding: "2rem", borderBottom: "1px solid rgba(0,0,0,0.05)", background: "white" }}>
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Committee Details</h2>
      </div>
      
      <div style={{ padding: "2rem", background: "white" }}>
        <form onSubmit={handleAdd} style={{ display: "grid", gap: "1.5rem" }}>
          <div>
            <input 
              className="form-input" 
              placeholder="Name" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              style={{ background: "#f5f5f5", border: "1px solid #e0e0e0" }}
              required 
            />
          </div>

          <div>
            <textarea 
              className="form-input" 
              placeholder="Description" 
              value={formData.desc} 
              onChange={e => setFormData({...formData, desc: e.target.value})} 
              rows={4}
              style={{ background: "#f5f5f5", border: "1px solid #e0e0e0" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#333", display: "block", marginBottom: "0.5rem" }}>Agenda Topics</label>
            <input 
              className="form-input" 
              placeholder="Add topics separated by commas" 
              value={formData.agenda} 
              onChange={e => setFormData({...formData, agenda: e.target.value})} 
              style={{ background: "#f5f5f5", border: "1px solid #e0e0e0" }}
            />
            <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.4rem" }}>Separate topics with commas. Example: Topic 1, Topic 2</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
             <div>
                <input 
                  className="form-input" 
                  placeholder="Icon Name (e.g. Users)" 
                  value={formData.icon} 
                  onChange={e => setFormData({...formData, icon: e.target.value})} 
                  style={{ background: "#f5f5f5", border: "1px solid #e0e0e0" }}
                />
             </div>
             <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <HelpCircle size={20} color="#888" />
             </div>
          </div>

          <div>
            <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#333", display: "block", marginBottom: "0.5rem" }}>Committee Photo</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input 
                type="file" 
                className="form-input" 
                onChange={e => setFile(e.target.files?.[0] || null)}
                style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", padding: "0.5rem" }}
              />
              {file && <span style={{ fontSize: "0.8rem", color: "var(--primary)" }}>Selected: {file.name}</span>}
            </div>
            <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.4rem" }}>Or provide a direct image URL below if preferred</p>
            <input 
              className="form-input" 
              placeholder="Image URL (optional if file selected)" 
              value={formData.imageUrl} 
              onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
              style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", marginTop: "0.5rem" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input 
              type="checkbox" 
              id="showGuide" 
              checked={formData.showGuide} 
              onChange={e => setFormData({...formData, showGuide: e.target.checked})} 
            />
            <label htmlFor="showGuide" style={{ fontSize: "0.9rem" }}>Show Background Guide Button</label>
          </div>

          <div>
            <input 
              className="form-input" 
              placeholder="Background Guide URL (PDF, Google Drive, etc.)" 
              value={formData.guideUrl} 
              onChange={e => setFormData({...formData, guideUrl: e.target.value})} 
              style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", opacity: formData.showGuide ? 1 : 0.5 }}
              disabled={!formData.showGuide}
            />
          </div>

          <div>
            <button type="submit" disabled={uploading} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.8rem 2rem", background: "#1b5e20", borderColor: "#1b5e20", width: "fit-content", borderRadius: "6px", opacity: uploading ? 0.7 : 1 }}>
              <Save size={18} /> {uploading ? "Uploading..." : "Create"}
            </button>
          </div>
        </form>
      </div>

      <div style={{ padding: "2rem", background: "#f9f9f9", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        <h3 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>Existing Committees</h3>
        <div style={{ display: "grid", gap: "1rem" }}>
          {committees.map(c => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", background: "white", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "4px", background: "#1b5e20", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                  <Type size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 600 }}>{c.name}</h4>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#888" }}>{c.icon}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(c.id)} style={{ background: "none", color: "#f44336", cursor: "pointer", border: "none" }}>
                <Trash size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
