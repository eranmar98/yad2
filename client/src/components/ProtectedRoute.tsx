import { Navigate, Outlet } from 'react-router-dom';
import useUsersStore from '../store/usersStore';

export default function ProtectedRoute() {
  const token = useUsersStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}