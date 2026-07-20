import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NakesProvider } from './context/NakesContext';
import { ToastProvider } from './components/Toast';
import AppLegacy from './App.legacy';

// Layout & Guards
import { AppLayout } from './components/layout/AppLayout';
import { AuthGuard } from './components/guards/AuthGuard';
import { RoleGuard } from './components/guards/RoleGuard';

// Public Pages
import { Login } from './pages/Login';
import { GuestMeasurement } from './pages/GuestMeasurement';

// Admin Pages
import {
  AdminDashboard,
  UserManagement,
  MasterDesa,
  MasterPosyandu,
  AdminChildrenData,
  AdminReports,
  RoleManagement
} from './pages/admin';

import {
  NakesDashboard,
  NakesChildrenData,
  MeasurementInput,
  HistoryChart,
  Prediction,
  ChildDetail,
  NakesReports,
  NakesOrtuManagement
} from './pages/nakes';

// Ortu Pages
import { OrtuDashboard } from './pages/ortu';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/legacy" element={<AppLegacy />} />
            <Route path="/guest" element={<GuestMeasurement />} />

            {/* Default redirect based on auth */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected Routes */}
            <Route element={<AuthGuard />}>
              <Route element={<AppLayout />}>

                {/* Admin Routes */}
                <Route element={<RoleGuard allowedRoles={['admin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/roles" element={<RoleManagement />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/villages" element={<MasterDesa />} />
                  <Route path="/admin/posyandu" element={<MasterPosyandu />} />
                  <Route path="/admin/children" element={<AdminChildrenData />} />
                  <Route path="/admin/children/:childId" element={<ChildDetail />} />
                  <Route path="/admin/reports" element={<AdminReports />} />
                </Route>

                {/* Nakes Routes */}
                <Route element={<RoleGuard allowedRoles={['nakes']} />}>
                  <Route element={<NakesProvider><Outlet /></NakesProvider>}>
                    <Route path="/nakes/dashboard" element={<NakesDashboard />} />
                    <Route path="/nakes/children" element={<NakesChildrenData />} />
                    <Route path="/nakes/children/:childId" element={<ChildDetail />} />
                    <Route path="/nakes/measurements" element={<MeasurementInput />} />
                    <Route path="/nakes/history" element={<HistoryChart />} />
                    <Route path="/nakes/prediction" element={<Prediction />} />
                    <Route path="/nakes/reports" element={<NakesReports />} />
                    <Route path="/nakes/ortu" element={<NakesOrtuManagement />} />
                  </Route>
                </Route>

              </Route>

              {/* Ortu Routes (No Sidebar) */}
              <Route element={<RoleGuard allowedRoles={['ortu']} />}>
                <Route path="/ortu/dashboard" element={<OrtuDashboard />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}