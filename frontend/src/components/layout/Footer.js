import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/logo.svg" alt="Helensvale Connect" className="logo" />
            <p>Transforming Zimbabwean businesses, one connection at a time.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/register">Sign Up</Link></li>
                <li><Link to="/login">Login</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Helensvale Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
