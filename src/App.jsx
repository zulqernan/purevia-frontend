import { useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("token", userToken);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    setCurrentPage("login");
  };

  if (token && currentPage !== "dashboard") {
    setCurrentPage("dashboard");
  }

  return (
    <div>
      {currentPage === "login" && (
        <Login onLogin={handleLogin} onGoSignup={() => setCurrentPage("signup")} />
      )}
      {currentPage === "signup" && (
        <Signup onSignup={handleLogin} onGoLogin={() => setCurrentPage("login")} />
      )}
      {currentPage === "dashboard" && user?.role === "admin" && (
        <AdminDashboard token={token} onLogout={handleLogout} />
      )}
      {currentPage === "dashboard" && user?.role !== "admin" && (
        <Dashboard user={user} token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;