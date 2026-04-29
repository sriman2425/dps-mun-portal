"use client";

import { useEffect, useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, addDoc, collection, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, ArrowLeft, Upload, Lock } from "lucide-react";
import Link from "next/link";

const STEPS = ["User Info", "Preferences", "Account", "Payment"];

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isRegOpen, setIsRegOpen] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    school: "",
    phone: "",
    grade: "",
    location: "",
    pref_committee: "",
    pref_country_1: "",
    pref_country_2: "",
    email: "",
    password: "",
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const docSnap = await getDoc(doc(db, "config", "registration"));
        if (docSnap.exists()) {
          setIsRegOpen(docSnap.data().open);
        }
      } catch (error: any) {
        console.warn("Reg page status check issue:", error.message);
        try {
          const { getDocFromCache } = await import("firebase/firestore");
          const cacheSnap = await getDocFromCache(doc(db, "config", "registration"));
          if (cacheSnap.exists()) setIsRegOpen(cacheSnap.data().open);
        } catch (ce) {}
      } finally {
        setCheckingStatus(false);
      }
    };
    checkStatus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a payment screenshot.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create User
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const uid = userCredential.user.uid;

      // 2. Upload Screenshot
      const storageRef = ref(storage, `payments/${uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const screenshotUrl = await getDownloadURL(storageRef);

      // 3. Save User Profile
      await setDoc(doc(db, "users", uid), {
        uid,
        name: formData.name,
        email: formData.email,
        role: "participant",
        status: "pending",
      });

      // 4. Save Registration Details
      await addDoc(collection(db, "registrations"), {
        uid,
        name: formData.name, // Added this field
        school: formData.school,
        phone: formData.phone,
        grade: formData.grade,
        location: formData.location,
        pref_committee: formData.pref_committee,
        pref_country_1: formData.pref_country_1,
        pref_country_2: formData.pref_country_2,
        payment_screenshot_url: screenshotUrl,
        is_allocated: false,
        allocated_country: "",
        allocated_committee: "",
        timestamp: new Date().toISOString(),
      });

      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return <div className="container" style={{ padding: "8rem 0", textAlign: "center" }}>Verifying registration status...</div>;
  }

  if (!isRegOpen) {
    return (
      <div className="container" style={{ padding: "8rem 0" }}>
        <div className="glass" style={{ maxWidth: "500px", margin: "0 auto", padding: "4rem 3rem", textAlign: "center" }}>
          <div style={{ 
            width: "80px", 
            height: "80px", 
            borderRadius: "50%", 
            background: "rgba(239, 68, 68, 0.1)", 
            color: "#ef4444", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            margin: "0 auto 2rem" 
          }}>
            <Lock size={40} />
          </div>
          <h2 style={{ marginBottom: "1rem" }}>Registrations Closed</h2>
          <p style={{ color: "var(--text-light)", lineHeight: 1.6, marginBottom: "2rem" }}>
            Delegate registrations for DPSA MUN Season 2 are currently closed. If you have already registered, you can still login to check your status.
          </p>
          <Link href="/login" className="btn-primary" style={{ display: "inline-block" }}>Login to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "4rem 0" }}>
      <div className="glass" style={{ maxWidth: "600px", margin: "0 auto", padding: "3rem" }}>
        <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Delegate Registration</h2>
        
        {/* Stepper */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3rem", position: "relative" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ textAlign: "center", zIndex: 2 }}>
              <div style={{ 
                width: "40px", 
                height: "40px", 
                borderRadius: "50%", 
                backgroundColor: step >= i ? "var(--primary)" : "#ddd",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 0.5rem",
                fontWeight: 600
              }}>
                {step > i ? <Check size={20} /> : i + 1}
              </div>
              <span style={{ fontSize: "0.8rem", color: step >= i ? "var(--primary)" : "var(--text-light)" }}>{s}</span>
            </div>
          ))}
          <div style={{ 
            position: "absolute", 
            top: "20px", 
            left: "0", 
            right: "0", 
            height: "2px", 
            backgroundColor: "#ddd", 
            zIndex: 1 
          }}>
            <div style={{ 
              width: `${(step / (STEPS.length - 1)) * 100}%`, 
              height: "100%", 
              backgroundColor: "var(--primary)", 
              transition: "width 0.3s ease" 
            }}></div>
          </div>
        </div>

        {/* Form Steps */}
        <div className="fade-in">
          {step === 0 && (
            <div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input name="name" className="form-input" value={formData.name} onChange={handleChange} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label className="form-label">School Name</label>
                <input name="school" className="form-input" value={formData.school} onChange={handleChange} placeholder="DPS Amaravati" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input name="phone" className="form-input" value={formData.phone} onChange={handleChange} placeholder="+91 00000 00000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <select name="grade" className="form-input" value={formData.grade} onChange={handleChange}>
                    <option value="">Select Grade</option>
                    {[8, 9, 10, 11, 12].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location (City)</label>
                <input name="location" className="form-input" value={formData.location} onChange={handleChange} placeholder="Amaravati" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="form-group">
                <label className="form-label">Preferred Committee</label>
                <select name="pref_committee" className="form-input" value={formData.pref_committee} onChange={handleChange}>
                  <option value="">Select Committee</option>
                  <option value="UNHRC">UNHRC</option>
                  <option value="DISEC">DISEC</option>
                  <option value="ECOFIN">ECOFIN</option>
                  <option value="WHO">WHO</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Country Preference 1</label>
                <input name="pref_country_1" className="form-input" value={formData.pref_country_1} onChange={handleChange} placeholder="e.g. USA" />
              </div>
              <div className="form-group">
                <label className="form-label">Country Preference 2</label>
                <input name="pref_country_2" className="form-input" value={formData.pref_country_2} onChange={handleChange} placeholder="e.g. UK" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input name="email" type="email" className="form-input" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input name="password" type="password" className="form-input" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: "center" }}>
              <p style={{ marginBottom: "1rem" }}>Scan the QR code below to pay the registration fee of <strong>₹1500</strong>.</p>
              <div style={{ backgroundColor: "#f0f0f0", width: "220px", height: "220px", margin: "0 auto 2rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", border: "1px solid #ddd", overflow: "hidden" }}>
                {/* UPI QR Code */}
                <div style={{ textAlign: "center" }}>
                  <img src="/upi-qr.jpg" alt="UPI QR Code" style={{ maxWidth: "100%", height: "auto" }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Upload Payment Screenshot</label>
                <label className="btn-secondary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <Upload size={18} />
                  {file ? file.name : "Choose File"}
                  <input type="file" onChange={handleFileChange} style={{ display: "none" }} accept="image/*" />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3rem" }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ArrowLeft size={18} /> Back
            </button>
          )}
          <div style={{ flex: 1 }}></div>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Next <ArrowRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "var(--secondary)" }}>
              {loading ? "Registering..." : "Submit Registration"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
