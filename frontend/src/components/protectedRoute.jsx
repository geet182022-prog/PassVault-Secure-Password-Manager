import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, vaultKey } = useAuth();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // if (loading) return null;
  if (loading) return <h1 style={{ color: "white" }}>Loading...</h1>;

  // ❌ not logged in → go login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 logged in but vault locked → go unlock
  if (!vaultKey) {
    return <Navigate to="/unlock" replace state={{ from: location }} />;
  }

  // ✅ logged in & vault unlocked
  return children;
};

export default ProtectedRoute;
