import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export default function AdminDashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalUsers: 0, pendingOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  

  useEffect(() => {
    fetchOrders();
    fetchUsers();
    fetchSubscriptions();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("https://purevia-backend.vercel.app/api/orders/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders);
        const totalRevenue = data.orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const pendingOrders = data.orders.filter(o => o.status === "pending").length;
        setStats(prev => ({ ...prev, totalOrders: data.orders.length, totalRevenue, pendingOrders }));
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };
const fetchSubscriptions = async () => {
  try {
    const res = await fetch("https://purevia-backend.vercel.app/api/subscriptions/all", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setSubscriptions(data.subscriptions);
  } catch (err) {
    console.log(err);
  }
};
const getAnalytics = () => {
  // Orders by product
  const productCount = {};
  orders.forEach(o => {
    productCount[o.product] = (productCount[o.product] || 0) + o.quantity;
  });
  const productData = Object.entries(productCount).map(([name, value]) => ({ name, value }));

  // Orders by status
  const statusCount = {};
  orders.forEach(o => {
    statusCount[o.status] = (statusCount[o.status] || 0) + 1;
  });
  const statusData = Object.entries(statusCount).map(([name, value]) => ({ name: name.replace("_", " "), value }));

  // Revenue by day (last 7 days)
  const revenueByDay = {};
  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
  });
  last7.forEach(day => revenueByDay[day] = 0);
  orders.forEach(o => {
    const day = new Date(o.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
    if (revenueByDay[day] !== undefined) revenueByDay[day] += o.totalAmount;
  });
  const revenueData = Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue }));

  return { productData, statusData, revenueData };
};
  const fetchUsers = async () => {
    try {
      const res = await fetch("https://purevia-backend.vercel.app/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setStats(prev => ({ ...prev, totalUsers: data.users.filter(u => u.role !== 'admin').length }));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`https://purevia-backend.vercel.app/api/orders/status/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.log(err);
    }
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
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
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
        .tab-btn:hover:not(.active) { background: rgba(255,255,255,0.05); color: #94a3b8; }
        .status-select {
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          cursor: pointer;
          outline: none;
        }
        .status-select option { background: #1e293b; color: white; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        background: "rgba(255,255,255,0.03)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>💧</span>
          <div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 20, color: "white" }}>PUREVIA</span>
            <span style={{
              marginLeft: 10,
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
              padding: "3px 10px",
              borderRadius: 50,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
            }}>ADMIN</span>
          </div>
        </div>
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
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

        {/* Tabs */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: 12,
          padding: "6px",
          display: "flex",
          gap: 4,
          marginBottom: 32,
          border: "1px solid rgba(255,255,255,0.06)",
          width: "fit-content",
        }}>
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "orders", label: "📦 Orders" },
            { id: "users", label: "👥 Users" },
            { id: "subscriptions", label: "📋 Subscriptions" },
          ].map(tab => (
            <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div>
            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 40 }}>
              {[
                { label: "Total Orders", value: stats.totalOrders, icon: "📦", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
                { label: "Total Revenue", value: `Rs. ${stats.totalRevenue.toLocaleString()}`, icon: "💰", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
                { label: "Total Customers", value: stats.totalUsers, icon: "👥", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
                { label: "Pending Orders", value: stats.pendingOrders, icon: "⏳", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: stat.bg,
                  border: `1px solid ${stat.color}25`,
                  borderRadius: 16,
                  padding: "24px",
                  transition: "all 0.3s",
                }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{stat.icon}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
{/* Analytics Charts */}
{(() => {
  const { productData, statusData, revenueData } = getAnalytics();
  return (
    <div style={{ marginBottom: 32 }}>
      {/* Revenue Chart */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: "24px",
        marginBottom: 20,
      }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: 18, marginBottom: 20 }}>
          📈 Revenue Last 7 Days
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#475569" fontSize={12} />
            <YAxis stroke="#475569" fontSize={12} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} />
            <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={2} dot={{ fill: "#0284c7" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Products Chart */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
          padding: "24px",
        }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: 18, marginBottom: 20 }}>
            🏆 Orders by Product
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={productData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#475569" fontSize={12} />
              <YAxis stroke="#475569" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} />
              <Bar dataKey="value" fill="#0284c7" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Chart */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
          padding: "24px",
        }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: 18, marginBottom: 20 }}>
            📦 Orders by Status
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, value}) => `${name}: ${value}`}>
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={["#0284c7","#10b981","#f59e0b","#8b5cf6","#ef4444"][index % 5]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
})()}
            {/* Recent Orders */}
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              overflow: "hidden",
            }}>
              
              <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: 18 }}>Recent Orders</h3>
              </div>
              {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading...</div>
              ) : orders.slice(0, 5).map(order => (
                <div key={order._id} style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}>
                  <div>
                    <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 15 }}>{order.product} × {order.quantity}</div>
                    <div style={{ color: "#475569", fontSize: 13, marginTop: 2 }}>📍 {order.deliveryArea}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ color: "#10b981", fontWeight: 700, fontSize: 16 }}>Rs. {order.totalAmount}</span>
                    <span style={{
                      padding: "4px 12px",
                      background: `${statusColor(order.status)}20`,
                      border: `1px solid ${statusColor(order.status)}40`,
                      borderRadius: 50,
                      fontSize: 12,
                      color: statusColor(order.status),
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}>{order.status.replace("_", " ")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "white", marginBottom: 24 }}>
              All Orders ({orders.length})
            </h2>
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#475569" }}>No orders yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {orders.map(order => (
                  <div key={order._id} style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 14,
                    padding: "20px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 16,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>{order.product} × {order.quantity}</span>
                        <span style={{
                          padding: "3px 10px",
                          background: `${statusColor(order.status)}20`,
                          border: `1px solid ${statusColor(order.status)}40`,
                          borderRadius: 50,
                          fontSize: 11,
                          color: statusColor(order.status),
                          fontWeight: 700,
                          textTransform: "capitalize",
                        }}>{order.status.replace("_", " ")}</span>
                      </div>
                      <div style={{ color: "#475569", fontSize: 13 }}>📍 {order.deliveryArea} — {order.deliveryAddress}</div>
                      <div style={{ color: "#334155", fontSize: 12, marginTop: 4 }}>
                        {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: "#10b981" }}>
                        Rs. {order.totalAmount}
                      </span>
                      <select
                        className="status-select"
                        value={order.status}
                        onChange={e => updateOrderStatus(order._id, e.target.value)}
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="confirmed">✅ Confirmed</option>
                        <option value="out_for_delivery">🚚 Out for Delivery</option>
                        <option value="delivered">📦 Delivered</option>
                        <option value="cancelled">❌ Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "white", marginBottom: 24 }}>
              All Customers ({users.filter(u => u.role !== 'admin').length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {users.filter(u => u.role !== 'admin').map(user => (
                <div key={user._id} style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14,
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}>
                  <div style={{
                    width: 48, height: 48,
                    background: "linear-gradient(135deg, #0284c7, #38bdf8)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 20,
                    fontWeight: 800,
                    color: "white",
                    flexShrink: 0,
                  }}>{user.name?.[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "white", fontWeight: 600, fontSize: 16 }}>{user.name}</div>
                    <div style={{ color: "#475569", fontSize: 13 }}>{user.email}</div>
                    {user.phone && <div style={{ color: "#334155", fontSize: 12 }}>📞 {user.phone}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#334155", fontSize: 12 }}>
                      Joined {new Date(user.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <span style={{
                      display: "inline-block",
                      marginTop: 6,
                      padding: "3px 10px",
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.3)",
                      borderRadius: 50,
                      fontSize: 11,
                      color: "#10b981",
                      fontWeight: 600,
                    }}>Customer</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "subscriptions" && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "white", marginBottom: 24 }}>
              All Subscriptions ({subscriptions.filter(s => s.status === "active").length} Active)
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {subscriptions.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: "#475569" }}>No subscriptions yet</div>
              ) : subscriptions.map(sub => (
                <div key={sub._id} style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14,
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 16,
                }}>
                  <div>
                    <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>{sub.planName} Plan</div>
                    <div style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>📍 {sub.deliveryArea} — {sub.deliveryAddress}</div>
                    <div style={{ color: "#334155", fontSize: 12, marginTop: 4 }}>{sub.cans} cans/month</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: "#10b981" }}>
                      Rs. {sub.price?.toLocaleString()}/month
                    </div>
                    <span style={{
                      display: "inline-block",
                      marginTop: 6,
                      padding: "3px 10px",
                      background: sub.status === "active" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                      border: `1px solid ${sub.status === "active" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                      borderRadius: 50,
                      fontSize: 11,
                      color: sub.status === "active" ? "#10b981" : "#ef4444",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}>{sub.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
