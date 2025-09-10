import React, { useState, useContext, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import './Dashboard.css';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: location } });
      return;
    }

    // Check if user has verified email
    if (!currentUser.isVerified) {
      navigate('/verify-email-required');
      return;
    }

    setUser(currentUser);
  }, [currentUser, navigate, location]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        user={user}
      />
      
      <div className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Header 
          user={user}
          onToggleSidebar={toggleSidebar}
          onLogout={handleLogout}
        />
        
        <main className="dashboard-content">
          <Outlet context={{ user }} />
        </main>
      </div>

      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
