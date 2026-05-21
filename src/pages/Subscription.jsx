import { useState, useEffect } from "react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    cans: 4,
    price: 800,
    saving: "Save 20%",
    color: "#64748b",
    bg: "rgba(100,116,139,0.1)",
    border: "rgba(100,116,139,0.3)",
    icon: "💧",
    features: ["4 x 19L cans/month", "Free delivery", "Cancel anytime", "Email support"],
    popular: false,
  },
  {
    id: "family",
    name: "Family",
    cans: 8,
    price: 1500,
    saving: "Save 25%",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.3)",
    icon: "💦",
    features: ["8 x 19L cans/month", "Free priority delivery", "Cancel anytime", "Email & WhatsApp support"],
    popular: true,
  },
  {
    id: "office",
    name: "Office",
    cans: 16,
    price: 2800,
    saving: "Save 30%",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.3)",
    icon: "🏢",
    features: ["16 x 19L cans/month", "Free same-day delivery", "Cancel anytime", "Dedicated support"],
    popular: false,
  },
  {
    id: "corporate",
    name: "Corporate",
    cans: 30,
    price: 4500,
    saving: "Save 40%",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    icon: "🏆",
    features: ["30+ x 19L cans/month", "Free express delivery", "Custom scheduling", "24/7 dedicated support"],
    popular: false,
  },
];

