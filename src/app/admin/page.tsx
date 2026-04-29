"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { CheckCircle, XCircle, Eye, Shield, Users, Briefcase, Calendar, Bell, Image as ImageIcon, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import CommitteesManager from "./CommitteesManager";
import SecretariatManager from "./SecretariatManager";
import ConfigManager from "./ConfigManager";
import ScheduleManager from "./ScheduleManager";
import NoticesManager from "./NoticesManager";

export default function AdminDashboard() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [allocation, setAllocation] = useState({ country: "", committee: "" });
  const [activeTab, setActiveTab] = useState("dashboard");

  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && role === "participant") router.push("/dashboard");
    
    let unsubscribe: any;

    if (user && (role === "admin" || role === "secretariat" || user.email?.toLowerCase().endsWith("@dpsmun.in") || user.email?.toLowerCase().endsWith("@dpsamun.com"))) {
      // Real-time listener for registrations
      const { onSnapshot, collection } = require("firebase/firestore");
      
      try {
        unsubscribe = onSnapshot(collection(db, "registrations"), 
          (snap: any) => {
            setRegistrations(snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) })));
            setConnectionError(false);
          },
          (error: any) => {
            console.warn("Realtime fetch failed:", error);
            setConnectionError(true);
          }
        );
        
        // One-time fetch for committees is fine
        getDocs(query(collection(db, "committees"))).then(snap => {
          setCommittees(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
        }).catch(() => setConnectionError(true));

      } catch (e) {
        setConnectionError(true);
      }
    }

    return () => { if (unsubscribe) unsubscribe(); };
  }, [user, role, loading]);

  // Remove the old fetchData function as it's now handled by the listener
  const fetchData = async () => {};

  const handleExportData = () => {
    const headers = ["Name", "Email", "School", "Phone", "Grade", "Committee Pref", "Country 1", "Country 2", "Allocated", "Country", "Committee"];
    const rows = registrations.map(r => [
      r.name, r.email, r.school, r.phone, r.grade, r.pref_committee, r.pref_country_1, r.pref_country_2,
      r.is_allocated ? "Yes" : "No", r.allocated_country || "N/A", r.allocated_committee || "N/A"
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dpsmun_registrations.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleApproveAndAllocate = async (reg: any) => {
    if (!allocation.country || !allocation.committee) {
      alert("Please select both country and committee.");
      return;
    }

    try {
      await updateDoc(doc(db, "registrations", reg.id), {
        is_allocated: true,
        allocated_country: allocation.country,
        allocated_committee: allocation.committee,
      });
      await updateDoc(doc(db, "users", reg.uid), { status: "approved" });
      alert("Allocation successful!");
      fetchData();
      setSelectedReg(null);
    } catch (error) {
      console.error(error);
    }
  };

  const canApprove = user?.email === "dpssecgen@dpsmun.in" || user?.email === "secgen@dpsmun.in" || user?.email === "secgendps@dpsmun.in";
  const canVerify = user?.email === "dpsmunaccess@dpsmun.in" || canApprove;
  const canManageCommittees = user?.email === "dpsdirgen@dpsmun.in" || canApprove;

  if (loading) return <div className="container" style={{ padding: "4rem", textAlign: "center" }}>Loading Admin Portal...</div>;

  return (
    <div className="container" style={{ padding: "3rem 0" }}>
      {/* Header with Navigation Breadcrumb */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Admin <span style={{ color: "var(--secondary)" }}>Portal</span></h1>
          <div style={{ display: "flex", gap: "0.5rem", color: "var(--text-light)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            <span style={{ cursor: "pointer" }} onClick={() => setActiveTab("dashboard")}>Dashboard</span>
            {activeTab !== "dashboard" && (
              <>
                <span>/</span>
                <span style={{ textTransform: "capitalize", fontWeight: 600, color: "var(--primary)" }}>{activeTab}</span>
              </>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-secondary" 
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.2rem" }}
          >
            <Clock size={18} /> Refresh
          </button>
          <button 
            onClick={async () => {
              setConnectionError(false);
              const { getDocsFromServer, collection } = await import("firebase/firestore");
              try {
                const snap = await getDocsFromServer(collection(db, "registrations"));
                setRegistrations(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
                alert("Success! Found " + snap.docs.length + " registrations.");
              } catch (e) {
                alert("Sync failed: Firewall still blocking server connection.");
                setConnectionError(true);
              }
            }} 
            className="btn-primary" 
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.2rem", backgroundColor: "#1a237e" }}
          >
            <Shield size={18} /> Force Sync
          </button>
          {activeTab !== "dashboard" && (
            <button onClick={() => setActiveTab("dashboard")} className="btn-secondary" style={{ padding: "0.6rem 1.2rem" }}>&larr; Back to Portal</button>
          )}
          <Link href="/" className="btn-secondary" style={{ padding: "0.6rem 1.2rem" }}>Exit</Link>
        </div>
      </div>

      {connectionError && (
        <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "1rem", borderRadius: "12px", marginBottom: "2rem", border: "1px solid #ef4444", display: "flex", alignItems: "center", gap: "1rem" }}>
          <XCircle size={20} />
          <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>
            ⚠️ Database Connection Issues: You might be on a restrictive network. Real-time updates are currently paused.
          </p>
        </div>
      )}

      {activeTab === "dashboard" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "2rem" }}>
          {/* View Registered Delegates Card */}
          <div className="glass fade-in" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ padding: "1rem", background: "rgba(26, 35, 126, 0.05)", borderRadius: "12px", color: "var(--primary)" }}>
                  <Users size={32} />
                </div>
                <h3 style={{ margin: 0 }}>View Registered Delegates</h3>
              </div>
              <p style={{ color: "var(--text-light)", lineHeight: 1.6, marginBottom: "2rem" }}>
                Access the list of all registered participants, their preferences, and payment details.
              </p>
            </div>
            <button onClick={() => setActiveTab("registrations")} className="btn-primary" style={{ width: "100%", background: "#1b5e20", borderColor: "#1b5e20" }}>View Delegates</button>
          </div>

          {/* Manage Committees Card */}
          <div className="glass fade-in" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ padding: "1rem", background: "rgba(26, 35, 126, 0.05)", borderRadius: "12px", color: "var(--primary)" }}>
                  <Briefcase size={32} />
                </div>
                <h3 style={{ margin: 0 }}>Manage Committees</h3>
              </div>
              <p style={{ color: "var(--text-light)", lineHeight: 1.6, marginBottom: "2rem" }}>
                Create, edit, and manage committee details, agendas, and images displayed on the site.
              </p>
            </div>
            <button onClick={() => setActiveTab("committees")} className="btn-primary" style={{ width: "100%", background: "#1b5e20", borderColor: "#1b5e20" }}>Edit Committees</button>
          </div>

          {/* Manage Allocations Card */}
          <div className="glass fade-in" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ padding: "1rem", background: "rgba(26, 35, 126, 0.05)", borderRadius: "12px", color: "var(--primary)" }}>
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Manage Allocations</h3>
                  <span style={{ fontSize: "0.85rem", color: "#4caf50", fontWeight: 700 }}>{registrations.length} Total Delegates</span>
                </div>
              </div>
              <p style={{ color: "var(--text-light)", lineHeight: 1.6, marginBottom: "2rem" }}>
                Review payment screenshots, approve registrations, and assign countries/committees to delegates.
              </p>
            </div>
            <button onClick={() => setActiveTab("registrations")} className="btn-primary" style={{ width: "100%", background: "#1b5e20", borderColor: "#1b5e20" }}>View {registrations.length} Registrations</button>
          </div>

          {/* Manage Schedule Card */}
          <div className="glass fade-in" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ padding: "1rem", background: "rgba(26, 35, 126, 0.05)", borderRadius: "12px", color: "var(--primary)" }}>
                  <Calendar size={32} />
                </div>
                <h3 style={{ margin: 0 }}>Manage Schedule</h3>
              </div>
              <p style={{ color: "var(--text-light)", lineHeight: 1.6, marginBottom: "2rem" }}>
                Modify event timings, dates, locations, and session details for the conference.
              </p>
            </div>
            <button onClick={() => setActiveTab("schedule")} className="btn-primary" style={{ width: "100%", background: "#1b5e20", borderColor: "#1b5e20" }}>Edit Schedule</button>
          </div>

          {/* Manage Team Card */}
          <div className="glass fade-in" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ padding: "1rem", background: "rgba(26, 35, 126, 0.05)", borderRadius: "12px", color: "var(--primary)" }}>
                  <Users size={32} />
                </div>
                <h3 style={{ margin: 0 }}>Manage Team</h3>
              </div>
              <p style={{ color: "var(--text-light)", lineHeight: 1.6, marginBottom: "2rem" }}>
                Add, edit, or remove team members displayed on the public Secretariat page.
              </p>
            </div>
            <button onClick={() => setActiveTab("secretariat")} className="btn-primary" style={{ width: "100%", background: "#1b5e20", borderColor: "#1b5e20" }}>Manage Team</button>
          </div>

          {/* Manage Notices Card */}
          <div className="glass fade-in" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ padding: "1rem", background: "rgba(26, 35, 126, 0.05)", borderRadius: "12px", color: "var(--primary)" }}>
                  <Bell size={32} />
                </div>
                <h3 style={{ margin: 0 }}>Manage Notices</h3>
              </div>
              <p style={{ color: "var(--text-light)", lineHeight: 1.6, marginBottom: "2rem" }}>
                Create, edit, and manage site-wide notices and important announcements.
              </p>
            </div>
            <button onClick={() => setActiveTab("notices")} className="btn-primary" style={{ width: "100%", background: "#1b5e20", borderColor: "#1b5e20" }}>Edit Notices</button>
          </div>

          {/* Export Data Card */}
          <div className="glass fade-in" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ padding: "1rem", background: "rgba(26, 35, 126, 0.05)", borderRadius: "12px", color: "var(--primary)" }}>
                  <ImageIcon size={32} />
                </div>
                <h3 style={{ margin: 0 }}>Export Data</h3>
              </div>
              <p style={{ color: "var(--text-light)", lineHeight: 1.6, marginBottom: "2rem" }}>
                Download delegate registration data in CSV format for offline processing.
              </p>
            </div>
            <button onClick={handleExportData} className="btn-primary" style={{ width: "100%", background: "#1b5e20", borderColor: "#1b5e20" }}>Export Data</button>
          </div>

          {/* Site Settings Card */}
          <div className="glass fade-in" style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ padding: "1rem", background: "rgba(26, 35, 126, 0.05)", borderRadius: "12px", color: "var(--primary)" }}>
                  <Shield size={32} />
                </div>
                <h3 style={{ margin: 0 }}>Site Settings</h3>
              </div>
              <p style={{ color: "var(--text-light)", lineHeight: 1.6, marginBottom: "2rem" }}>
                Configure site-wide settings like registration status and system notifications.
              </p>
            </div>
            <button onClick={() => setActiveTab("settings")} className="btn-primary" style={{ width: "100%", background: "#1b5e20", borderColor: "#1b5e20" }}>Manage Settings</button>
          </div>
        </div>
      )}

      {activeTab === "registrations" && (
        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: selectedReg ? "1fr 400px" : "1fr", gap: "2rem" }}>
          {/* Registrations List */}
          <div className="glass" style={{ padding: "0", overflow: "hidden" }}>
            <div style={{ padding: "2rem", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              <h2 style={{ margin: 0 }}>Registration Queue</h2>
              <p style={{ margin: "0.5rem 0 0 0", color: "var(--text-light)" }}>Manage and allocate delegates</p>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column" }}>
              {registrations.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-light)" }}>No registrations found.</div>
              ) : (
                registrations.map((reg) => (
                  <div key={reg.id} 
                    onClick={() => setSelectedReg(reg)}
                    style={{ 
                      display: "grid", 
                      gridTemplateColumns: "2fr 2fr 1fr 1fr", 
                      gap: "1rem", 
                      padding: "1.5rem 2rem", 
                      borderBottom: "1px solid rgba(0,0,0,0.03)",
                      cursor: "pointer",
                      background: selectedReg?.id === reg.id ? "rgba(26, 35, 126, 0.03)" : "transparent",
                      transition: "background 0.2s ease"
                    }}
                  >
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--primary)" }}>{reg.name || "N/A"}</h4>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>{reg.school}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", color: "var(--text-light)", fontSize: "0.9rem" }}>
                      {reg.pref_committee}
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {reg.is_allocated ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.8rem", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 600 }}>
                          <CheckCircle size={14} /> Allocated
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.8rem", background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 600 }}>
                          Pending
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                      <span style={{ color: "var(--secondary)", fontSize: "0.9rem", fontWeight: 500 }}>Review &rarr;</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Detail Panel (Same as before) */}
          {selectedReg && (
            <div className="glass fade-in" style={{ padding: "2.5rem", height: "fit-content", position: "sticky", top: "100px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem", color: "var(--primary)" }}>{selectedReg.name}</h3>
                  <p style={{ margin: 0, color: "var(--text-light)" }}>{selectedReg.email}</p>
                </div>
                <button onClick={() => setSelectedReg(null)} style={{ background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-light)" }}>&times;</button>
              </div>
              <div style={{ marginBottom: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ background: "rgba(26, 35, 126, 0.03)", padding: "1rem", borderRadius: "8px" }}>
                  <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.8rem", color: "var(--text-light)", textTransform: "uppercase" }}>Phone</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{selectedReg.phone}</p>
                </div>
                <div style={{ background: "rgba(26, 35, 126, 0.03)", padding: "1rem", borderRadius: "8px" }}>
                  <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.8rem", color: "var(--text-light)", textTransform: "uppercase" }}>Grade</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{selectedReg.grade}</p>
                </div>
              </div>
              {canApprove && !selectedReg.is_allocated && (
                <div style={{ borderTop: "1px solid #eee", paddingTop: "2rem" }}>
                  <h4 style={{ marginBottom: "1rem" }}>Allocation</h4>
                  <div className="form-group">
                    <label className="form-label">Assign Committee</label>
                    <select className="form-input" onChange={(e) => setAllocation({ ...allocation, committee: e.target.value })}>
                      <option value="">Select Committee</option>
                      {committees.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign Country</label>
                    <input className="form-input" placeholder="e.g. India" onChange={(e) => setAllocation({ ...allocation, country: e.target.value })} />
                  </div>
                  <button onClick={() => handleApproveAndAllocate(selectedReg)} className="btn-primary" style={{ width: "100%" }}>
                    Approve & Allocate
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "committees" && <CommitteesManager />}
      {activeTab === "secretariat" && <SecretariatManager />}
      {activeTab === "settings" && <ConfigManager />}
      {activeTab === "schedule" && <ScheduleManager />}
      {activeTab === "notices" && <NoticesManager />}
    </div>
  );
}
