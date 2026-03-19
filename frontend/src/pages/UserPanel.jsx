import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const UserPanel = () => {
  const { user } = useAuth();
  const role = user?.role;
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
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
    fetchStock();
  }, []);

  const filteredStock = stock.filter(item =>
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product_sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header className="flex justify-between align-center mb-2" style={{ flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1>Facility <span className="text-red">Inventory</span></h1>
            <p className="text-muted">Local stock levels and storage location records.</p>
          </div>
          <div style={{ position: "relative", width: "300px" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>🔍</span>
            <input
              type="text"
              placeholder="Filter items..."
              style={{ paddingLeft: "36px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="card">
          <div className="flex justify-between align-center mb-2">
            <h2>Inventory Insight</h2>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>
              {filteredStock.length} MATCHING ITEMS
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Product Identification</th>
                  <th>Internal SKU</th>
                  <th>Storage Node</th>
                   <th>Shelf Ref</th>
                  <th>Current Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ textAlign: "center", padding: "4rem" }}>
                    <div className="text-muted">Loading local registry...</div>
                  </td></tr>
                ) : filteredStock.length > 0 ? (
                  filteredStock.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 800 }}>{item.product_name}</td>
                      <td><code style={{ background: "var(--bg-main)", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>{item.product_sku}</code></td>
                      <td style={{ fontWeight: 600 }}>{item.warehouse_name}</td>
                      <td style={{ fontWeight: 800, color: "var(--primary)" }}>{item.shelf_code || "—"}</td>
                      <td style={{ fontWeight: 800, fontSize: "1.05rem" }}>{item.quantity}</td>
                      <td>
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
                          {item.quantity === 0 ? "OUT OF STOCK" :
                           item.quantity < 10 ? "REPLENISH" :
                           item.quantity < 20 ? "LOW" : "OPTIMAL"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={{ textAlign: "center", padding: "4rem" }}>
                    <div className="text-muted">Target inventory not found.</div>
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

export default UserPanel;
