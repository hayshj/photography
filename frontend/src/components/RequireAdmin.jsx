// src/components/RequireAdmin.js
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const RequireAdmin = () => {
  const token = localStorage.getItem('adminToken');

  if (!token) return <Navigate to="/admin/login" replace />;

  try {
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
      localStorage.removeItem('adminToken');
      return <Navigate to="/admin/login" replace />;
    }
  } catch {
    localStorage.removeItem('adminToken');
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;
