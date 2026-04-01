import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import phoenixLogo from "../assets/phoenix-logo.png";
import inpackLogo from "../assets/inpack-logo.png";
import Navbar from "../components/Navbar";

const Register = () => {
    const navigate = useNavigate();
    const [company, setCompany] = useState((localStorage.getItem("company") || "phoenix").toLowerCase());
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
            localStorage.setItem("company", company);
            await api.post(
              "/auth/register",
              formData,
              { headers: { "x-company": company } }
            );
            toast.success("Personnel entry established. Access granted.");
            navigate("/");
        } catch (error) {
            setError(error.response?.data?.error || "Registry error. Entry rejected.");
        } finally {
            setLoading(false);
        }
    };

    const logoSrc = company === "inpack" ? inpackLogo : phoenixLogo;
    const companyName = company === "inpack" ? "Inpack" : "Phoenix";
    const isInpack = company === 'inpack';

    return (
        <div className={`theme-${company}`} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <Navbar company={company} />
            
            <main style={{
                flex: 1,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                backgroundColor: "var(--bg-main)",
                backgroundImage: isInpack
                    ? "radial-gradient(circle at 80% 20%, rgba(249, 115, 22, 0.05) 0%, transparent 100%)"
                    : "radial-gradient(circle at 80% 20%, rgba(29, 71, 155, 0.05) 0%, transparent 100%)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
            }}>
                {/* Technical Overlay */}
                <div className="dot-grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.1, pointerEvents: "none" }}></div>

                <div className="glass-card" style={{
                    width: "100%",
                    maxWidth: "500px",
                    padding: "3rem",
                    borderRadius: "32px",
                    position: "relative",
                    zIndex: 1,
                    border: "1px solid var(--border)",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)"
                }}>
                    {/* Security Badge */}
                    <div style={{
                        position: "absolute",
                        top: "-15px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: isInpack ? "var(--accent)" : "var(--primary)",
                        color: "white",
                        padding: "0.4rem 1.2rem",
                        borderRadius: "20px",
                        fontSize: "0.65rem",
                        fontWeight: 900,
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                        whiteSpace: "nowrap"
                    }}>
                        New Personnel Registry Request
                    </div>

                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                        <img src={logoSrc} alt="Brand" style={{
                            height: "60px",
                            marginBottom: "1rem",
                            objectFit: "contain"
                        }} />
                        <h1 style={{
                            margin: 0,
                            fontSize: "1.5rem",
                            fontWeight: 900,
                            color: "var(--text-main)",
                            letterSpacing: "-0.5px",
                            textTransform: "uppercase"
                        }}>
                             Establish <span style={{ color: "var(--accent)", fontWeight: 300 }}>Identity</span>
                        </h1>
                    </div>

                    <form onSubmit={handleRegister}>
                        {/* Premium Segmented Control */}
                        <div style={{
                            marginBottom: "2rem",
                            backgroundColor: "rgba(0,0,0,0.03)",
                            padding: "0.4rem",
                            borderRadius: "16px",
                            display: "flex",
                            position: "relative",
                            border: "1px solid var(--border)"
                        }}>
                            <div style={{
                                position: "absolute",
                                width: "calc(50% - 0.4rem)",
                                height: "calc(100% - 0.8rem)",
                                top: "0.4rem",
                                left: isInpack ? "50%" : "0.4rem",
                                backgroundColor: isInpack ? "var(--accent)" : "var(--primary)",
                                borderRadius: "12px",
                                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                boxShadow: isInpack ? "0 4px 12px rgba(249, 115, 22, 0.3)" : "0 4px 12px rgba(29, 71, 155, 0.2)",
                                zIndex: 0
                            }}></div>
                            
                            <button type="button" onClick={() => setCompany("phoenix")} style={{ flex: 1, background: "none", border: "none", padding: "0.7rem", color: !isInpack ? "white" : "var(--text-muted)", fontSize: "0.7rem", fontWeight: 800, cursor: "pointer", zIndex: 1 }}>PHOENIX SYSTEM</button>
                            <button type="button" onClick={() => setCompany("inpack")} style={{ flex: 1, background: "none", border: "none", padding: "0.7rem", color: isInpack ? "white" : "var(--text-muted)", fontSize: "0.7rem", fontWeight: 800, cursor: "pointer", zIndex: 1 }}>INPACK NODE</button>
                        </div>

                        {error && (
                            <div style={{ backgroundColor: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.2)", color: "#fb7185", padding: "0.7rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600, textAlign: "center", marginBottom: "1.5rem" }}>{error}</div>
                        )}

                        <div className="flex gap-1" style={{ marginBottom: "1.25rem" }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.6rem", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "1px" }}>LEGAL NAME</label>
                                <input type="text" name="name" placeholder="John R. Doe" onChange={handleChange} required style={{ height: "3.2rem", backgroundColor: "white", border: "1px solid var(--border)", color: "var(--text-main)", borderRadius: "12px", width: "100%", padding: "0 1rem" }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.6rem", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "1px" }}>ORGANIZATIONAL EMAIL</label>
                            <input type="email" name="email" placeholder="name@corporation.com" onChange={handleChange} required style={{ height: "3.2rem", backgroundColor: "white", border: "1px solid var(--border)", color: "var(--text-main)", borderRadius: "12px", width: "100%", padding: "0 1rem" }} />
                        </div>

                        <div style={{ marginBottom: "1.25rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.6rem", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "1px" }}>SECURITY PASSWORD</label>
                            <input type="password" name="password" placeholder="••••••••••••" onChange={handleChange} required style={{ height: "3.2rem", backgroundColor: "white", border: "1px solid var(--border)", color: "var(--text-main)", borderRadius: "12px", width: "100%", padding: "0 1rem" }} />
                        </div>

                        <div style={{ marginBottom: "2rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.6rem", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "1px" }}>CLEARANCE LEVEL</label>
                            <select name="role" onChange={handleChange} value={formData.role} style={{ height: "3.2rem", backgroundColor: "white", border: "1px solid var(--border)", color: "var(--text-main)", borderRadius: "12px", width: "100%", padding: "0 1rem" }}>
                                <option value="user">User Access</option>
                                <option value="admin">Admin Access</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: "100%",
                                height: "3.8rem",
                                borderRadius: "16px",
                                fontSize: "0.9rem",
                                fontWeight: 900,
                                textTransform: "uppercase",
                                letterSpacing: "1.5px",
                                background: isInpack ? "var(--accent)" : "var(--primary)",
                                boxShadow: isInpack ? "0 8px 30px rgba(249, 115, 22, 0.2)" : "0 8px 30px rgba(29, 71, 155, 0.2)",
                                transition: "all 0.3s ease",
                                color: "white",
                                border: "none",
                                cursor: "pointer"
                            }}
                            disabled={loading}
                        >
                            {loading ? "INITIALIZING..." : "FINALIZING REGISTRY"}
                        </button>
                    </form>

                    <footer style={{ textAlign: "center", marginTop: "2rem" }}>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            Already established? <Link to="/login" style={{ color: "var(--accent)", fontWeight: 800, textDecoration: "none" }}>Authorize Clearance</Link>
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default Register;
