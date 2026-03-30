import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const AdminUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await api.get("/users");
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to fetch users registry.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (userId, userName) => {
        if (userId === currentUser.id) {
            toast.error("Security Protocol: You cannot terminate your own administrative access.");
            return;
        }

        if (!window.confirm(`Are you sure you want to remove user "${userName}"? This action is irreversible.`)) return;
        
        try {
            await api.delete(`/users/${userId}`);
            toast.success(`User access terminated: ${userName}`);
            fetchUsers();
        } catch (error) {
            toast.error("Failed to execute user termination.");
            console.error(error);
        }
    };

    const handleToggleRole = async (user) => {
        if (user.id === currentUser.id) {
            toast.error("Security Protocol: You cannot demote your own administrative role.");
            return;
        }

        const newRole = user.role === "admin" ? "user" : "admin";
        if (!window.confirm(`Change ${user.name}'s permission level to ${newRole.toUpperCase()}?`)) return;

        try {
            await api.put(`/users/${user.id}/role`, { role: newRole });
            toast.success(`Permission clearance updated for ${user.name}`);
            fetchUsers();
        } catch (error) {
            toast.error("Failed to update security clearance.");
            console.error(error);
        }
    };

    const filteredUsers = users.filter(u =>
        (u.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <header className="flex justify-between align-center mb-2" style={{ flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <h1>User <span className="text-red">Clearance</span></h1>
                        <p className="text-muted">Manage system access and permission hierarchies.</p>
                    </div>
                    <div style={{ position: "relative", width: "300px" }}>
                        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            style={{ paddingLeft: "36px" }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {loading ? (
                    <div className="card" style={{ textAlign: "center", padding: "4rem" }}>
                        <div className="text-muted">Synchronizing user credentials...</div>
                    </div>
                ) : (
                    <div className="card">
                        <div style={{ overflowX: "auto" }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Identity</th>
                                        <th>Email Address</th>
                                        <th>Security Level</th>
                                        <th>Registered Date</th>
                                        <th style={{ textAlign: "right" }}>Control Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id}>
                                                <td>
                                                    <div className="flex align-center gap-1">
                                                        <div style={{
                                                            width: "36px",
                                                            height: "36px",
                                                            borderRadius: "50%",
                                                            backgroundColor: user.role === "admin" ? "var(--primary)" : "var(--bg-main)",
                                                            color: user.role === "admin" ? "white" : "var(--text-main)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontWeight: 800,
                                                            border: `2px solid ${user.role === "admin" ? "var(--primary)" : "var(--border)"}`
                                                        }}>
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontWeight: 700 }}>{user.name} {user.id === currentUser.id && <span className="text-muted" style={{ fontWeight: 400 }}>(You)</span>}</span>
                                                    </div>
                                                </td>
                                                <td><span className="text-muted">{user.email}</span></td>
                                                <td>
                                                    <span style={{
                                                        padding: "0.25rem 0.75rem",
                                                        borderRadius: "20px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 800,
                                                        backgroundColor: user.role === "admin" ? "rgba(225, 29, 72, 0.1)" : "rgba(12, 26, 61, 0.05)",
                                                        color: user.role === "admin" ? "var(--accent)" : "var(--primary)",
                                                        border: `1px solid ${user.role === "admin" ? "var(--accent)" : "var(--primary)"}`
                                                    }}>
                                                        {user.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                                <td style={{ textAlign: "right" }}>
                                                    <div className="flex justify-end gap-1">
                                                        <button
                                                            className="btn-sm"
                                                            onClick={() => handleToggleRole(user)}
                                                            disabled={user.id === currentUser.id}
                                                            style={{ 
                                                                padding: "0.25rem 0.65rem", 
                                                                fontSize: "0.75rem",
                                                                opacity: user.id === currentUser.id ? 0.5 : 1
                                                            }}
                                                        >
                                                            {user.role === "admin" ? "Demote" : "Promote"}
                                                        </button>
                                                        <button
                                                            className="btn-sm"
                                                            onClick={() => handleDelete(user.id, user.name)}
                                                            disabled={user.id === currentUser.id}
                                                            style={{ 
                                                                padding: "0.25rem 0.65rem", 
                                                                fontSize: "0.75rem", 
                                                                backgroundColor: "var(--accent)",
                                                                opacity: user.id === currentUser.id ? 0.5 : 1
                                                            }}
                                                        >
                                                            Revoke Access
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: "center", padding: "3rem" }}>
                                                <div className="text-muted">No security records found matching query.</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminUsers;
