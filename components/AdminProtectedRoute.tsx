import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AppContext';

export const AdminProtectedRoute: React.FC = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};