import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { DashboardShell } from './layouts/DashboardShell.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';

import HomePage from './pages/home/HomePage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';

import TenantDashboard from './pages/tenant/TenantDashboard.jsx';
import BrowseProperties from './pages/tenant/BrowseProperties.jsx';
import TenantLease from './pages/tenant/TenantLease.jsx';
import TenantMaintenance from './pages/tenant/TenantMaintenance.jsx';
import TenantMessages from './pages/tenant/TenantMessages.jsx';
import TenantNotifications from './pages/tenant/TenantNotifications.jsx';
import TenantProfile from './pages/tenant/TenantProfile.jsx';

import LandlordDashboard from './pages/landlord/LandlordDashboard.jsx';
import LandlordProperties from './pages/landlord/LandlordProperties.jsx';
import LandlordTenants from './pages/landlord/LandlordTenants.jsx';
import LandlordMaintenance from './pages/landlord/LandlordMaintenance.jsx';
import LandlordPayments from './pages/landlord/LandlordPayments.jsx';
import LandlordMessages from './pages/landlord/LandlordMessages.jsx';
import LandlordNotifications from './pages/landlord/LandlordNotifications.jsx';
import LandlordProfile from './pages/landlord/LandlordProfile.jsx';
import LandlordAnalytics from './pages/landlord/LandlordAnalytics.jsx';
import LandlordMap from './pages/landlord/LandlordMap.jsx';
import LandlordInventory from './pages/landlord/LandlordInventory.jsx';
import LandlordAcknowledgements from './pages/landlord/LandlordAcknowledgements.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminProperties from './pages/admin/AdminProperties.jsx';
import AdminLeases from './pages/admin/AdminLeases.jsx';
import AdminPayments from './pages/admin/AdminPayments.jsx';
import AdminMaintenance from './pages/admin/AdminMaintenance.jsx';
import AdminReports from './pages/admin/AdminReports.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';
import TenantAnalytics from './pages/tenant/TenantAnalytics.jsx';

function RoleHome() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'tenant') return <Navigate to="/tenant" replace />;
  if (user.role === 'landlord') return <Navigate to="/landlord" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/app" element={<RoleHome />} />

      <Route
        path="/tenant"
        element={
          <ProtectedRoute roles={['tenant']}>
            <DashboardShell role="tenant" />
          </ProtectedRoute>
        }
      >
        <Route index element={<TenantDashboard />} />
        <Route path="browse" element={<BrowseProperties />} />
        <Route path="lease" element={<TenantLease />} />
        <Route path="maintenance" element={<TenantMaintenance />} />
        <Route path="messages" element={<TenantMessages />} />
        <Route path="notifications" element={<TenantNotifications />} />
        <Route path="analytics" element={<TenantAnalytics />} />
        <Route path="profile" element={<TenantProfile />} />
      </Route>

      <Route
        path="/landlord"
        element={
          <ProtectedRoute roles={['landlord']}>
            <DashboardShell role="landlord" />
          </ProtectedRoute>
        }
      >
        <Route index element={<LandlordDashboard />} />
        <Route path="properties" element={<LandlordProperties />} />
        <Route path="tenants" element={<LandlordTenants />} />
        <Route path="maintenance" element={<LandlordMaintenance />} />
        <Route path="payments" element={<LandlordPayments />} />
        <Route path="messages" element={<LandlordMessages />} />
        <Route path="acknowledgements" element={<LandlordAcknowledgements />} />
        <Route path="notifications" element={<LandlordNotifications />} />
        <Route path="profile" element={<LandlordProfile />} />
        <Route path="analytics" element={<LandlordAnalytics />} />
        <Route path="map" element={<LandlordMap />} />
        <Route path="inventory" element={<LandlordInventory />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardShell role="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="properties" element={<AdminProperties />} />
        <Route path="leases" element={<AdminLeases />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="maintenance" element={<AdminMaintenance />} />
        <Route path="analytics" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
