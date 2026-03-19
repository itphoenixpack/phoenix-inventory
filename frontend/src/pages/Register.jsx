import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import logo from "../assets/logo.png";
import Navbar from "../components/Navbar";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user"
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("/auth/register", formData);
            alert("Registration successful! Authentication established.");
            navigate("/");
        } catch (error) {
            setError(error.response?.data?.error || "Registry error. Access denied.");
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
                <div className="card" style={{ width: "100%", maxWidth: "480px", padding: "3rem" }}>
                    <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                        <img src={logo} alt="Phoenix Logo" style={{ height: "60px", marginBottom: "1.25rem", objectFit: "contain" }} />
                        <h1 style={{ marginBottom: "0.5rem", fontSize: "1.75rem", color: "var(--primary)", letterSpacing: "-1px" }}>
                            PHOENIX <span style={{ color: "var(--accent)", fontWeight: 400 }}>SYSTEMS</span>
                        </h1>
                        <p className="text-muted" style={{ fontSize: "0.95rem" }}>Establish corporate identity for Phoenix Systems</p>
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

                    <form onSubmit={handleRegister}>
                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>FULL LEGAL NAME</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="John R. Doe"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>ORGANIZATIONAL EMAIL</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@organization.com"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>SECURITY PASSWORD</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••••••"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: "2rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>ACCESS LEVEL</label>
                            <select name="role" onChange={handleChange} value={formData.role}>
                                <option value="user">Standard Registry Access (Staff)</option>
                                <option value="admin">Executive Oversight (Admin)</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            style={{ width: "100%", height: "3.5rem" }}
                            disabled={loading}
                        >
                            {loading ? "Establishing Identity..." : "Finalize Registration"}
                        </button>
                    </form>

                    <div style={{ textAlign: "center", marginTop: "2rem" }}>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                            Already established? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>Authorize Here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;
