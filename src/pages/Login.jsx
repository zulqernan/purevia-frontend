import { useState } from "react";

export default function Login({ onLogin, onGoSignup }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError("Please fill all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("https://purevia-backend-production.up.railway.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        onLogin(data.user, data.token);
      } else {
        setError(data.message || "Login failed");
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
        .input-field:focus { border-color: #0284c7; background: rgba(2,132,199,0.1); }
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
      `}</style>

      <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "24px",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "440px",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>💧</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: "white", letterSpacing: 1 }}>PUREVIA</h1>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>Pure Water Delivery</p>
        </div>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "white", marginBottom: 24 }}>Welcome Back</h2>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", color: "#f87171", fontSize: 14, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>Email Address</label>
            <input
              type="email"
              placeholder="your@email.com"
              className="input-field"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="input-field"
                style={{ paddingRight: 50 }}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  fontSize: 18,
                  userSelect: "none",
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          <button className="btn" onClick={handleSubmit} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Logging in..." : "Login →"}
          </button>
        </div>

        <p style={{ color: "#64748b", fontSize: 14, textAlign: "center", marginTop: 24 }}>
          Don't have an account?{" "}
          <span onClick={onGoSignup} style={{ color: "#38bdf8", cursor: "pointer", fontWeight: 600 }}>Sign Up</span>
        </p>
      </div>
    </div>
  );
}