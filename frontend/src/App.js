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
            
            {/* Dashboard routes (handled by DashboardLayout) */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Welcome />} />
              <Route path="welcome" element={<Welcome />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="store" element={<StoreManagement />} />
            </Route>
          </Routes>
        </Layout>
      </div>
    </AuthProvider>
  );
}

export default App;


export default App;
