import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const AdminProducts = () => {
    const { user } = useAuth();
    const role = user?.role;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        warehouse_id: 1,
        shelf_code: ""
    });
    const [editingProduct, setEditingProduct] = useState(null);
    const [editData, setEditData] = useState({ name: "", description: "" });
    const [message, setMessage] = useState({ type: "", text: "" });
    const [warehouses] = useState([
        { id: 1, name: "Warehouse 2" },
        { id: 2, name: "Warehouse 3" }
    ]);

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");
            setProducts(res.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });
        setLoading(true);

        try {
            await api.post("/products", {
                name: newProduct.name,
                warehouse_id: newProduct.warehouse_id,
                shelf_code: newProduct.shelf_code
            });

            setMessage({ type: "success", text: "Product cataloged and synchronized successfully!" });
            setNewProduct({
                name: "",
                warehouse_id: 1,
                shelf_code: ""
            });
            setShowAddForm(false);
            fetchProducts();
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Failed to register asset.";
            setMessage({ type: "error", text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (p) => {
        setEditingProduct(p);
        setEditData({ name: p.name, description: p.description || "" });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/products/${editingProduct.id}`, editData);
            setEditingProduct(null);
            fetchProducts();
        } catch (error) {
            alert("Failed to update product specs.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("CAUTION: This will remove the item and all its stock records from the entire system. Proceed?")) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (error) {
            alert("Failed to delete product. Ensure it has no active stock or try again.");
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <header className="flex justify-between align-center mb-2">
                    <div>
                        <h1>Product <span className="text-red">Catalogue</span></h1>
                        <p className="text-muted">Maintain the central registry of all storable items.</p>
                    </div>
                    {role === "admin" && (
                        <button onClick={() => setShowAddForm(!showAddForm)}>
                            {showAddForm ? "Back to Registry" : "+ New Catalogue Entry"}
                        </button>
                    )}
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

                {showAddForm && (
                    <div className="card mb-2" style={{ borderLeft: "4px solid var(--primary)" }}>
                        <h2 className="mb-2">Define New Product Entry</h2>
                        <form onSubmit={handleAddProduct} className="flex flex-column gap-1">
                            <div className="flex gap-1" style={{ flexWrap: "wrap" }}>
                                <div style={{ flex: 2, minWidth: "250px" }}>
                                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>OFFICIAL NAME</label>
                                    <input
                                        type="text"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        placeholder="Identification Name"
                                        required
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: "200px" }}>
                                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>STORAGE WAREHOUSE</label>
                                    <select
                                        value={newProduct.warehouse_id}
                                        onChange={(e) => setNewProduct({ ...newProduct, warehouse_id: e.target.value })}
                                    >
                                        {warehouses.map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ flex: 1, minWidth: "150px" }}>
                                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>SHELF PIN</label>
                                    <input
                                        type="text"
                                        value={newProduct.shelf_code}
                                        onChange={(e) => setNewProduct({ ...newProduct, shelf_code: e.target.value })}
                                        placeholder="e.g. BIN-01"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end mt-1">
                                <button type="submit" disabled={loading}>
                                    {loading ? "Cataloging Asset..." : "Verify and Register Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="card">
                    <div className="flex justify-between align-center mb-2" style={{ flexWrap: "wrap", gap: "1rem" }}>
                        <h2>Asset Registry</h2>
                        <div style={{ position: "relative", width: "350px" }}>
                            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search catalogue by name or SKU..."
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
                                    <th>Registered Product</th>
                                    <th>Serial / SKU</th>
                                    <th>Technical Details</th>
                                    <th>Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ textAlign: "center", padding: "4rem" }}>Retrieving catalogue data...</td></tr>
                                ) : filteredProducts.length > 0 ? (
                                    filteredProducts.map((p) => (
                                        <tr key={p.id}>
                                            <td style={{ fontWeight: 800, color: "var(--primary)" }}>{p.name}</td>
                                            <td>
                                                <code style={{ background: "var(--bg-main)", padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.85rem" }}>{p.sku}</code>
                                            </td>
                                            <td className="text-muted" style={{ fontSize: "0.9rem" }}>{p.description || "No specifications provided."}</td>
                                            <td>
                                                {role === "admin" && (
                                                    <div className="flex gap-1 justify-end">
                                                        <button
                                                            className="secondary"
                                                            onClick={() => handleEditClick(p)}
                                                            style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="secondary"
                                                            onClick={() => handleDelete(p.id)}
                                                            style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", backgroundColor: "var(--accent)" }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" style={{ textAlign: "center", padding: "4rem" }}>No items found matching the search criteria.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {editingProduct && (
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
                    <div className="card" style={{ width: "100%", maxWidth: "450px" }}>
                        <h2 className="mb-2">Update Catalogue Specifications</h2>
                        <form onSubmit={handleUpdate} className="flex flex-column gap-1">
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>PRODUCT NAME</label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)" }}>DESCRIPTION / TECH SPECS</label>
                                <textarea
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    style={{ height: "100px", resize: "vertical" }}
                                />
                            </div>
                            <div className="flex gap-1 justify-end mt-1">
                                <button type="button" onClick={() => setEditingProduct(null)} style={{ backgroundColor: "#666" }}>Cancel</button>
                                <button type="submit">Synchronize Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminProducts;
