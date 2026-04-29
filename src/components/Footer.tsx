import Link from "next/link";
import { Camera } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--primary-dark)", color: "white", padding: "4rem 2rem 2rem", marginTop: "4rem" }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
        <div>
          <h3 style={{ color: "white", marginBottom: "1rem" }}>DPSA MUN Season 2</h3>
          <p style={{ opacity: 0.8, fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Developing leaders of tomorrow through diplomatic excellence and global perspective.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", opacity: 0.9 }}>
            <Camera size={18} color="var(--accent)" />
            <a href="https://instagram.com/dpsamaravati.mun" target="_blank" rel="noreferrer" style={{ color: "white", textDecoration: "none", fontSize: "0.9rem" }}>
              @dpsamaravati.mun
            </a>
          </div>
        </div>
        <div>
          <h4 style={{ color: "var(--accent)", marginBottom: "1rem" }}>Quick Links</h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/committees">Committees</Link></li>
            <li><Link href="/allocations">Allocations</Link></li>
          </ul>
        </div>
        <div style={{ textAlign: "center" }}>
          <h4 style={{ color: "var(--accent)", marginBottom: "1rem" }}>Join Us</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Link href="/register" className="btn-primary" style={{ backgroundColor: "var(--secondary)", border: "none" }}>Register Now</Link>
            <Link href="/login" style={{ color: "white", textDecoration: "underline" }}>Existing Delegate Login</Link>
          </div>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "0.8rem", opacity: 0.6 }}>
        &copy; {new Date().getFullYear()} DPSA MUN Season 2. All rights reserved.
      </div>
    </footer>
  );
}
