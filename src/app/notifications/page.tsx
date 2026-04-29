"use client";

import { useState, useEffect } from "react";
import { Bell, Info, AlertCircle, CheckCircle, Clock } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  date: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Welcome to DPSA MUN Season 2",
      message: "Registration is now open! Please complete your profile and submit your preferences.",
      type: "success",
      date: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Payment Verification",
      message: "Please note that payment verification may take up to 24-48 hours after submission.",
      type: "info",
      date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
    {
      id: "3",
      title: "Important: Committee Preferences",
      message: "Make sure to list 3 distinct committee preferences. Allocations are on a first-come, first-served basis.",
      type: "warning",
      date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    }
  ]);

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info": return <Info style={{ color: "var(--secondary)" }} size={24} />;
      case "warning": return <AlertCircle style={{ color: "#f59e0b" }} size={24} />;
      case "success": return <CheckCircle style={{ color: "#10b981" }} size={24} />;
      default: return <Bell size={24} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container" style={{ paddingTop: "4rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "3rem", color: "var(--primary)" }}>Notifications</h1>
        <p style={{ color: "var(--text-light)", fontSize: "1.2rem", maxWidth: "600px", margin: "1rem auto" }}>
          Stay updated with the latest announcements, alerts, and information regarding DPSA MUN.
        </p>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {notifications.length === 0 ? (
          <div className="glass" style={{ textAlign: "center", padding: "3rem" }}>
            <Bell size={48} style={{ color: "var(--text-light)", margin: "0 auto 1rem auto", opacity: 0.5 }} />
            <h3 style={{ color: "var(--primary)" }}>No new notifications</h3>
            <p style={{ color: "var(--text-light)" }}>You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="glass" style={{ 
              padding: "1.5rem", 
              display: "flex", 
              gap: "1.5rem", 
              alignItems: "flex-start",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}>
              <div style={{ 
                padding: "0.75rem", 
                borderRadius: "50%", 
                background: "rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {getIcon(notif.type)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <h3 style={{ color: "var(--primary)", fontSize: "1.25rem", margin: 0 }}>{notif.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--text-light)", fontSize: "0.85rem" }}>
                    <Clock size={14} />
                    <span>{formatDate(notif.date)}</span>
                  </div>
                </div>
                <p style={{ color: "var(--text-light)", lineHeight: "1.6", margin: 0 }}>
                  {notif.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
