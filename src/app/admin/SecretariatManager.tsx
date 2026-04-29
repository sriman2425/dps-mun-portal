"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, deleteDoc, doc, orderBy } from "firebase/firestore";
import { Plus, Trash, Image as ImageIcon } from "lucide-react";

export default function SecretariatManager() {
  const [secretariat, setSecretariat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ 
    title: "", 
    name: "", 
    tagline: "", 
    bio: "", 
    imageUrl: "", 
    color: "#1a237e",
    order: 0
  });

  const fetchSecretariat = async () => {
    try {
      const snap = await getDocs(query(collection(db, "secretariat"), orderBy("order")));
      setSecretariat(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    } catch (err: any) {
      console.warn("Secretariat admin fetch issue:", err.message);
      try {
        const { getDocsFromCache } = await import("firebase/firestore");
        const cacheSnap = await getDocsFromCache(query(collection(db, "secretariat"), orderBy("order")));
        if (!cacheSnap.empty) setSecretariat(cacheSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      } catch (ce) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecretariat();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.name) return;

    setUploading(true);
    let finalImageUrl = formData.imageUrl;

    if (file) {
      try {
        const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
        const { storage } = await import("@/lib/firebase");
        const fileRef = ref(storage, `secretariat/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        finalImageUrl = await getDownloadURL(fileRef);
      } catch (err) {
        console.error("Upload failed", err);
      }
    }

    await addDoc(collection(db, "secretariat"), {
      ...formData,
      imageUrl: finalImageUrl,
      order: Number(formData.order)
    });

    setFormData({ title: "", name: "", tagline: "", bio: "", imageUrl: "", color: "#1a237e", order: 0 });
    setFile(null);
    setUploading(false);
    fetchSecretariat();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this member?")) {
      await deleteDoc(doc(db, "secretariat", id));
      fetchSecretariat();
    }
  };

  if (loading) return <div>Loading secretariat...</div>;

  return (
    <div className="glass fade-in" style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "2rem" }}>Manage Secretariat</h2>
      
      <form onSubmit={handleAdd} style={{ display: "grid", gap: "1rem", marginBottom: "3rem", padding: "1.5rem", background: "rgba(0,0,0,0.02)", borderRadius: "8px" }}>
        <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Plus size={20} /> Add New Secretariat Member</h4>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <input className="form-input" placeholder="Title (e.g. Secretary General)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          <input className="form-input" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        </div>

        <div style={{ background: "rgba(0,0,0,0.03)", padding: "1.5rem", borderRadius: "8px", border: "1px dashed rgba(0,0,0,0.1)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", fontWeight: 600, fontSize: "0.9rem" }}>
            <ImageIcon size={18} /> Profile Photo
          </label>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <input 
              type="file" 
              className="form-input" 
              onChange={e => setFile(e.target.files?.[0] || null)}
              style={{ background: "white", padding: "0.5rem" }}
            />
          </div>
          <p style={{ margin: "0.5rem 0", fontSize: "0.75rem", color: "var(--text-light)" }}>Or provide a direct image URL below if you already have one hosted</p>
          <input 
            className="form-input" 
            placeholder="Image URL (e.g. /secgen-tathagat.jpg)" 
            value={formData.imageUrl} 
            onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
            style={{ background: "white" }}
          />
        </div>

        <input className="form-input" placeholder="Tagline (e.g. Leader. Performer.)" value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} />
        <textarea className="form-input" placeholder="Bio / Description" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} rows={4} required />
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Theme Color</label>
            <input type="color" className="form-input" style={{ height: "45px", padding: "4px" }} value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Display Order (lowest first)</label>
            <input type="number" className="form-input" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
          </div>
        </div>

        <button type="submit" disabled={uploading} className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "1rem", opacity: uploading ? 0.7 : 1 }}>
          <Plus size={18} /> {uploading ? "Uploading Member..." : "Add Member"}
        </button>
      </form>

      <div style={{ display: "grid", gap: "1rem" }}>
        {secretariat.length === 0 && <p>No members found in database. Add some above!</p>}
        {secretariat.map(member => (
          <div key={member.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem", background: "rgba(255,255,255,0.05)", borderRadius: "12px", borderLeft: `6px solid ${member.color || "#ccc"}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              {member.imageUrl && (
                <div style={{ width: "50px", height: "50px", borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(0,0,0,0.05)" }}>
                  <img src={member.imageUrl} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div>
                <h4 style={{ margin: 0, color: member.color, fontSize: "1rem" }}>{member.title}</h4>
                <p style={{ margin: "0.1rem 0", fontWeight: "bold" }}>{member.name}</p>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-light)" }}>Order: {member.order}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(member.id)} style={{ background: "rgba(244, 67, 54, 0.1)", color: "#f44336", border: "none", borderRadius: "8px", cursor: "pointer", padding: "0.8rem" }}>
              <Trash size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
