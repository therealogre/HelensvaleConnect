import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Dashboard.css';

const Welcome = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const steps = [
    {
      id: 1,
      title: 'Choose Your Plan',
      description: 'Select the perfect subscription plan for your business needs',
      icon: 'fas fa-credit-card',
      action: 'Choose Plan',
      path: '/dashboard/pricing',
      completed: currentUser?.subscriptionStatus === 'active'
    },
    {
      id: 2,
      title: 'Create Your Store',
      description: 'Build your professional business store and showcase your services',
      icon: 'fas fa-store',
      action: 'Create Store',
      path: '/dashboard/stores/create',
      completed: false, // Will be checked via API
      requiresSubscription: true
    },
    {
      id: 3,
      title: 'Go Live',
      description: 'Launch your store and start attracting customers',
      icon: 'fas fa-rocket',
      action: 'Launch Store',
      path: '/dashboard/stores',
      completed: false,
      requiresSubscription: true
    }
  ];

  useEffect(() => {
    // Check which steps are completed
    const completed = [];
    if (currentUser?.subscriptionStatus === 'active') {
      completed.push(1);
      setCurrentStep(2);
    }
    // TODO: Check if user has stores via API
    setCompletedSteps(completed);
  }, [currentUser]);

  const handleStepAction = (step) => {
    if (step.requiresSubscription && currentUser?.subscriptionStatus !== 'active') {
      navigate('/dashboard/pricing');
      return;
    }
    navigate(step.path);
  };

  const getBusinessTypeRecommendation = (businessType) => {
    const recommendations = {
      'beauty_wellness': {
        plan: 'Professional',
        features: ['Online booking system', 'Customer reviews', 'Photo gallery', 'Service packages'],
        tip: 'Showcase your work with a beautiful photo gallery and enable online bookings to reduce no-shows.'
      },
      'automotive': {
        plan: 'Professional',
        features: ['Service scheduling', 'Customer database', 'Invoice management', 'Parts tracking'],
        tip: 'Use the scheduling system to manage appointments and track customer service history.'
      },
      'food_beverage': {
        plan: 'Enterprise',
        features: ['Menu management', 'Online ordering', 'Delivery tracking', 'Customer loyalty'],
        tip: 'Enable online ordering and build customer loyalty with our integrated rewards system.'
      },
      'professional_services': {
        plan: 'Professional',
        features: ['Consultation booking', 'Document sharing', 'Client portal', 'Project tracking'],
        tip: 'Create a professional client portal to share documents and track project progress.'
      }
    };

    return recommendations[businessType] || recommendations['professional_services'];
  };

  const recommendation = getBusinessTypeRecommendation(currentUser?.businessType);

  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <div className="welcome-hero">
          <h1>Welcome to Helensvale Connect, {currentUser?.firstName}! 🎉</h1>
          <p className="welcome-subtitle">
            You're now part of Zimbabwe's #1 business marketplace. Let's get your business set up 
            and ready to attract customers in just 3 simple steps.
          </p>
          
          <div className="welcome-stats">
            <div className="stat-card">
              <div className="stat-number">750+</div>
              <div className="stat-label">Businesses Already Growing</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">15K+</div>
              <div className="stat-label">Active Customers</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">300%</div>
              <div className="stat-label">Average Growth</div>
            </div>
          </div>
        </div>
      </div>

      <div className="setup-progress">
        <h2>Get Started in 3 Easy Steps</h2>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
          ></div>
        </div>
        
        <div className="steps-container">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`step-card ${completedSteps.includes(step.id) ? 'completed' : ''} ${currentStep === step.id ? 'current' : ''}`}
            >
              <div className="step-header">
                <div className="step-icon">
                  {completedSteps.includes(step.id) ? (
                    <i className="fas fa-check-circle"></i>
                  ) : (
                    <i className={step.icon}></i>
                  )}
                </div>
                <div className="step-number">Step {step.id}</div>
              </div>
              
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                
                {step.requiresSubscription && currentUser?.subscriptionStatus !== 'active' && (
                  <div className="step-requirement">
                    <i className="fas fa-lock"></i>
                    <span>Requires active subscription</span>
                  </div>
                )}
              </div>
              
              <div className="step-action">
                {completedSteps.includes(step.id) ? (
                  <button className="btn btn-success" disabled>
                    <i className="fas fa-check"></i>
                    Completed
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleStepAction(step)}
                  >
                    {step.action}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="recommendation-section">
        <div className="recommendation-card">
          <h3>Recommended for {currentUser?.businessType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Businesses</h3>
          <div className="recommendation-content">
            <div className="recommended-plan">
              <h4>{recommendation.plan} Plan</h4>
              <p>Perfect for your business type with these key features:</p>
              <ul>
                {recommendation.features.map((feature, index) => (
                  <li key={index}>
                    <i className="fas fa-check"></i>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="recommendation-tip">
              <div className="tip-icon">
                <i className="fas fa-lightbulb"></i>
              </div>
              <div className="tip-content">
                <h5>Pro Tip</h5>
                <p>{recommendation.tip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="success-stories">
        <h3>See How Businesses Like Yours Are Thriving</h3>
        <div className="stories-grid">
          <div className="story-card">
            <div className="story-avatar">
              <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="Sarah" />
            </div>
            <div className="story-content">
              <h4>Sarah's Hair Salon</h4>
              <p className="story-type">Beauty & Wellness</p>
              <blockquote>"In just 3 months, my bookings increased by 300%. I went from struggling to having a 2-week waiting list!"</blockquote>
              <div className="story-metrics">
                <span className="metric">300% increase</span>
                <span className="metric">$950/month revenue</span>
              </div>
            </div>
          </div>

          <div className="story-card">
            <div className="story-avatar">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="Mike" />
            </div>
            <div className="story-content">
              <h4>Mike's Auto Repair</h4>
              <p className="story-type">Automotive Services</p>
              <blockquote>"The review system helped me build trust. Now I have customers calling from across the city!"</blockquote>
              <div className="story-metrics">
                <span className="metric">4.9★ rating</span>
                <span className="metric">150 new customers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="next-steps">
        <div className="next-steps-card">
          <h3>Ready to Transform Your Business?</h3>
          <p>Join hundreds of successful businesses already growing with Helensvale Connect.</p>
          <div className="next-steps-actions">
            {currentUser?.subscriptionStatus !== 'active' ? (
              <Link to="/dashboard/pricing" className="btn btn-primary btn-large">
                <i className="fas fa-rocket"></i>
                Choose Your Plan & Get Started
              </Link>
            ) : (
              <Link to="/dashboard/stores/create" className="btn btn-primary btn-large">
                <i className="fas fa-store"></i>
                Create Your Store Now
              </Link>
            )}
            <Link to="/help" className="btn btn-outline">
              <i className="fas fa-question-circle"></i>
              Need Help?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