export default function Subscription({ token, onBack }) {
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ deliveryAddress: "", deliveryArea: "DHA" });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");

  const areas = ["DHA", "Clifton", "Gulshan", "PECHS", "Saddar", "North Nazimabad", "Nazimabad", "Federal B Area"];

  useEffect(() => {
    fetchMySubscription();
  }, []);

  const fetchMySubscription = async () => {
    try {
      const res = await fetch("https://purevia-backend.vercel.app/api/subscriptions/my-subscription", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setCurrentSub(data.subscription);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleSubscribe = async () => {
    if (!formData.deliveryAddress) {
      setMsg("Please enter delivery address");
      setMsgType("error");
      return;
    }
    setSubscribing(true);
    setMsg("");
    try {
      const res = await fetch("https://purevia-backend.vercel.app/api/subscriptions/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          deliveryAddress: formData.deliveryAddress,
          deliveryArea: formData.deliveryArea,
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`✅ Successfully subscribed to ${selectedPlan.name} plan!`);
        setMsgType("success");
        setShowForm(false);
        fetchMySubscription();
      } else {
        setMsg(data.message || "Failed to subscribe");
        setMsgType("error");
      }
    } catch (err) {
      setMsg("Server error");
      setMsgType("error");
    }
    setSubscribing(false);
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) return;
    try {
      const res = await fetch("https://purevia-backend.vercel.app/api/subscriptions/cancel", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMsg("✅ Subscription cancelled successfully");
        setMsgType("success");
        setCurrentSub(null);
      }
    } catch (err) {
      setMsg("Server error");
      setMsgType("error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .input-field {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0f2fe;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #0f172a;
          background: white;
          outline: none;
          transition: all 0.3s;
        }
        .input-field:focus { border-color: #0284c7; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .plan-card { animation: fadeIn 0.5s ease forwards; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #020617, #0c1a3a)",
        padding: "24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}>
        <button onClick={onBack} style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "white",
          padding: "8px 16px",
          borderRadius: 8,
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
        }}>← Back</button>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: 24, fontWeight: 800 }}>
            💧 Subscription Plans
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 2 }}>Choose the perfect plan for your needs</p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>

        {/* Message */}
        {msg && (
          <div style={{
            background: msgType === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${msgType === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            borderRadius: 12,
            padding: "14px 20px",
            color: msgType === "success" ? "#10b981" : "#ef4444",
            marginBottom: 24,
            fontSize: 15,
          }}>{msg}</div>
        )}

        {/* Current Subscription */}
        {!loading && currentSub && (
          <div style={{
            background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
            borderRadius: 20,
            padding: "28px 32px",
            marginBottom: 40,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 4 }}>Current Plan</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: 28, fontWeight: 800 }}>
                {currentSub.planName} Plan
              </h3>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, marginTop: 4 }}>
                {currentSub.cans} cans/month • {currentSub.deliveryArea} • Rs. {currentSub.price}/month
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{
                background: "rgba(16,185,129,0.2)",
                border: "1px solid rgba(16,185,129,0.4)",
                color: "#10b981",
                padding: "6px 16px",
                borderRadius: 50,
                fontSize: 13,
                fontWeight: 700,
              }}>✅ Active</span>
              <button onClick={handleCancel} style={{
                background: "rgba(239,68,68,0.2)",
                border: "1px solid rgba(239,68,68,0.4)",
                color: "#f87171",
                padding: "6px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 600,
              }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Plans */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: "#0c1a3a", marginBottom: 8 }}>
            Choose Your Plan
          </h2>
          <p style={{ color: "#64748b", fontSize: 16 }}>All plans include free delivery and can be cancelled anytime</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 40 }}>
          {PLANS.map((plan, i) => (
            <div key={plan.id} className="plan-card" style={{
              background: "white",
              borderRadius: 20,
              overflow: "hidden",
              border: currentSub?.planId === plan.id ? `2px solid ${plan.color}` : "1px solid #e0f2fe",
              boxShadow: plan.popular ? "0 8px 30px rgba(59,130,246,0.15)" : "0 2px 10px rgba(0,0,0,0.05)",
              position: "relative",
              transition: "all 0.3s",
              animationDelay: `${i * 0.1}s`,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 16px 40px ${plan.color}25`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = plan.popular ? "0 8px 30px rgba(59,130,246,0.15)" : "0 2px 10px rgba(0,0,0,0.05)"; }}
            >
              {plan.popular && (
                <div style={{
                  background: `linear-gradient(135deg, ${plan.color}, #60a5fa)`,
                  color: "white",
                  textAlign: "center",
                  padding: "6px",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1,
                }}>⭐ MOST POPULAR</div>
              )}
              {currentSub?.planId === plan.id && (
                <div style={{
                  background: "rgba(16,185,129,0.1)",
                  color: "#10b981",
                  textAlign: "center",
                  padding: "6px",
                  fontSize: 12,
                  fontWeight: 700,
                }}>✅ CURRENT PLAN</div>
              )}

              <div style={{ padding: "28px 24px" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{plan.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: "#0c1a3a", marginBottom: 4 }}>
                  {plan.name}
                </h3>
                <div style={{ color: plan.color, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{plan.saving}</div>

                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 800, color: "#0c1a3a" }}>
                    Rs. {plan.price.toLocaleString()}
                  </span>
                  <span style={{ color: "#64748b", fontSize: 14 }}>/month</span>
                </div>

                <div style={{ marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ color: plan.color, fontSize: 14 }}>✓</span>
                      <span style={{ color: "#64748b", fontSize: 14 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { setSelectedPlan(plan); setShowForm(true); setMsg(""); }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: currentSub?.planId === plan.id
                      ? "rgba(16,185,129,0.1)"
                      : `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
                    color: currentSub?.planId === plan.id ? "#10b981" : "white",
                    border: currentSub?.planId === plan.id ? `1px solid rgba(16,185,129,0.3)` : "none",
                    borderRadius: 12,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 15,
                    transition: "all 0.3s",
                  }}
                >
                  {currentSub?.planId === plan.id ? "✅ Current Plan" : currentSub ? "Switch Plan" : "Subscribe Now"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Subscription Form Modal */}
        {showForm && selectedPlan && (
          <div style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: 24,
            backdropFilter: "blur(10px)",
          }}>
            <div style={{
              background: "white",
              borderRadius: 24,
              padding: "40px",
              width: "100%",
              maxWidth: 480,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#0c1a3a" }}>
                  Subscribe to {selectedPlan.name}
                </h3>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b" }}>✕</button>
              </div>

              {/* Plan Summary */}
              <div style={{
                background: selectedPlan.bg,
                border: `1px solid ${selectedPlan.border}`,
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 24,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div>
                  <div style={{ color: "#64748b", fontSize: 13 }}>{selectedPlan.name} Plan</div>
                  <div style={{ color: "#0c1a3a", fontWeight: 600, fontSize: 15 }}>{selectedPlan.cans} cans/month</div>
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: selectedPlan.color }}>
                  Rs. {selectedPlan.price.toLocaleString()}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", color: "#64748b", fontSize: 13, marginBottom: 8 }}>Delivery Area</label>
                  <select className="input-field" value={formData.deliveryArea}
                    onChange={e => setFormData({ ...formData, deliveryArea: e.target.value })}>
                    {areas.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", color: "#64748b", fontSize: 13, marginBottom: 8 }}>Delivery Address</label>
                  <input type="text" placeholder="House no, Street, Area" className="input-field"
                    value={formData.deliveryAddress}
                    onChange={e => setFormData({ ...formData, deliveryAddress: e.target.value })} />
                </div>

                {msg && (
                  <div style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#ef4444",
                    fontSize: 13,
                  }}>{msg}</div>
                )}

                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  style={{
                    padding: "15px",
                    background: `linear-gradient(135deg, ${selectedPlan.color}, ${selectedPlan.color}cc)`,
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: subscribing ? "not-allowed" : "pointer",
                    opacity: subscribing ? 0.7 : 1,
                  }}
                >
                  {subscribing ? "Subscribing..." : `Subscribe — Rs. ${selectedPlan.price.toLocaleString()}/month`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
