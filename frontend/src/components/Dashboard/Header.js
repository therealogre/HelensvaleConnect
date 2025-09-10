import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Header = ({ user, onToggleSidebar, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Welcome to Helensvale Connect!',
      message: 'Complete your profile to get started',
      time: '2 minutes ago',
      unread: true
    },
    {
      id: 2,
      type: 'info',
      title: 'Choose Your Plan',
      message: 'Select a subscription plan to unlock all features',
      time: '5 minutes ago',
      unread: true
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        
        <div className="breadcrumb">
          <span className="breadcrumb-item">Dashboard</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-actions">
          {/* Quick Actions */}
          <Link to="/dashboard/stores/create" className="btn btn-primary btn-sm">
            <i className="fas fa-plus"></i>
            Create Store
          </Link>

          {/* Notifications */}
          <div className="notifications-dropdown" ref={notificationsRef}>
            <button 
              className="notification-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <i className="fas fa-bell"></i>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {notificationsOpen && (
              <div className="notifications-menu">
                <div className="notifications-header">
                  <h4>Notifications</h4>
                  <button className="mark-all-read">Mark all read</button>
                </div>
                
                <div className="notifications-list">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.unread ? 'unread' : ''}`}
                    >
                      <div className={`notification-icon ${notification.type}`}>
                        <i className={
                          notification.type === 'success' ? 'fas fa-check-circle' :
                          notification.type === 'info' ? 'fas fa-info-circle' :
                          notification.type === 'warning' ? 'fas fa-exclamation-triangle' :
                          'fas fa-bell'
                        }></i>
                      </div>
                      <div className="notification-content">
                        <h5>{notification.title}</h5>
                        <p>{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="notifications-footer">
                  <Link to="/dashboard/notifications">View all notifications</Link>
                </div>
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="user-dropdown" ref={dropdownRef}>
            <button 
              className="user-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.fullName} />
                ) : (
                  <div className="avatar-placeholder">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                )}
              </div>
              <div className="user-info">
                <span className="user-name">{user.fullName}</span>
                <span className="user-role">{user.subscriptionPlan || 'Free'} Plan</span>
              </div>
              <i className="fas fa-chevron-down"></i>
            </button>

            {dropdownOpen && (
              <div className="user-menu">
                <div className="user-menu-header">
                  <div className="user-avatar large">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.fullName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="user-details">
                    <h4>{user.fullName}</h4>
                    <p>{user.email}</p>
                    <span className={`status-badge ${user.subscriptionStatus === 'active' ? 'active' : 'inactive'}`}>
                      {user.subscriptionPlan || 'No Plan'} 
                      {user.subscriptionStatus === 'active' && ' (Active)'}
                    </span>
                  </div>
                </div>

                <div className="user-menu-items">
                  <Link to="/dashboard/settings/profile" className="menu-item">
                    <i className="fas fa-user"></i>
                    <span>Profile Settings</span>
                  </Link>
                  <Link to="/dashboard/settings/billing" className="menu-item">
                    <i className="fas fa-credit-card"></i>
                    <span>Billing & Plans</span>
                  </Link>
                  <Link to="/dashboard/settings/notifications" className="menu-item">
                    <i className="fas fa-bell"></i>
                    <span>Notifications</span>
                  </Link>
                  <Link to="/help" className="menu-item">
                    <i className="fas fa-question-circle"></i>
                    <span>Help & Support</span>
                  </Link>
                </div>

                <div className="user-menu-footer">
                  <button onClick={onLogout} className="logout-btn">
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
