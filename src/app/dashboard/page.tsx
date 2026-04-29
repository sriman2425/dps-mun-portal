"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Clock, CheckCircle, Globe, Users, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ParticipantDashboard() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [registration, setRegistration] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user) {
      fetchRegistration();
    }
  }, [user, loading]);

  const fetchRegistration = async () => {
    const q = query(collection(db, "registrations"), where("uid", "==", user?.uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setRegistration(querySnapshot.docs[0].data());
    }
    setFetching(false);
  };

  if (loading || fetching) return <div className="container" style={{ padding: "4rem", textAlign: "center" }}>Loading Dashboard...</div>;

  const isApproved = registration?.is_allocated;

  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <div className="fade-in">
        <h1 style={{ marginBottom: "2rem" }}>Welcome, {user?.displayName || "Delegate"}</h1>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
          <div>
            {/* Status Card */}
            <div className="glass" style={{ padding: "2rem", marginBottom: "2rem", borderLeft: `8px solid ${isApproved ? "#4caf50" : "#ff9800"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                {isApproved ? <CheckCircle style={{ color: "#4caf50" }} size={32} /> : <Clock style={{ color: "#ff9800" }} size={32} />}
                <h2 style={{ margin: 0 }}>Registration Status: {isApproved ? "Approved" : "Pending Verification"}</h2>
              </div>
              <p style={{ color: "var(--text-light)" }}>
                {isApproved 
                  ? "Congratulations! Your registration has been verified and your country has been allocated." 
                  : "We have received your payment screenshot. Our team is currently verifying the transaction. You will see your allocation here once approved."}
              </p>
            </div>

            {/* Allocation Details */}
            {isApproved && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                <div className="glass" style={{ padding: "2rem", textAlign: "center" }}>
                  <Globe style={{ color: "var(--primary)", marginBottom: "1rem" }} size={48} />
                  <h4 style={{ color: "var(--text-light)", textTransform: "uppercase", fontSize: "0.8rem" }}>Allocated Country</h4>
                  <h2 style={{ color: "var(--primary)" }}>{registration.allocated_country}</h2>
                </div>
                <div className="glass" style={{ padding: "2rem", textAlign: "center" }}>
                  <Users style={{ color: "var(--primary)", marginBottom: "1rem" }} size={48} />
                  <h4 style={{ color: "var(--text-light)", textTransform: "uppercase", fontSize: "0.8rem" }}>Committee</h4>
                  <h2 style={{ color: "var(--primary)" }}>{registration.allocated_committee}</h2>
                </div>
              </div>
            )}

            {!isApproved && (
              <div className="glass" style={{ padding: "2rem" }}>
                <h3>What's Next?</h3>
                <ul style={{ marginTop: "1rem", listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <li style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ color: "var(--primary)", fontWeight: 800 }}>01</div>
                    <p>Wait for payment verification (24-48 hours).</p>
                  </li>
                  <li style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ color: "var(--primary)", fontWeight: 800 }}>02</div>
                    <p>Receive your country and committee assignment.</p>
                  </li>
                  <li style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ color: "var(--primary)", fontWeight: 800 }}>03</div>
                    <p>Download the background guides for your committee.</p>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <aside>
            <div className="glass" style={{ padding: "2rem", marginBottom: "2rem" }}>
              <h3>Important Dates</h3>
              <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <p style={{ fontWeight: 600 }}>August 1, 2026</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>Position Paper Deadline</p>
                </div>
                <div>
                  <p style={{ fontWeight: 600 }}>August 15, 2026</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>Conference Day 1</p>
                </div>
              </div>
            </div>
            
            <div className="glass" style={{ padding: "2rem" }}>
              <h3>Resources</h3>
              <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <a href="#" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)" }}>
                  <FileText size={18} /> Rules of Procedure
                </a>
                <a href="#" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)" }}>
                  <FileText size={18} /> Research Guide
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
