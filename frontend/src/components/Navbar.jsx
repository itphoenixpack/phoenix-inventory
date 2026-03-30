import logo from "../assets/logo.png";

import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const isAuthenticated = !!user;
  const role = user?.role;
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get("/notifications");
          setNotifications(res.data);
        } catch (error) {
          console.error("Failed to fetch notifications", error);
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, role]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  return (
    <nav className="navbar" style={{
      padding: "0.75rem 2rem",
      backgroundColor: "var(--bg-card)",
      boxShadow: "var(--shadow-premium)",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      borderBottom: "1px solid var(--border)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div className="flex align-center gap-1">
        <img src={logo} alt="Phoenix Logo" style={{ height: "45px", objectFit: "contain" }} />
        <div style={{ height: "30px", width: "1px", backgroundColor: "var(--border)", margin: "0 0.5rem" }}></div>
        <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.5px" }}>
          PHOENIX <span style={{ color: "var(--accent)", fontWeight: 400 }}>SYSTEMS</span>
        </h2>
      </div>

      <div className="flex align-center gap-1">
        {!isAuthenticated ? (
          <div className="flex gap-1">
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>SIGN IN</Link>
            <div style={{ width: "1px", height: "15px", backgroundColor: "var(--border)" }}></div>
            <Link to="/register" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>REGISTER</Link>
          </div>
        ) : (
          <>
            <div style={{ position: "relative" }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ 
                  background: "none", 
                  border: "none", 
                  fontSize: "1.2rem", 
                  cursor: "pointer",
                  position: "relative",
                  padding: "0.5rem"
                }}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    background: "var(--accent)",
                    color: "white",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "0.7rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    border: "2px solid var(--bg-card)"
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="card" style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  width: "320px",
                  maxHeight: "400px",
                  overflowY: "auto",
                  zIndex: 1100,
                  padding: "1rem",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  marginTop: "0.5rem"
                }}>
                  <h3 style={{ fontSize: "0.9rem", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>Notifications</h3>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>No updates available.</p>
                  ) : (
                    <div className="flex flex-column gap-1">
                      {notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => markAsRead(n.id)}
                          style={{ 
                            fontSize: "0.8rem", 
                            padding: "0.5rem", 
                            borderRadius: "4px",
                            backgroundColor: n.is_read ? "transparent" : "rgba(225, 29, 72, 0.05)",
                            borderLeft: n.is_read ? "none" : "3px solid var(--accent)",
                            cursor: "pointer"
                          }}
                        >
                          <div style={{ color: "var(--text-main)", fontWeight: n.is_read ? 400 : 700 }}>{n.message}</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                            {new Date(n.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ textAlign: "right", marginRight: "0.5rem" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{role === 'admin' ? 'Administrator' : 'Inventory Staff'}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Active Session</div>
            </div>
            
            <button 
              onClick={handleLogout}
              style={{
                background: "var(--bg-main)",
                border: "1px solid var(--border)",
                padding: "0.4rem 0.8rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "var(--transition)"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "var(--border)"}
              onMouseOut={(e) => e.target.style.backgroundColor = "var(--bg-main)"}
            >
              SIGN OUT
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
