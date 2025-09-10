import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setShowResendVerification(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message);
        if (result.requiresVerification) {
          setShowResendVerification(true);
        }
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();
      
      if (data.success) {
        setError('Verification email sent! Please check your inbox.');
        setShowResendVerification(false);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-section">
            <img src="/assets/logo.svg" alt="Helensvale Connect" className="auth-logo" />
            <h1>Welcome Back</h1>
            <p>Sign in to your Helensvale Connect account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className={`alert ${showResendVerification ? 'alert-warning' : 'alert-error'}`}>
              {error}
              {showResendVerification && (
                <button 
                  type="button" 
                  onClick={handleResendVerification}
                  className="btn-link"
                  disabled={loading}
                >
                  Resend verification email
                </button>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="form-input"
            />
          </div>

          <div className="form-options">
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot your password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create one now
            </Link>
          </p>
        </div>

        <div className="trust-indicators">
          <div className="trust-item">
            <i className="fas fa-shield-alt"></i>
            <span>Secure Login</span>
          </div>
          <div className="trust-item">
            <i className="fas fa-users"></i>
            <span>750+ Businesses Trust Us</span>
          </div>
          <div className="trust-item">
            <i className="fas fa-star"></i>
            <span>4.9★ Rating</span>
          </div>
        </div>
      </div>

      <div className="auth-sidebar">
        <div className="sidebar-content">
          <h2>Join Zimbabwe's #1 Marketplace</h2>
          <p>
            Connect with thousands of customers and grow your business with 
            our comprehensive platform designed for African entrepreneurs.
          </p>
          
          <div className="feature-list">
            <div className="feature-item">
              <i className="fas fa-check-circle"></i>
              <span>Instant customer access</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-check-circle"></i>
              <span>Mobile money integration</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-check-circle"></i>
              <span>Smart booking system</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-check-circle"></i>
              <span>Business analytics</span>
            </div>
          </div>

          <div className="testimonial">
            <blockquote>
              "In just 3 months, my bookings increased by 300%. 
              I went from struggling to having a 2-week waiting list!"
            </blockquote>
            <cite>- Sarah's Hair Salon, Harare</cite>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
