import { useState } from "react";

export default function Signup({ onSignup, onGoLogin }) {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "", address: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validatePhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^(\+92|0)[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill all required fields");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (formData.phone && !validatePhone(formData.phone)) {
      setError("Please enter a valid Pakistani phone number (e.g. 03001234567)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://purevia-backend-production.up.railway.app/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onSignup(data.user, data.token);
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0c1a3a 50%, #0284c7 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      padding: "24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .input-field {
          width: 100%;
          padding: 14px 18px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: white;
          outline: none;
          transition: all 0.3s;
        }
        .input-field:focus {
          border-color: #0284c7;
          background: rgba(2,132,199,0.1);
        }
        .input-field::placeholder { color: #475569; }
        .btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          color: white;
          border: none;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(2,132,199,0.4); }
        .btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #475569;
          font-size: 18px;
          padding: 4px;
          transition: color 0.3s;
        }
        .eye-btn:hover { color: #94a3b8; }
        .strength-bar {
          height: 4px;
          border-radius: 2px;
          margin-top: 8px;
          transition: all 0.3s;
        }
      `}</style>

      <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "24px",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "480px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>💧</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 800,
            color: "white",
            letterSpacing: 1,
          }}>PUREVIA</h1>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>Create your account</p>
        </div>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "white", marginBottom: 24 }}>
          Get Started
        </h2>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10,
            padding: "12px 16px",
            color: "#f87171",
            fontSize: 14,
            marginBottom: 20,
          }}>{error}</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Name */}
          <div>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>Full Name *</label>
            <input type="text" placeholder="Ahmed Ali" className="input-field"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>Email Address *</label>
            <input type="email" placeholder="your@email.com" className="input-field"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>

          {/* Password with show/hide */}
          <div>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>Password *</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min 6 characters"
                className="input-field"
                style={{ paddingRight: 48 }}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
              <button className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {/* Password strength bar */}
            {formData.password && (
              <div>
                <div className="strength-bar" style={{
                  width: formData.password.length < 6 ? "33%" : formData.password.length < 10 ? "66%" : "100%",
                  background: formData.password.length < 6 ? "#ef4444" : formData.password.length < 10 ? "#f59e0b" : "#10b981",
                }} />
                <div style={{
                  fontSize: 12,
                  marginTop: 4,
                  color: formData.password.length < 6 ? "#ef4444" : formData.password.length < 10 ? "#f59e0b" : "#10b981"
                }}>
                  {formData.password.length < 6 ? "Weak" : formData.password.length < 10 ? "Medium" : "Strong"} password
                </div>
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>
              Phone Number
              <span style={{ color: "#334155", fontSize: 11, marginLeft: 6 }}>(03001234567 or +923001234567)</span>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{
                padding: "14px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#94a3b8",
                fontSize: 15,
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
              }}>🇵🇰 +92</div>
              <input
                type="tel"
                placeholder="3001234567"
                className="input-field"
                value={formData.phone}
                onChange={e => {
                  let val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.startsWith('0')) val = val.slice(1);
                  if (val.length <= 10) setFormData({ ...formData, phone: val ? `0${val}` : '' });
                }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </div>
            {formData.phone && !validatePhone(formData.phone) && (
              <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>Invalid phone number</div>
            )}
          </div>

          {/* Address */}
          <div>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>Delivery Address</label>
            <input type="text" placeholder="House no, Street, Area" className="input-field"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>

          <button className="btn" onClick={handleSubmit} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Creating Account..." : "Create Account →"}
          </button>
        </div>

        <p style={{ color: "#64748b", fontSize: 14, textAlign: "center", marginTop: 24 }}>
          Already have an account?{" "}
          <span onClick={onGoLogin} style={{ color: "#38bdf8", cursor: "pointer", fontWeight: 600 }}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
