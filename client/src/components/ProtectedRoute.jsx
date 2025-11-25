import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, roles }) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <div className="empty-state">Checking access...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length && !roles.includes(user.role)) {
    return <Navigate to="/tasks" replace />;
  }

  return children;
}

export default ProtectedRoute;




