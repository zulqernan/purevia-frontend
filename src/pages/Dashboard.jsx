import { useState, useEffect } from "react";
import Payment from "./Payment";
import Subscription from "./Subscription";

export default function Dashboard({ user, token, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [orderForm, setOrderForm] = useState({
    product: "500ml", quantity: 1, deliveryAddress: "", deliveryArea: "DHA"
  });
  const [orderMsg, setOrderMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showSubscription, setShowSubscription] = useState(false);

  const areas = ["DHA", "Clifton", "Gulshan", "PECHS", "Saddar", "North Nazimabad", "Nazimabad", "Federal B Area"];
  const prices = { "330ml": 25, "500ml": 40, "1.5L": 80, "19L": 250 };

  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("https://purevia-backend.vercel.app/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setOrders(data.orders);
    } catch (err) {
      console.log(err);
    }
  };

  const placeOrder = async () => {
    if (!orderForm.deliveryAddress) {
      setOrderMsg("Please enter delivery address");
      return;
    }
    setLoading(true);
    setOrderMsg("");
    try {
      const res = await fetch("https://purevia-backend.vercel.app/api/orders/place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderForm)
      });
      const data = await res.json();
      if (res.ok) {
        setOrderMsg("✅ Order placed! Go to My Orders to pay.");
        setOrderForm({ product: "500ml", quantity: 1, deliveryAddress: "", deliveryArea: "DHA" });
      } else {
        setOrderMsg(data.message || "Order failed");
      }
    } catch (err) {
      setOrderMsg("Server error");
    }
    setLoading(false);
  };

  const statusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      out_for_delivery: "#8b5cf6",
      delivered: "#10b981",
      cancelled: "#ef4444"
    };
    return colors[status] || "#64748b";
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
        .tab-btn {
          padding: 10px 20px;
          border: none;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.3s;
          color: #64748b;
        }
        .tab-btn.active { background: #0284c7; color: white; }
        .tab-btn:hover:not(.active) { background: #f0f9ff; color: #0284c7; }
      `}</style>

      {/* Payment Modal */}
      {showSubscription && (
  <Subscription
    token={token}
    onBack={() => setShowSubscription(false)}
  />
)}
      {showPayment && selectedOrder && (
        <Payment
          order={selectedOrder}
          token={token}
          onSuccess={() => {
            setShowPayment(false);
            setSelectedOrder(null);
            fetchOrders();
            setActiveTab("orders");
          }}
          onCancel={() => {
            setShowPayment(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* Navbar */}
      <nav style={{
        background: "linear-gradient(135deg, #020617, #0c1a3a)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>💧</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 20, color: "white", letterSpacing: 1 }}>PUREVIA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#94a3b8", fontSize: 14 }}>👋 {user?.name || "User"}</span>
          <button onClick={onLogout} style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171",
            padding: "8px 18px",
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        {/* Tabs */}
        <div style={{
          background: "white",
          borderRadius: 16,
          padding: "8px",
          display: "flex",
          gap: 4,
          marginBottom: 32,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          border: "1px solid #e0f2fe",
        }}>
          {[
            { id: "home", label: "🏠 Home" },
            { id: "order", label: "📦 Place Order" },
            { id: "orders", label: "📋 My Orders" },
            { id: "profile", label: "👤 Profile" },
            { id: "subscription", label: "📋 Subscription" },
          ].map(tab => (
            <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
          ))}
        </div>

        {/* HOME TAB */}
        {activeTab === "home" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#0c1a3a", marginBottom: 8 }}>
                Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋
              </h2>
              <p style={{ color: "#64748b", fontSize: 16 }}>What would you like to order today?</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
              {[
                { name: "330ml", label: "Pocket Pure", icon: "💧", price: 25 },
                { name: "500ml", label: "Classic Pure", icon: "🫙", price: 40 },
                { name: "1.5L", label: "Family Pure", icon: "🧴", price: 80 },
                { name: "19L", label: "Office Can", icon: "🪣", price: 250 },
              ].map(p => (
                <div key={p.name} style={{
                  background: "white",
                  borderRadius: 20,
                  padding: "28px 20px",
                  textAlign: "center",
                  border: "1px solid #e0f2fe",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "#0284c7"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#e0f2fe"; }}
                  onClick={() => { setOrderForm({ ...orderForm, product: p.name }); setActiveTab("order"); }}
                >
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{p.icon}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: "#0284c7" }}>{p.name}</div>
                  <div style={{ color: "#64748b", fontSize: 14, marginBottom: 8 }}>{p.label}</div>
                  <div style={{ color: "#0c1a3a", fontWeight: 700, fontSize: 18 }}>Rs. {p.price}</div>
                  <button style={{
                    marginTop: 16,
                    width: "100%",
                    padding: "10px",
                    background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                  }}>Order Now</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDER TAB */}
        {activeTab === "order" && (
          <div style={{ background: "white", borderRadius: 20, padding: "40px", border: "1px solid #e0f2fe", maxWidth: 600 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#0c1a3a", marginBottom: 24 }}>
              Place Your Order
            </h2>

            {orderMsg && (
              <div style={{
                background: orderMsg.includes("✅") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${orderMsg.includes("✅") ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                borderRadius: 10,
                padding: "12px 16px",
                color: orderMsg.includes("✅") ? "#10b981" : "#ef4444",
                marginBottom: 20,
                fontSize: 15,
              }}>{orderMsg}</div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", color: "#64748b", fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Select Product</label>
                <select className="input-field" value={orderForm.product}
                  onChange={e => setOrderForm({ ...orderForm, product: e.target.value })}>
                  {["330ml", "500ml", "1.5L", "19L"].map(p => (
                    <option key={p} value={p}>{p} — Rs. {prices[p]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", color: "#64748b", fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Quantity</label>
                <input type="number" min="1" className="input-field" value={orderForm.quantity}
                  onChange={e => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) })} />
              </div>

              <div>
                <label style={{ display: "block", color: "#64748b", fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Delivery Area</label>
                <select className="input-field" value={orderForm.deliveryArea}
                  onChange={e => setOrderForm({ ...orderForm, deliveryArea: e.target.value })}>
                  {areas.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", color: "#64748b", fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Delivery Address</label>
                <input type="text" placeholder="House no, Street, Area" className="input-field"
                  value={orderForm.deliveryAddress}
                  onChange={e => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })} />
              </div>

              <div style={{ background: "#f0f9ff", borderRadius: 12, padding: "16px 20px", border: "1px solid #bae6fd" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#64748b", fontSize: 15 }}>Total Amount</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: "#0284c7" }}>
                    Rs. {prices[orderForm.product] * orderForm.quantity}
                  </span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={loading}
                style={{
                  padding: "16px",
                  background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Placing Order..." : "Place Order 🚀"}
              </button>
            </div>
          </div>
        )}

        {/* MY ORDERS TAB */}
        {activeTab === "orders" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#0c1a3a", marginBottom: 24 }}>
              My Orders
            </h2>
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: 20, border: "1px solid #e0f2fe" }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>📦</div>
                <p style={{ color: "#64748b", fontSize: 16 }}>No orders yet. Place your first order!</p>
                <button onClick={() => setActiveTab("order")} style={{
                  marginTop: 20,
                  padding: "12px 28px",
                  background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                }}>Order Now</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {orders.map(order => (
                  <div key={order._id} style={{
                    background: "white",
                    borderRadius: 16,
                    padding: "24px",
                    border: "1px solid #e0f2fe",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#0c1a3a", marginBottom: 6 }}>
                          {order.product} × {order.quantity}
                        </div>
                        <div style={{ color: "#64748b", fontSize: 14 }}>📍 {order.deliveryArea} — {order.deliveryAddress}</div>
                        <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                          {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: "#0284c7" }}>
                          Rs. {order.totalAmount}
                        </div>
                        <div style={{
                          display: "inline-block",
                          marginTop: 8,
                          padding: "4px 14px",
                          background: `${statusColor(order.status)}20`,
                          border: `1px solid ${statusColor(order.status)}40`,
                          borderRadius: 50,
                          fontSize: 12,
                          fontWeight: 600,
                          color: statusColor(order.status),
                          textTransform: "capitalize",
                        }}>{order.status.replace("_", " ")}</div>

                        {/* Payment Status */}
                        <div style={{ marginTop: 8 }}>
                          {order.paymentStatus === "paid" ? (
                            <span style={{
                              display: "inline-block",
                              padding: "4px 14px",
                              background: "rgba(16,185,129,0.1)",
                              border: "1px solid rgba(16,185,129,0.3)",
                              borderRadius: 50,
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#10b981",
                            }}>✅ Paid</span>
                          ) : (
                            <button
                              onClick={() => { setSelectedOrder(order); setShowPayment(true); }}
                              style={{
                                padding: "6px 16px",
                                background: "linear-gradient(135deg, #10b981, #059669)",
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 600,
                                fontSize: 13,
                              }}
                            >💳 Pay Now</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div style={{ background: "white", borderRadius: 20, padding: "40px", border: "1px solid #e0f2fe", maxWidth: 500 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{
                width: 80, height: 80,
                background: "linear-gradient(135deg, #0284c7, #38bdf8)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Playfair Display', serif",
                fontSize: 32,
                fontWeight: 800,
                color: "white",
                margin: "0 auto 16px",
              }}>{user?.name?.[0] || "U"}</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#0c1a3a" }}>{user?.name}</h2>
              <p style={{ color: "#64748b", fontSize: 14 }}>{user?.email}</p>
            </div>

            {[
              { label: "Phone", value: user?.phone || "Not provided", icon: "📞" },
              { label: "Address", value: user?.address || "Not provided", icon: "📍" },
              { label: "Account Type", value: user?.role || "customer", icon: "👤" },
            ].map(item => (
              <div key={item.label} style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 0",
                borderBottom: "1px solid #f0f9ff",
              }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>{item.label}</div>
                  <div style={{ color: "#0c1a3a", fontWeight: 500, fontSize: 15, marginTop: 2 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === "subscription" && (
          <Subscription token={token} onBack={() => setActiveTab("home")} />
        )}
      </div>
    </div>
  );
}
