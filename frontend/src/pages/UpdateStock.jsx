import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const UpdateStock = () => {
    const { user } = useAuth();
    const role = user?.role;
    const [products, setProducts] = useState([]);
    const [warehouses] = useState([
        { id: 1, name: "Warehouse 2" },
        { id: 2, name: "Warehouse 3" }
    ]);
    const [formData, setFormData] = useState({
        product_id: "",
        warehouse_id: 1,
        quantity: "",
        shelf_code: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get("/products");
                setProducts(res.data);
                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, product_id: res.data[0].id }));
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    const handleAction = async (action) => {
        if (!formData.quantity || !formData.shelf_code || !formData.product_id) {
            setMessage({ type: "error", text: "Incomplete operation: Data missing." });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });
        try {
            const endpoint = action === "add" ? "/stock/add" : "/stock/remove";
            await api.post(endpoint, {
                product_id: parseInt(formData.product_id),
                warehouse_id: parseInt(formData.warehouse_id),
                quantity: parseInt(formData.quantity),
                shelf_code: formData.shelf_code
            });
            setMessage({ type: "success", text: `Inventory Transaction Recorded: ${action === "add" ? "INBOUND" : "OUTBOUND"} confirmed.` });
            setFormData(prev => ({ ...prev, quantity: "", shelf_code: "" }));
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Transaction failed." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                <header className="mb-2">
                    <h1>Inventory <span className="text-red">Transaction</span></h1>
                    <p className="text-muted">Execute and record physical stock movement across logistics nodes.</p>
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

                <div className="card" style={{ borderTop: "4px solid var(--primary)" }}>
                    <h2 className="mb-2">Movement Manifest</h2>
                    <div className="flex flex-column gap-1">
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>I. SELECT ASSET</label>
                            <select
                                value={formData.product_id}
                                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                            >
                                <option value="" disabled>Search registry...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-1" style={{ flexWrap: "wrap" }}>
                            <div style={{ flex: 1, minWidth: "200px" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>II. STORAGE NODE</label>
                                <select
                                    value={formData.warehouse_id}
                                    onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                                >
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ flex: 1, minWidth: "150px" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>III. SHELF REF</label>
                                <input
                                    type="text"
                                    placeholder="e.g. ALPHA-101"
                                    value={formData.shelf_code}
                                    onChange={(e) => setFormData({ ...formData, shelf_code: e.target.value })}
                                />
                            </div>

                            <div style={{ flex: 1, minWidth: "150px" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>IV. UNIT COUNT</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-1 mt-2">
                            <button
                                style={{ flex: 1, height: "4rem", fontSize: "1.1rem" }}
                                onClick={() => handleAction("add")}
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "CONFIRM INBOUND (+)"}
                            </button>
                            <button
                                className="danger"
                                style={{ flex: 1, height: "4rem", fontSize: "1.1rem" }}
                                onClick={() => handleAction("remove")}
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "CONFIRM OUTBOUND (-)"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default UpdateStock;
