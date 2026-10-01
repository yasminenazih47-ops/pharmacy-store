import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/Auth.jsx';

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
