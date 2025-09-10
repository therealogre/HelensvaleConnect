import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <header className="header">
      <nav className="nav container">
        <Link to="/" className="nav-brand">
          <img src="/logo.svg" alt="Helensvale Connect" className="logo" />
          <span className="brand-text">Helensvale Connect</span>
        </Link>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-outline">Login</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
