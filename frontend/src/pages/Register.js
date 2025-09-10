import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessType: 'other',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const businessTypes = [
    { value: 'beauty_wellness', label: 'Beauty & Wellness' },
    { value: 'automotive', label: 'Automotive Services' },
    { value: 'food_beverage', label: 'Food & Catering' },
    { value: 'home_services', label: 'Home Services' },
    { value: 'professional_services', label: 'Professional Services' },
    { value: 'retail', label: 'Retail' },
    { value: 'health_fitness', label: 'Health & Fitness' },
    { value: 'education', label: 'Education & Training' },
    { value: 'technology', label: 'Technology Services' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        businessType: formData.businessType
      });
      
      if (result.success) {
        setSuccess('Registration successful! Please check your email to verify your account.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="logo-section">
            <img src="/assets/logo.svg" alt="Helensvale Connect" className="auth-logo" />
            <h1>Join Zimbabwe's #1 Marketplace</h1>
            <p>Create your business account and start growing today</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Enter your first name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Enter your last name"
                className="form-input"
              />
            </div>
          </div>

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
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+263 XXX XXX XXX"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessType">Business Type</label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              required
              className="form-select"
            >
              {businessTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a strong password"
                className="form-input"
              />
              <small className="form-hint">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
              />
              <span className="checkmark"></span>
              I agree to the{' '}
              <Link to="/terms" target="_blank" className="auth-link">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" target="_blank" className="auth-link">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="trust-indicators">
          <div className="trust-item">
            <i className="fas fa-shield-alt"></i>
            <span>Secure & Encrypted</span>
          </div>
          <div className="trust-item">
            <i className="fas fa-rocket"></i>
            <span>Quick Setup</span>
          </div>
          <div className="trust-item">
            <i className="fas fa-support"></i>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>

      <div className="auth-sidebar">
        <div className="sidebar-content">
          <h2>Why Choose Helensvale Connect?</h2>
          <p>
            Join 750+ successful businesses already growing with Zimbabwe's 
            leading marketplace platform.
          </p>
          
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">750+</div>
              <div className="stat-label">Businesses</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">15K+</div>
              <div className="stat-label">Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.9★</div>
              <div className="stat-label">Rating</div>
            </div>
          </div>

          <div className="benefits-list">
            <div className="benefit-item">
              <i className="fas fa-dollar-sign"></i>
              <div>
                <h4>Increase Revenue</h4>
                <p>Businesses see 300% average booking increase</p>
              </div>
            </div>
            <div className="benefit-item">
              <i className="fas fa-clock"></i>
              <div>
                <h4>Save Time</h4>
                <p>Automated booking and payment processing</p>
              </div>
            </div>
            <div className="benefit-item">
              <i className="fas fa-chart-line"></i>
              <div>
                <h4>Grow Faster</h4>
                <p>Access to thousands of potential customers</p>
              </div>
            </div>
          </div>

          <div className="cta-section">
            <h3>Ready to Transform Your Business?</h3>
            <p>Join the digital revolution and watch your business thrive!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
