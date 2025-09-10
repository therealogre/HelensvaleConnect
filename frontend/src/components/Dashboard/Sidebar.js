import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Dashboard.css';

const Sidebar = ({ isOpen, onClose, user }) => {
  const [dropdownOpen, setDropdownOpen] = useState({});
  const location = useLocation();

  const toggleDropdown = (key) => {
    setDropdownOpen(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: 'fas fa-tachometer-alt',
      label: 'Dashboard',
      path: '/dashboard',
      requiresSubscription: false
    },
    {
      key: 'pricing',
      icon: 'fas fa-credit-card',
      label: 'Choose Plan',
      path: '/dashboard/pricing',
      requiresSubscription: false,
      highlight: !user.subscriptionPlan || user.subscriptionStatus !== 'active'
    },
    {
      key: 'stores',
      icon: 'fas fa-store',
      label: 'Store Management',
      requiresSubscription: true,
      children: [
        {
          key: 'my-stores',
          icon: 'fas fa-list',
          label: 'My Stores',
          path: '/dashboard/stores'
        },
        {
          key: 'create-store',
          icon: 'fas fa-plus',
          label: 'Create Store',
          path: '/dashboard/stores/create'
        },
        {
          key: 'campaigns',
          icon: 'fas fa-bullhorn',
          label: 'Campaigns & Offers',
          path: '/dashboard/campaigns'
        }
      ]
    },
    {
      key: 'analytics',
      icon: 'fas fa-chart-line',
      label: 'Analytics',
      path: '/dashboard/analytics',
      requiresSubscription: true
    },
    {
      key: 'customers',
      icon: 'fas fa-users',
      label: 'Customers',
      path: '/dashboard/customers',
      requiresSubscription: true
    },
    {
      key: 'bookings',
      icon: 'fas fa-calendar-check',
      label: 'Bookings',
      path: '/dashboard/bookings',
      requiresSubscription: true
    },
    {
      key: 'payments',
      icon: 'fas fa-money-bill-wave',
      label: 'Payments',
      path: '/dashboard/payments',
      requiresSubscription: true
    },
    {
      key: 'settings',
      icon: 'fas fa-cog',
      label: 'Settings',
      requiresSubscription: false,
      children: [
        {
          key: 'profile',
          icon: 'fas fa-user',
          label: 'Profile',
          path: '/dashboard/settings/profile'
        },
        {
          key: 'billing',
          icon: 'fas fa-receipt',
          label: 'Billing',
          path: '/dashboard/settings/billing'
        },
        {
          key: 'notifications',
          icon: 'fas fa-bell',
          label: 'Notifications',
          path: '/dashboard/settings/notifications'
        }
      ]
    }
  ];

  const hasActiveSubscription = user.subscriptionStatus === 'active';

  const renderMenuItem = (item) => {
    const isActive = location.pathname === item.path || 
                    (item.children && item.children.some(child => location.pathname === child.path));
    
    const isLocked = item.requiresSubscription && !hasActiveSubscription;

    if (item.children) {
      const isDropdownOpen = dropdownOpen[item.key];
      
      return (
        <div key={item.key} className={`menu-item dropdown ${isActive ? 'active' : ''}`}>
          <button
            className={`menu-link ${isLocked ? 'locked' : ''}`}
            onClick={() => !isLocked && toggleDropdown(item.key)}
            disabled={isLocked}
          >
            <div className="menu-link-content">
              <i className={item.icon}></i>
              <span>{item.label}</span>
              {isLocked && <i className="fas fa-lock lock-icon"></i>}
            </div>
            {!isLocked && (
              <i className={`fas fa-chevron-down dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}></i>
            )}
          </button>
          
          {isDropdownOpen && !isLocked && (
            <div className="dropdown-menu">
              {item.children.map(child => (
                <NavLink
                  key={child.key}
                  to={child.path}
                  className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <i className={child.icon}></i>
                  <span>{child.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={item.key} className="menu-item">
        <NavLink
          to={item.path}
          className={({ isActive }) => `menu-link ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''} ${item.highlight ? 'highlight' : ''}`}
          onClick={onClose}
        >
          <div className="menu-link-content">
            <i className={item.icon}></i>
            <span>{item.label}</span>
            {item.highlight && <span className="highlight-badge">!</span>}
            {isLocked && <i className="fas fa-lock lock-icon"></i>}
          </div>
        </NavLink>
      </div>
    );
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <img src="/assets/logo.svg" alt="Helensvale Connect" className="sidebar-logo" />
            <div className="logo-text">
              <h3>Helensvale Connect</h3>
              <p>Business Dashboard</p>
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="sidebar-user">
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
            <h4>{user.fullName}</h4>
            <p className="user-email">{user.email}</p>
            <div className="subscription-status">
              {hasActiveSubscription ? (
                <span className="status-badge active">
                  <i className="fas fa-check-circle"></i>
                  {user.subscriptionPlan} Plan
                </span>
              ) : (
                <span className="status-badge inactive">
                  <i className="fas fa-exclamation-triangle"></i>
                  No Active Plan
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h5 className="nav-section-title">Main</h5>
            {menuItems.slice(0, 2).map(renderMenuItem)}
          </div>

          <div className="nav-section">
            <h5 className="nav-section-title">Business</h5>
            {menuItems.slice(2, 7).map(renderMenuItem)}
          </div>

          <div className="nav-section">
            <h5 className="nav-section-title">Account</h5>
            {menuItems.slice(7).map(renderMenuItem)}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="upgrade-prompt">
            {!hasActiveSubscription && (
              <div className="upgrade-card">
                <div className="upgrade-icon">
                  <i className="fas fa-rocket"></i>
                </div>
                <h4>Unlock Full Features</h4>
                <p>Choose a plan to access store management, analytics, and more.</p>
                <NavLink to="/dashboard/pricing" className="btn btn-primary btn-sm">
                  Choose Plan
                </NavLink>
              </div>
            )}
          </div>

          <div className="help-section">
            <a href="/help" className="help-link">
              <i className="fas fa-question-circle"></i>
              <span>Help & Support</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
