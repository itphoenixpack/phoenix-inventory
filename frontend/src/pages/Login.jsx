import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import logo from "../assets/logo.png";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });

      login({
        token: res.data.token,
        role: res.data.role,
        name: res.data.name
      });

      if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (error) {
      setError("Credentials verification failed. Please check your data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{
        height: "calc(100vh - 73px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--primary)",
        backgroundImage: "linear-gradient(135deg, var(--primary) 0%, #0c1a3d 100%)",
        padding: "1rem"
      }}>
        <div className="card" style={{ width: "100%", maxWidth: "440px", padding: "3rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <img src={logo} alt="Phoenix Logo" style={{ height: "70px", marginBottom: "1.5rem", objectFit: "contain" }} />
            <h1 style={{ marginBottom: "0.5rem", fontSize: "1.75rem", color: "var(--primary)", letterSpacing: "-1px" }}>
              PHOENIX <span style={{ color: "var(--accent)", fontWeight: 400 }}>SYSTEMS</span>
            </h1>
            <p className="text-muted" style={{ fontSize: "0.95rem" }}>Corporate Logistics Gateway</p>
          </div>

          {error && (
            <div className="card mb-2" style={{
              backgroundColor: "rgba(225, 29, 72, 0.1)",
              borderColor: "var(--accent)",
              color: "var(--accent)",
              padding: "0.8rem",
              fontSize: "0.85rem",
              fontWeight: 600
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>EMAIL IDENTIFICATION</label>
              <input
                type="email"
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>SECURITY KEY</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              style={{ width: "100%", height: "3.5rem" }}
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Authorize Access"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              Need a secure account? <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>Request Access</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
