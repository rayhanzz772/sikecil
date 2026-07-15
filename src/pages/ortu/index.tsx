import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AppLegacy from '../../App.legacy';

export const OrtuDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Legacy App Content */}
      <div className="flex-1 relative bg-slate-50">
        <AppLegacy />
      </div>
    </div>
  );
};
