import { useState } from "react";
import Payment from "./Payment";

const PRODUCTS = [
  { id: "330ml", name: "330ml", label: "Pocket Pure", icon: "💧", price: 25, desc: "Perfect for on-the-go" },
  { id: "500ml", name: "500ml", label: "Classic Pure", icon: "🥤", price: 40, desc: "Our bestseller" },
  { id: "1.5L", name: "1.5L", label: "Family Pure", icon: "🧊", price: 80, desc: "Great for families" },
  { id: "19L", name: "19L", label: "Office Can", icon: "🫧", price: 250, desc: "For offices & homes" },
];

export default function Cart({ token, onBack, deliveryArea = "DHA" }) {
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [selectedArea, setSelectedArea] = useState(deliveryArea);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [activeView, setActiveView] = useState("shop"); // shop, cart, payment

  const areas = ["DHA", "Clifton", "Gulshan", "PECHS", "Saddar", "North Nazimabad", "Nazimabad", "Federal B Area"];

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === productId);
      if (existing?.quantity === 1) {
        return prev.filter(i => i.id !== productId);
      }
      return prev.map(i => i.id === productId ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const getQuantity = (productId) => {
    return cart.find(i => i.id === productId)?.quantity || 0;
  };

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  const placeOrders = async () => {
    if (!deliveryAddress) {
      setMsg("Please enter delivery address");
      return;
    }
    if (cart.length === 0) {
      setMsg("Cart is empty!");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      // Place separate order for each cart item
      const promises = cart.map(item =>
        fetch("https://purevia-backend.vercel.app/api/orders/place", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            product: item.id,
            quantity: item.quantity,
            deliveryAddress,
            deliveryArea: selectedArea,
          })
        })
      );

      const responses = await Promise.all(promises);
      const allOk = responses.every(r => r.ok);

      if (allOk) {
        const data = await responses[0].json();
        setOrderPlaced(data.order);
        setActiveView("success");
        setCart([]);
      } else {
        setMsg("Some orders failed. Please try again.");
      }
    } catch (err) {
      setMsg("Server error. Please try again.");
    }

    setLoading(false);
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
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #020617, #0c1a3a)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: 22, fontWeight: 800 }}>
            💧 PUREVIA Shop
          </h1>
        </div>

        {/* Cart button */}
        <button
          onClick={() => setActiveView(activeView === "cart" ? "shop" : "cart")}
          style={{
            background: totalItems > 0 ? "linear-gradient(135deg, #0284c7, #0ea5e9)" : "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            padding: "10px 20px",
            borderRadius: 50,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.3s",
          }}
        >
          🛒 Cart
          {totalItems > 0 && (
            <span style={{
              background: "#ef4444",
              color: "white",
              borderRadius: "50%",
              width: 22, height: 22,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800,
            }}>{totalItems}</span>
          )}
        </button>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {/* SHOP VIEW */}
        {activeView === "shop" && (
          <div className="fade-in">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#0c1a3a", marginBottom: 8 }}>
              Our Products
            </h2>
            <p style={{ color: "#64748b", fontSize: 15, marginBottom: 32 }}>Add items to your cart and order all at once!</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
              {PRODUCTS.map(product => (
                <div key={product.id} style={{
                  background: "white",
                  borderRadius: 20,
                  padding: "28px 20px",
                  border: getQuantity(product.id) > 0 ? "2px solid #0284c7" : "1px solid #e0f2fe",
                  boxShadow: getQuantity(product.id) > 0 ? "0 8px 30px rgba(2,132,199,0.15)" : "0 2px 10px rgba(0,0,0,0.04)",
                  transition: "all 0.3s",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>{product.icon}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: "#0284c7", marginBottom: 4 }}>
                    {product.name}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 13, marginBottom: 4 }}>{product.label}</div>
                  <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 16 }}>{product.desc}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: "#0c1a3a", marginBottom: 20 }}>
                    Rs. {product.price}
                  </div>

                  {/* Add/Remove buttons */}
                  {getQuantity(product.id) === 0 ? (
                    <button
                      onClick={() => addToCart(product)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
                        color: "white",
                        border: "none",
                        borderRadius: 12,
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: 15,
                        transition: "all 0.3s",
                      }}
                    >+ Add to Cart</button>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        style={{
                          width: 40, height: 40,
                          background: "#f0f9ff",
                          border: "2px solid #0284c7",
                          borderRadius: "50%",
                          cursor: "pointer",
                          fontSize: 20,
                          color: "#0284c7",
                          fontWeight: 800,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >−</button>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: "#0284c7", minWidth: 30, textAlign: "center" }}>
                        {getQuantity(product.id)}
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        style={{
                          width: 40, height: 40,
                          background: "#0284c7",
                          border: "none",
                          borderRadius: "50%",
                          cursor: "pointer",
                          fontSize: 20,
                          color: "white",
                          fontWeight: 800,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >+</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Floating cart button */}
            {totalItems > 0 && (
              <div style={{
                position: "fixed",
                bottom: 30, left: "50%",
                transform: "translateX(-50%)",
                zIndex: 100,
              }}>
                <button
                  onClick={() => setActiveView("cart")}
                  style={{
                    background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
                    color: "white",
                    border: "none",
                    padding: "16px 40px",
                    borderRadius: 50,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    boxShadow: "0 8px 30px rgba(2,132,199,0.4)",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  🛒 View Cart ({totalItems} items) — Rs. {totalAmount}
                </button>
              </div>
            )}
          </div>
        )}

        {/* CART VIEW */}
        {activeView === "cart" && (
          <div className="fade-in">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
              <button onClick={() => setActiveView("shop")} style={{
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                color: "#0284c7",
                padding: "8px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: 14,
              }}>← Continue Shopping</button>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#0c1a3a" }}>
                Your Cart
              </h2>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: 20, border: "1px solid #e0f2fe" }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
                <p style={{ color: "#64748b", fontSize: 16, marginBottom: 20 }}>Your cart is empty!</p>
                <button onClick={() => setActiveView("shop")} style={{
                  padding: "12px 28px",
                  background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                }}>Shop Now</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
                {/* Cart Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {cart.map(item => (
                    <div key={item.id} style={{
                      background: "white",
                      borderRadius: 16,
                      padding: "20px 24px",
                      border: "1px solid #e0f2fe",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <span style={{ fontSize: 36 }}>{item.icon}</span>
                        <div>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#0c1a3a" }}>{item.name}</div>
                          <div style={{ color: "#64748b", fontSize: 13 }}>{item.label}</div>
                          <div style={{ color: "#0284c7", fontWeight: 700, fontSize: 15, marginTop: 4 }}>Rs. {item.price} each</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button onClick={() => removeFromCart(item.id)} style={{
                          width: 36, height: 36,
                          background: "#f0f9ff",
                          border: "2px solid #0284c7",
                          borderRadius: "50%",
                          cursor: "pointer",
                          fontSize: 18,
                          color: "#0284c7",
                          fontWeight: 800,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>−</button>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: "#0c1a3a", minWidth: 24, textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <button onClick={() => addToCart(item)} style={{
                          width: 36, height: 36,
                          background: "#0284c7",
                          border: "none",
                          borderRadius: "50%",
                          cursor: "pointer",
                          fontSize: 18,
                          color: "white",
                          fontWeight: 800,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>+</button>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 800, color: "#0284c7", minWidth: 80, textAlign: "right" }}>
                          Rs. {item.price * item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div style={{
                  background: "white",
                  borderRadius: 20,
                  padding: "28px",
                  border: "1px solid #e0f2fe",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  position: "sticky",
                  top: 20,
                }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0c1a3a", marginBottom: 20 }}>
                    Order Summary
                  </h3>

                  {cart.map(item => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ color: "#64748b", fontSize: 14 }}>{item.name} × {item.quantity}</span>
                      <span style={{ color: "#0c1a3a", fontWeight: 600, fontSize: 14 }}>Rs. {item.price * item.quantity}</span>
                    </div>
                  ))}

                  <div style={{ borderTop: "1px solid #e0f2fe", marginTop: 16, paddingTop: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ color: "#64748b", fontSize: 14 }}>Delivery</span>
                      <span style={{ color: "#10b981", fontWeight: 600, fontSize: 14 }}>FREE</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                      <span style={{ fontWeight: 700, color: "#0c1a3a", fontSize: 16 }}>Total</span>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: "#0284c7" }}>
                        Rs. {totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", color: "#64748b", fontSize: 13, marginBottom: 6 }}>Delivery Area</label>
                      <select className="input-field" value={selectedArea} onChange={e => setSelectedArea(e.target.value)}>
                        {areas.map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", color: "#64748b", fontSize: 13, marginBottom: 6 }}>Delivery Address</label>
                      <input type="text" placeholder="House no, Street, Area" className="input-field"
                        value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)} />
                    </div>
                  </div>

                  {msg && (
                    <div style={{
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      color: "#ef4444",
                      fontSize: 13,
                      marginTop: 12,
                    }}>{msg}</div>
                  )}

                  <button
                    onClick={placeOrders}
                    disabled={loading}
                    style={{
                      width: "100%",
                      marginTop: 20,
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
                    {loading ? "Placing Orders..." : "Place Order 🚀"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUCCESS VIEW */}
        {activeView === "success" && (
          <div className="fade-in" style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>🎉</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: "#0c1a3a", marginBottom: 16 }}>
              Orders Placed!
            </h2>
            <p style={{ color: "#64748b", fontSize: 16, marginBottom: 40 }}>
              Your orders have been placed successfully. Check My Orders for status updates!
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => setActiveView("shop")} style={{
                padding: "14px 32px",
                background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
                color: "white",
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 15,
              }}>Continue Shopping</button>
              <button onClick={onBack} style={{
                padding: "14px 32px",
                background: "#f0f9ff",
                color: "#0284c7",
                border: "1px solid #bae6fd",
                borderRadius: 12,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 15,
              }}>Go to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
