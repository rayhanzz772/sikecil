import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, Role } from '../../context/AuthContext';

interface RoleGuardProps {
  allowedRoles: Role[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div></div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboard if they try to access an unauthorized route
    let redirectPath = '/nakes/dashboard';
    if (user?.role === 'admin') redirectPath = '/admin/dashboard';
    else if (user?.role === 'ortu') redirectPath = '/ortu/dashboard';
    
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
