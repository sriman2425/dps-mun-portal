import { BookOpen, Globe, MessageSquare, Target } from "lucide-react";

export default function About() {
  return (
    <div className="container" style={{ padding: "4rem 0" }}>
      <div style={{ textAlign: "center", marginBottom: "5rem" }}>
        <h1 style={{ fontSize: "3.5rem", color: "var(--primary)" }}>About DPSA MUN</h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "800px", margin: "1.5rem auto", color: "var(--text-light)" }}>
          DPSA Model United Nations is a premier academic simulation of the United Nations, 
          where students learn about diplomacy, international relations, and the UN.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
        <div>
          <img src="/about-us-collage.jpg" alt="DPSA MUN Legacy of Diplomatic Excellence" style={{ width: "100%", borderRadius: "20px", boxShadow: "var(--shadow)" }} />
        </div>
        <div>
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--secondary)" }}>
              <Target /> Our Mission
            </h2>
            <p>To provide a platform for students to discuss global issues and develop solutions that promote peace and cooperation.</p>
          </div>
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--secondary)" }}>
              <Globe /> Global Perspective
            </h2>
            <p>Delegates represent various countries and must adhere to their national policies while negotiating with others.</p>
          </div>
          <div>
            <h2 style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--secondary)" }}>
              <MessageSquare /> Skill Development
            </h2>
            <p>Enhance your public speaking, research, writing, and critical thinking skills through rigorous debate.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
