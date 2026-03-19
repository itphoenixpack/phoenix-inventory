import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import AdminPanel from "../pages/AdminPanel";
import AdminProducts from "../pages/AdminProducts";
import AdminStock from "../pages/AdminStock";
import UserPanel from "../pages/UserPanel";
import UpdateStock from "../pages/UpdateStock";
import Register from "../pages/Register";

import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Synchronizing Security...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/user"} replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Initializing...</div>;
  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/user"} replace />;
  
  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPanel />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/products" element={
          <ProtectedRoute allowedRoles={["admin", "user"]}>
            <AdminProducts />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/stock" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminStock />
          </ProtectedRoute>
        } />
        
        <Route path="/user" element={
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <UserPanel />
          </ProtectedRoute>
        } />
        
        <Route path="/user/stock" element={
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <UpdateStock />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;