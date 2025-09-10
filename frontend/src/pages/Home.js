import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {

  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">🚀</span>
            <span>750+ Pioneer Businesses Already Transforming</span>
          </div>
          <h1 className="hero-title">
            Transform Your Business Into a 
            <span className="gradient-text">Digital Powerhouse</span>
          </h1>
          <p className="hero-subtitle">
            Join the digital revolution that's transforming African businesses. Get customers, boost sales, and build lasting relationships with Helensvale Connect's all-in-one platform.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-large">Get Started for Free</Link>
            <Link to="/login" className="btn btn-outline btn-large">Login to Dashboard</Link>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="solution-section">
        <div className="container">
          <div className="solution-content">
            <div className="solution-text">
              <h2 className="section-title">🇿🇼 Built for Zimbabwe, Powered by Innovation</h2>
              <p className="section-subtitle">
                Helensvale Connect is Zimbabwe's first comprehensive digital business platform. From EcoCash integration to smart analytics, we've built everything local entrepreneurs need to thrive in the digital economy.
              </p>
              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon">💳</div>
                  <div className="feature-content">
                    <h4>Mobile Money Integration</h4>
                    <p>Accept EcoCash, OneMoney, and all major payment methods your customers prefer.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🎯</div>
                  <div className="feature-content">
                    <h4>Smart Customer Dashboard</h4>
                    <p>Track bookings, manage customers, and analyze your business performance in real-time.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">⭐</div>
                  <div className="feature-content">
                    <h4>Review & Rating System</h4>
                    <p>Build trust with authentic customer reviews and showcase your excellent service.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="solution-visual">
              <img src="/images/dashboard-preview.png" alt="Dashboard Preview" />
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="success-stories">
        <div className="container">
          <h2 className="section-title">Real Businesses, Real Results</h2>
          <div className="stories-grid">
            <div className="story-card">
              <div className="story-header">
                <img src="/images/avatar-sarah.jpg" alt="Sarah's Hair Salon" className="story-avatar" />
                <div className="story-info">
                  <h4>Sarah's Hair Salon 💇‍♀️</h4>
                  <p>Harare, Zimbabwe 🇿🇼</p>
                </div>
              </div>
              <div className="story-content">
                <div className="story-quote">"Helensvale Connect transformed my business! EcoCash integration made payments seamless, and my bookings increased by 400% in just 2 months."</div>
                <div className="story-metrics">
                  <div className="metric">
                    <span className="metric-value">$1,250</span>
                    <span className="metric-label">Monthly Revenue</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">400%</span>
                    <span className="metric-label">Growth Rate</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="story-card">
              <div className="story-header">
                <img src="/images/avatar-mike.jpg" alt="Mike's Auto Repair" className="story-avatar" />
                <div className="story-info">
                  <h4>Mike's Auto Repair 🚗</h4>
                  <p>Bulawayo, Zimbabwe 🇿🇼</p>
                </div>
              </div>
              <div className="story-content">
                <div className="story-quote">"The online booking system is a game-changer. I spend less time on the phone and more time fixing cars. My revenue is up 60%!"</div>
                <div className="story-metrics">
                  <div className="metric">
                    <span className="metric-value">$2,100</span>
                    <span className="metric-label">Monthly Revenue</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">60%</span>
                    <span className="metric-label">Revenue Increase</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="signup-form">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Business?</h2>
            <p className="cta-subtitle">Join hundreds of Zimbabwean entrepreneurs who are building their digital future with Helensvale Connect. Get started today—it's free to sign up!</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-large">Create Your Free Account</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
