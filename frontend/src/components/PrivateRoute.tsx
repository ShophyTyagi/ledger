import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Wait for the server verify check before deciding — prevents a flash
  // redirect to /login for users who are already logged in.
  if (isLoading) return null;

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}
