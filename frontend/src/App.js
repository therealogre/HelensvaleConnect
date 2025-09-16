import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import Welcome from './pages/Dashboard/Welcome';
import Pricing from './pages/Dashboard/Pricing';
import StoreManagement from './pages/Dashboard/StoreManagement';
import VendorOnboarding from './pages/VendorOnboarding';
import VendorMarketplace from './pages/VendorMarketplace';
import VendorProfile from './pages/vendor/VendorProfile';
import ServiceManagement from './pages/vendor/ServiceManagement';
import BookingCalendar from './pages/booking/BookingCalendar';
import MyBookings from './pages/booking/MyBookings';
import CustomerDashboard from './pages/CustomerDashboard';
import MarketplaceJourneyTest from './components/testing/MarketplaceJourneyTest';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

// Layout component to conditionally render Navbar and Footer
const Layout = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <>
      {!isDashboard && <Navbar />}
      <main>{children}</main>
      {!isDashboard && <Footer />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/vendor-onboarding" element={<VendorOnboarding />} />
            <Route path="/vendors" element={<VendorMarketplace />} />
            <Route path="/vendor/:id" element={<VendorProfile />} />
            
            {/* Testing route (development only) */}
            <Route path="/test-journey" element={<MarketplaceJourneyTest />} />
            
            {/* Legal and support pages */}
            <Route path="/terms" element={<div className="legal-page"><h1>Terms of Service</h1><p>Terms content coming soon...</p></div>} />
            <Route path="/privacy" element={<div className="legal-page"><h1>Privacy Policy</h1><p>Privacy policy content coming soon...</p></div>} />
            <Route path="/help" element={<div className="help-page"><h1>Help & Support</h1><p>Help content coming soon...</p></div>} />
            <Route path="/forgot-password" element={<div className="auth-page"><h1>Password Recovery</h1><p>Password recovery coming soon...</p></div>} />
            
            {/* Dashboard routes (handled by DashboardLayout) */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Welcome />} />
              <Route path="welcome" element={<Welcome />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="store" element={<StoreManagement />} />
              <Route path="stores/create" element={<div className="store-creation"><h1>Create Store</h1><p>Store creation coming soon...</p></div>} />
              <Route path="customer" element={<CustomerDashboard />} />
              <Route path="bookings" element={<MyBookings />} />
              <Route path="book/:vendorId" element={<BookingCalendar />} />
              
              {/* Vendor management routes */}
              <Route path="services" element={<ProtectedRoute requiredRole="vendor"><ServiceManagement /></ProtectedRoute>} />
              
              {/* Settings routes */}
              <Route path="settings/profile" element={<div className="settings-page"><h1>Profile Settings</h1><p>Profile settings coming soon...</p></div>} />
              <Route path="settings/billing" element={<div className="settings-page"><h1>Billing & Plans</h1><p>Billing settings coming soon...</p></div>} />
              <Route path="settings/notifications" element={<div className="settings-page"><h1>Notification Settings</h1><p>Notification settings coming soon...</p></div>} />
              <Route path="notifications" element={<div className="notifications-page"><h1>Notifications</h1><p>Notifications coming soon...</p></div>} />
            </Route>
          </Routes>
        </Layout>
      </div>
    </AuthProvider>
  );
}

export default App;
