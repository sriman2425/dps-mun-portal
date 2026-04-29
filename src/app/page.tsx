"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Award } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isRegOpen, setIsRegOpen] = useState(true);

  useEffect(() => {
    // Check reg status
    const checkStatus = async () => {
      try {
        const docSnap = await getDoc(doc(db, "config", "registration"));
        if (docSnap.exists()) setIsRegOpen(docSnap.data().open);
      } catch (e: any) { 
        console.warn("Home reg status fetch issue:", e.message);
        try {
          const { getDocFromCache } = await import("firebase/firestore");
          const cacheSnap = await getDocFromCache(doc(db, "config", "registration"));
          if (cacheSnap.exists()) setIsRegOpen(cacheSnap.data().open);
        } catch (ce) {}
      }
    };
    checkStatus();

    const targetDate = new Date("2026-06-14T09:00:00").getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section style={{ 
        height: "90vh", 
        display: "flex", 
        alignItems: "center", 
        background: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/hero-bg-2.jpg') center/cover no-repeat",
        color: "white",
        position: "relative",
        overflow: "hidden"
      }}>
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <h1 style={{ color: "white", fontSize: "4rem", marginBottom: "1rem" }}>
            DPSA MUN <span style={{ color: "#81c784" }}>Season 2</span>
          </h1>
          <p style={{ fontSize: "2rem", fontWeight: 300, marginBottom: "2rem" }}>
            Season 2: The Global Dialogue Reimagined
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {isRegOpen ? (
              <Link href="/register" className="btn-primary" style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}>Register for MUN</Link>
            ) : (
              <div className="glass" style={{ padding: "1rem 2rem", background: "rgba(239, 68, 68, 0.2)", color: "#ffcdd2", border: "1px solid #ef5350", fontWeight: 600 }}>Registrations Closed</div>
            )}
            <Link href="/about" className="btn-secondary" style={{ padding: "1rem 2rem", fontSize: "1.1rem", border: "2px solid white", color: "white", background: "transparent" }}>Learn More</Link>
          </div>
        </div>
        
        {/* Background Decorative Element */}
        <div style={{
          position: "absolute",
          top: "50%",
          right: "-10%",
          width: "600px",
          height: "600px",
          background: "rgba(255, 215, 0, 0.05)",
          borderRadius: "50%",
          transform: "translateY(-50%)"
        }}></div>
      </section>

      {/* Countdown Section */}
      <section className="container" style={{ marginTop: "-5rem", position: "relative", zIndex: 3 }}>
        <div className="glass" style={{ padding: "3rem", textAlign: "center", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--primary)" }}>{timeLeft.days}</div>
            <div style={{ color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "1px" }}>Days</div>
          </div>
          <div>
            <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--primary)" }}>{timeLeft.hours}</div>
            <div style={{ color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "1px" }}>Hours</div>
          </div>
          <div>
            <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--primary)" }}>{timeLeft.minutes}</div>
            <div style={{ color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "1px" }}>Minutes</div>
          </div>
          <div>
            <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--primary)" }}>{timeLeft.seconds}</div>
            <div style={{ color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "1px" }}>Seconds</div>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section style={{ padding: "6rem 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.5rem" }}>Event Highlights</h2>
            <div style={{ width: "60px", height: "4px", background: "var(--secondary)", margin: "1rem auto" }}></div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            <div className="glass" style={{ padding: "2rem" }}>
              <Calendar style={{ color: "var(--secondary)", marginBottom: "1rem" }} size={40} />
              <h3>Date</h3>
              <p>June 14-16, 2026</p>
            </div>
            <div className="glass" style={{ padding: "2rem" }}>
              <MapPin style={{ color: "var(--secondary)", marginBottom: "1rem" }} size={40} />
              <h3>Venue</h3>
              <p>Delhi Public School, Amaravati Campus</p>
            </div>
            <div className="glass" style={{ padding: "2rem" }}>
              <Users style={{ color: "var(--secondary)", marginBottom: "1rem" }} size={40} />
              <h3>Committees</h3>
              <p>8 Specialized Committees including UNHRC, DISEC, and ECOFIN.</p>
            </div>
            <div className="glass" style={{ padding: "2rem" }}>
              <Award style={{ color: "var(--secondary)", marginBottom: "1rem" }} size={40} />
              <h3>Prizes</h3>
              <p>Cash prizes and certificates for Best Delegates and Honorable Mentions.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
