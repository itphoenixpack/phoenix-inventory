import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const AdminPanel = () => {
    const { user } = useAuth();
    const role = user?.role;

    const [products, setProducts] = useState([]);
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });

    const fetchData = async () => {
        try {
            const [prodRes, stockRes] = await Promise.all([
                api.get("/products"),
                api.get("/stock")
            ]);
            setProducts(prodRes.data);
            setStock(stockRes.data);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredStock = stock.filter(item =>
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStockCount = stock.filter(item => item.quantity < 20).length;

    return (
        <Layout>
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
                <header className="flex justify-between align-center mb-2">
                    <div>
                        <h1>Executive <span className="text-red">Overview</span></h1>
                        <p className="text-muted">Real-time intelligence across all warehouses and products.</p>
                    </div>
                </header>

                {message.text && (
                    <div className="card mb-2" style={{
                        backgroundColor: message.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(225, 29, 72, 0.1)",
                        borderColor: message.type === "success" ? "var(--success)" : "var(--accent)",
                        color: message.type === "success" ? "var(--success)" : "var(--accent)"
                    }}>
                        {message.text}
                    </div>
                )}

                <div className="flex gap-1 mb-2" style={{ flexWrap: "wrap" }}>
                    <div className="card" style={{ flex: 1, minWidth: "280px", borderLeft: "4px solid var(--primary)" }}>
                        <div className="flex justify-between align-center">
                            <span className="text-muted" style={{ fontSize: "0.85rem", fontWeight: 700 }}>TOTAL PRODUCTS</span>
                            <span style={{ fontSize: "1.5rem" }}>📦</span>
                        </div>
                        <p style={{ fontSize: "2.5rem", fontWeight: 800, margin: "0.5rem 0" }}>{products.length}</p>
                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>Active in current catalog</div>
                    </div>

                    <div className="card" style={{ flex: 1, minWidth: "280px", borderLeft: "4px solid var(--accent)" }}>
                        <div className="flex justify-between align-center">
                            <span className="text-muted" style={{ fontSize: "0.85rem", fontWeight: 700 }}>LOW STOCK ALERT</span>
                            <span style={{ fontSize: "1.5rem" }}>⚠️</span>
                        </div>
                        <p style={{ fontSize: "2.5rem", fontWeight: 800, margin: "0.5rem 0", color: lowStockCount > 0 ? "var(--accent)" : "inherit" }}>
                            {lowStockCount}
                        </p>
                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>Items below 20 unit threshold</div>
                    </div>

                    <div className="card" style={{ flex: 1, minWidth: "280px", borderLeft: "4px solid var(--success)" }}>
                        <div className="flex justify-between align-center">
                            <span className="text-muted" style={{ fontSize: "0.85rem", fontWeight: 700 }}>WAREHOUSE NODES</span>
                            <span style={{ fontSize: "1.5rem" }}>🏭</span>
                        </div>
                        <p style={{ fontSize: "2.5rem", fontWeight: 800, margin: "0.5rem 0" }}>2</p>
                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>Operational facilities</div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex justify-between align-center mb-2" style={{ flexWrap: "wrap", gap: "1rem" }}>
                        <h2>Live Inventory Stream</h2>
                        <div style={{ position: "relative", width: "300px" }}>
                            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search products or locations..."
                                style={{ paddingLeft: "36px" }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product Details</th>
                                    <th>Location</th>
                                    <th>Internal Code</th>
                                    <th>Available Qty</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ textAlign: "center", padding: "4rem" }}>
                                        <div className="text-muted">Synchronizing data stream...</div>
                                    </td></tr>
                                ) : filteredStock.length > 0 ? (
                                    filteredStock.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div style={{ fontWeight: 700 }}>{item.product_name}</div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>SKU: {item.product_sku}</div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: "0.25rem 0.6rem",
                                                    background: "var(--bg-main)",
                                                    borderRadius: "6px",
                                                    fontSize: "0.8rem",
                                                    fontWeight: 600
                                                }}>{item.warehouse_name}</span>
                                            </td>
                                            <td style={{ fontWeight: 700, color: "var(--primary)" }}>{item.shelf_code || "—"}</td>
                                            <td style={{ fontWeight: 800 }}>{item.quantity}</td>
                                            <td>
                                                <span style={{
                                                    padding: "0.4rem 0.8rem",
                                                    borderRadius: "20px",
                                                    fontSize: "0.7rem",
                                                    fontWeight: 800,
                                                    backgroundColor: 
                                                        item.quantity === 0 ? "rgba(225, 29, 72, 0.2)" :
                                                        item.quantity < 10 ? "rgba(225, 29, 72, 0.1)" :
                                                        item.quantity < 20 ? "rgba(234, 179, 8, 0.1)" : 
                                                        "rgba(16, 185, 129, 0.1)",
                                                    color: 
                                                        item.quantity === 0 ? "#ff0000" :
                                                        item.quantity < 10 ? "var(--accent)" :
                                                        item.quantity < 20 ? "var(--warning)" : 
                                                        "var(--success)",
                                                    border: `1px solid ${
                                                        item.quantity === 0 ? "#ff0000" :
                                                        item.quantity < 10 ? "var(--accent)" :
                                                        item.quantity < 20 ? "var(--warning)" : 
                                                        "var(--success)"
                                                    }`
                                                }}>
                                                    {item.quantity === 0 ? "OUT OF STOCK" :
                                                     item.quantity < 10 ? "REPLENISH" :
                                                     item.quantity < 20 ? "LOW" : "OPTIMAL"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" style={{ textAlign: "center", padding: "4rem" }}>
                                        <div className="text-muted">No records found matching your query.</div>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminPanel;
