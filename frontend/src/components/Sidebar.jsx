import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const role = user?.role;

    const adminLinks = [
        { path: "/admin", label: "Analytics", icon: "📊" },
        { path: "/admin/products", label: "Catalog", icon: "📦" },
        { path: "/admin/stock", label: "Inventory", icon: "🔄" },
        { path: "/admin/stock/updates", label: "Updates", icon: "📥" },
        { path: "/admin/users", label: "Users", icon: "👥" },
    ];

    const userLinks = [
        { path: "/user/analytics", label: "Analytics", icon: "📊" },
        { path: "/user", label: "Warehouse", icon: "🏠" },
        { path: "/admin/products", label: "Catalog", icon: "📦" },
        { path: "/user/stock", label: "Updates", icon: "📥" },
    ];

    const links = role === "admin" ? adminLinks : userLinks;

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <aside className="sidebar" style={{
            width: "280px",
            backgroundColor: "white",
            borderRight: "1px solid var(--border)",
            minHeight: "calc(100vh - 73px)",
            padding: "2rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
        }}>
            <div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {links.map((link) => (
                        <li key={link.path} style={{ marginBottom: "0.25rem" }}>
                            <Link
                                to={link.path}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    padding: "0.85rem 1.25rem",
                                    borderRadius: "var(--radius-md)",
                                    color: location.pathname === link.path ? "white" : "var(--text-muted)",
                                    backgroundColor: location.pathname === link.path ? "var(--primary)" : "transparent",
                                    transition: "var(--transition)",
                                    textDecoration: "none",
                                    fontWeight: 600
                                }}
                            >
                                <span style={{ fontSize: "1.2rem" }}>{link.icon}</span>
                                <span>{link.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{ paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
                <button
                    onClick={handleLogout}
                    className="secondary"
                    style={{ width: "100%", justifyContent: "flex-start", gap: "1rem" }}
                >
                    <span>🚪</span>
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
