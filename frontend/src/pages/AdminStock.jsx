import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const AdminStock = () => {
    const { user } = useAuth();
    const role = user?.role;

    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [editingItem, setEditingItem] = useState(null);
    const [editData, setEditData] = useState({ quantity: 0, shelf_code: "" });

    const fetchStock = async () => {
        try {
            const res = await api.get("/stock");
            setStock(res.data);
        } catch (error) {
            console.error("Error fetching stock:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStock();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this item from the warehouse registry?")) return;
        try {
            await api.delete(`/stock/${id}`);
            fetchStock();
        } catch (error) {
            alert("Failed to delete stock record.");
        }
    };

    const handleEditClick = (item) => {
        setEditingItem(item);
        setEditData({ quantity: item.quantity, shelf_code: item.shelf_code || "" });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/stock/${editingItem.id}`, editData);
            setEditingItem(null);
            fetchStock();
        } catch (error) {
            alert("Failed to update stock record.");
        }
    };

    const filteredStock = stock.filter(item =>
        (item.product_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.product_sku?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const warehouse2Stock = filteredStock.filter(item => item.warehouse_name === "Warehouse 2");
    const warehouse3Stock = filteredStock.filter(item => item.warehouse_name === "Warehouse 3");

    const StockTable = ({ data, warehouseName }) => (
        <div className="card mb-2" style={{ borderTop: `4px solid ${warehouseName === "Warehouse 2" ? "var(--primary)" : "var(--accent)"}` }}>
            <div className="flex justify-between align-center mb-2">
                <h2>{warehouseName} <span className="text-muted" style={{ fontSize: "1rem", fontWeight: 400 }}>— Assets Registry</span></h2>
                <span style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "white",
                    background: "var(--primary)",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "20px"
                }}>
                    {data.length} LINE ITEMS
                </span>
            </div>
            <div style={{ overflowX: "auto" }}>
                <table>
                    <thead>
                        <tr>
                            <th>Product Detail</th>
                            <th>Reference SKU</th>
                            <th>Storage Code</th>
                            <th>Current Level</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((item) => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: 700 }}>{item.product_name}</td>
                                    <td><code style={{ background: "var(--bg-main)", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>{item.product_sku || "N/A"}</code></td>
                                    <td style={{ fontWeight: 800, color: "var(--primary)" }}>{item.shelf_code || "—"}</td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                    <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>{item.quantity}</span>
                                                    <div style={{
                                                        width: "100px",
                                                        height: "6px",
                                                        background: "var(--bg-main)",
                                                        borderRadius: "3px",
                                                        overflow: "hidden"
                                                    }}>
                                                        <div style={{
                                                            width: `${Math.min((item.quantity / 100) * 100, 100)}%`,
                                                            height: "100%",
                                                            background: 
                                                                item.quantity === 0 ? "#ff0000" :
                                                                item.quantity < 10 ? "var(--accent)" :
                                                                item.quantity < 20 ? "var(--warning)" : 
                                                                "var(--success)"
                                                        }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <span style={{
                                                padding: "0.3rem 0.6rem",
                                                borderRadius: "15px",
                                                fontSize: "0.65rem",
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
                                                {item.quantity === 0 ? "OUT" :
                                                 item.quantity < 10 ? "REPLENISH" :
                                                 item.quantity < 20 ? "LOW" : "OPTIMAL"}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        {role === "admin" && (
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    className="btn-sm"
                                                    onClick={() => handleEditClick(item)}
                                                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn-sm"
                                                    onClick={() => handleDelete(item.id)}
                                                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", backgroundColor: "var(--accent)" }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{ textAlign: "center", padding: "3rem" }}>
                                <div className="text-muted">Empty inventory for this facility.</div>
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <Layout>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <header className="flex justify-between align-center mb-2" style={{ flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <h1>Global <span className="text-red">Distribution</span></h1>
                        <p className="text-muted">Full transparency across Warehouse 2 and Warehouse 3 ecosystems.</p>
                    </div>
                    <div style={{ position: "relative", width: "300px" }}>
                        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Filter global inventory..."
                            style={{ paddingLeft: "36px" }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {loading ? (
                    <div className="card" style={{ textAlign: "center", padding: "4rem" }}>
                        <div className="text-muted">Synchronizing global asset data...</div>
                    </div>
                ) : (
                    <div className="flex flex-column gap-2">
                        <StockTable data={warehouse2Stock} warehouseName="Warehouse 2" />
                        <StockTable data={warehouse3Stock} warehouseName="Warehouse 3" />
                    </div>
                )}
            </div>

            {editingItem && (
                <div style={{
                    position: "fixed",
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    backdropFilter: "blur(4px)"
                }}>
                    <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
                        <h2 className="mb-2">Adjust Inventory</h2>
                        <form onSubmit={handleUpdate} className="flex flex-column gap-1">
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700 }}>PRODUCT</label>
                                <input type="text" value={editingItem.product_name} disabled />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700 }}>SHELF PIN</label>
                                <input
                                    type="text"
                                    value={editData.shelf_code}
                                    onChange={(e) => setEditData({ ...editData, shelf_code: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700 }}>QUANTITY</label>
                                <input
                                    type="number"
                                    value={editData.quantity}
                                    onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex gap-1 justify-end mt-1">
                                <button type="button" onClick={() => setEditingItem(null)} style={{ backgroundColor: "#666" }}>Cancel</button>
                                <button type="submit">Update Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminStock;
