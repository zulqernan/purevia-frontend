import { useState } from "react";

export default function Payment({ order, token, onSuccess, onCancel }) {
  const [step, setStep] = useState("form");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardData, setCardData] = useState({
    cardNumber: "", cardName: "", expiry: "", cvv: ""
  });
  const [mobileData, setMobileData] = useState({
    mobileNumber: "", cnic: ""
  });
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");

  const formatCardNumber = (value) => {
    return value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
  };

  const formatExpiry = (value) => {
    return value.replace(/\D/g, "").replace(/^(.{2})/, "$1/").slice(0, 5);
  };

  const handlePayment = async () => {
    // Validation
    if (paymentMethod === "card") {
      if (!cardData.cardNumber || !cardData.cardName || !cardData.expiry || !cardData.cvv) {
        setError("Please fill all card details");
        return;
      }
    } else {
      if (!mobileData.mobileNumber || !mobileData.cnic) {
        setError("Please fill all required details");
        return;
      }
      if (mobileData.mobileNumber.length < 11) {
        setError("Please enter a valid mobile number");
        return;
      }
      if (mobileData.cnic.length < 6) {
        setError("Please enter last 6 digits of your CNIC");
        return;
      }
    }

    setError("");
    setStep("processing");

    try {
      const res = await fetch("https://purevia-backend.vercel.app/api/payments/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order._id,
          cardNumber: paymentMethod === "card" ? cardData.cardNumber.replace(/\s/g, "") : mobileData.mobileNumber,
          cardName: paymentMethod === "card" ? cardData.cardName : "Mobile Payment",
          expiry: paymentMethod === "card" ? cardData.expiry : "00/00",
          cvv: paymentMethod === "card" ? cardData.cvv : mobileData.cnic,
          amount: order.totalAmount,
          paymentMethod,
        })
      });

      const data = await res.json();

      if (res.ok) {
        setTransactionId(data.transactionId);
        setStep("success");
      } else {
        setStep("failed");
        setError(data.message);
      }
    } catch (err) {
      setStep("failed");
      setError("Server error. Please try again.");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 24,
      backdropFilter: "blur(10px)",
    }}>
      <div style={{
        background: "#0f172a",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        padding: "40px",
        width: "100%",
        maxWidth: 480,
        fontFamily: "'DM Sans', sans-serif",
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
          .pay-input {
            width: 100%;
            padding: 13px 16px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 10px;
            color: white;
            font-family: 'DM Sans', sans-serif;
            font-size: 15px;
            outline: none;
            transition: all 0.3s;
          }
          .pay-input:focus { border-color: #0284c7; background: rgba(2,132,199,0.1); }
          .pay-input::placeholder { color: #334155; }
          .pay-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #0284c7, #0ea5e9);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
            transition: all 0.3s;
          }
          .pay-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(2,132,199,0.4); }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        `}</style>

        {/* FORM STEP */}
        {step === "form" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ color: "white", fontFamily: "'Playfair Display', serif", fontSize: 22 }}>💳 Payment</h2>
              <button onClick={onCancel} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 22 }}>✕</button>
            </div>

            {/* Order Summary */}
            <div style={{ background: "rgba(2,132,199,0.1)", border: "1px solid rgba(2,132,199,0.2)", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "#94a3b8", fontSize: 13 }}>Order Total</div>
                  <div style={{ color: "white", fontSize: 13, marginTop: 2 }}>{order.product} × {order.quantity}</div>
                </div>
                <div style={{ color: "#0ea5e9", fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800 }}>
                  Rs. {order.totalAmount}
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 10 }}>Payment Method</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { id: "card", label: "💳 Card", color: "#3b82f6" },
                  { id: "jazzcash", label: "📱 JazzCash", color: "#ef4444" },
                  { id: "easypaisa", label: "💚 Easypaisa", color: "#10b981" },
                ].map(method => (
                  <button key={method.id}
                    onClick={() => { setPaymentMethod(method.id); setError(""); }}
                    style={{
                      flex: 1, padding: "10px 8px",
                      background: paymentMethod === method.id ? `${method.color}20` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${paymentMethod === method.id ? method.color : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 10,
                      color: paymentMethod === method.id ? method.color : "#64748b",
                      cursor: "pointer", fontSize: 13, fontWeight: 600,
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "all 0.3s",
                    }}>{method.label}</button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* CARD FIELDS */}
            {paymentMethod === "card" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 6 }}>Card Number</label>
                  <input className="pay-input" placeholder="1234 5678 9012 3456"
                    value={cardData.cardNumber}
                    onChange={e => setCardData({ ...cardData, cardNumber: formatCardNumber(e.target.value) })} />
                </div>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 6 }}>Cardholder Name</label>
                  <input className="pay-input" placeholder="Ahmed Ali"
                    value={cardData.cardName}
                    onChange={e => setCardData({ ...cardData, cardName: e.target.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 6 }}>Expiry Date</label>
                    <input className="pay-input" placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={e => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })} />
                  </div>
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 6 }}>CVV</label>
                    <input className="pay-input" placeholder="123" maxLength={3} type="password"
                      value={cardData.cvv}
                      onChange={e => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "") })} />
                  </div>
                </div>
              </div>
            )}

            {/* JAZZCASH FIELDS */}
            {paymentMethod === "jazzcash" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 28 }}>📱</span>
                    <div>
                      <div style={{ color: "#ef4444", fontWeight: 700, fontSize: 15 }}>JazzCash</div>
                      <div style={{ color: "#64748b", fontSize: 12 }}>Pay using your JazzCash mobile account</div>
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 6 }}>JazzCash Mobile Number</label>
                  <input className="pay-input" placeholder="03001234567"
                    maxLength={11}
                    value={mobileData.mobileNumber}
                    onChange={e => setMobileData({ ...mobileData, mobileNumber: e.target.value.replace(/\D/g, "") })} />
                </div>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 6 }}>CNIC Last 6 Digits</label>
                  <input className="pay-input" placeholder="123456"
                    maxLength={6} type="password"
                    value={mobileData.cnic}
                    onChange={e => setMobileData({ ...mobileData, cnic: e.target.value.replace(/\D/g, "") })} />
                </div>
                <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                  <p style={{ color: "#f59e0b", fontSize: 12 }}>
                    ⚠️ You will receive a confirmation SMS on your JazzCash number
                  </p>
                </div>
              </div>
            )}

            {/* EASYPAISA FIELDS */}
            {paymentMethod === "easypaisa" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 28 }}>💚</span>
                    <div>
                      <div style={{ color: "#10b981", fontWeight: 700, fontSize: 15 }}>Easypaisa</div>
                      <div style={{ color: "#64748b", fontSize: 12 }}>Pay using your Easypaisa mobile account</div>
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 6 }}>Easypaisa Mobile Number</label>
                  <input className="pay-input" placeholder="03001234567"
                    maxLength={11}
                    value={mobileData.mobileNumber}
                    onChange={e => setMobileData({ ...mobileData, mobileNumber: e.target.value.replace(/\D/g, "") })} />
                </div>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 6 }}>CNIC Last 6 Digits</label>
                  <input className="pay-input" placeholder="123456"
                    maxLength={6} type="password"
                    value={mobileData.cnic}
                    onChange={e => setMobileData({ ...mobileData, cnic: e.target.value.replace(/\D/g, "") })} />
                </div>
                <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                  <p style={{ color: "#10b981", fontSize: 12 }}>
                    ✅ You will receive a confirmation SMS on your Easypaisa number
                  </p>
                </div>
              </div>
            )}

            <button className="pay-btn" onClick={handlePayment} style={{ marginTop: 20 }}>
              Pay Rs. {order.totalAmount} →
            </button>

            <p style={{ color: "#334155", fontSize: 12, textAlign: "center", marginTop: 16 }}>
              🔒 Secure payment simulation • No real charges
            </p>
          </div>
        )}

        {/* PROCESSING STEP */}
        {step === "processing" && (
          <div style={{ textAlign: "center", padding: "40px 0", animation: "fadeIn 0.3s ease" }}>
            <div style={{
              width: 60, height: 60,
              border: "3px solid rgba(2,132,199,0.2)",
              borderTop: "3px solid #0284c7",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 24px",
            }} />
            <h3 style={{ color: "white", fontSize: 20, marginBottom: 8 }}>Processing Payment...</h3>
            <p style={{ color: "#64748b", fontSize: 14 }}>Please wait, do not close this window</p>
          </div>
        )}

        {/* SUCCESS STEP */}
        {step === "success" && (
          <div style={{ textAlign: "center", padding: "20px 0", animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h3 style={{ color: "#10b981", fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 8 }}>
              Payment Successful!
            </h3>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
              Your order has been confirmed
            </p>
            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "16px", marginBottom: 24 }}>
              <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>Transaction ID</div>
              <div style={{ color: "#10b981", fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>{transactionId}</div>
            </div>
            <button className="pay-btn" onClick={onSuccess}>
              Back to Dashboard →
            </button>
          </div>
        )}

        {/* FAILED STEP */}
        {step === "failed" && (
          <div style={{ textAlign: "center", padding: "20px 0", animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
            <h3 style={{ color: "#ef4444", fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 8 }}>
              Payment Failed!
            </h3>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>{error || "Something went wrong"}</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="pay-btn" onClick={() => { setStep("form"); setError(""); }}>
                Try Again
              </button>
              <button onClick={onCancel} style={{
                flex: 1, padding: 15, background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12,
                color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
