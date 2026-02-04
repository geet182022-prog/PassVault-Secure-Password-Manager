import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const HomeRedirect = () => {
  const { isAuthenticated, loading, vaultKey } = useContext(AuthContext);
  if (loading) {
    return <div>Loading...</div>; // or spinner
  }
  
   // ❌ not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 logged in but vault locked
  if (!vaultKey) {
    return <Navigate to="/unlock" replace />;
  }

  // ✅ fully authenticated
  return <Navigate to="/dashboard" replace />;

};

export default HomeRedirect;
