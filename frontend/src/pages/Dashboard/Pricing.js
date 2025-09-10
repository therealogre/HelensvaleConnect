import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Dashboard.css';

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const plans = {
    starter: {
      name: 'Starter',
      description: 'Perfect for new businesses getting started',
      monthlyPrice: 15,
      yearlyPrice: 150,
      features: [
        'Basic store profile',
        'Up to 10 service listings',
        'Customer contact form',
        'Basic analytics',
        'Mobile-friendly design',
        'Email support'
      ],
      limitations: [
        'No online booking',
        'No payment processing',
        'Limited customization'
      ],
      recommended: false,
      businessTypes: ['other', 'retail']
    },
    professional: {
      name: 'Professional',
      description: 'Most popular choice for growing businesses',
      monthlyPrice: 35,
      yearlyPrice: 350,
      features: [
        'Everything in Starter',
        'Unlimited service listings',
        'Online booking system',
        'Customer reviews & ratings',
        'Photo gallery (50 images)',
        'Basic payment processing',
        'Advanced analytics',
        'Social media integration',
        'Priority email support',
        'Custom business hours'
      ],
      limitations: [
        'Limited to 2 staff members',
        'Basic customization options'
      ],
      recommended: true,
      businessTypes: ['beauty_wellness', 'automotive', 'professional_services', 'health_fitness']
    },
    enterprise: {
      name: 'Enterprise',
      description: 'Advanced features for established businesses',
      monthlyPrice: 75,
      yearlyPrice: 750,
      features: [
        'Everything in Professional',
        'Unlimited staff accounts',
        'Advanced booking management',
        'Inventory management',
        'Customer loyalty programs',
        'Advanced payment processing',
        'Multi-location support',
        'Custom branding & themes',
        'API access',
        'Dedicated account manager',
        'Phone & chat support',
        'Advanced reporting'
      ],
      limitations: [],
      recommended: false,
      businessTypes: ['food_beverage', 'retail', 'education', 'technology']
    }
  };

  const getRecommendedPlan = () => {
    const userBusinessType = currentUser?.businessType;
    
    for (const [planKey, plan] of Object.entries(plans)) {
      if (plan.businessTypes.includes(userBusinessType)) {
        return planKey;
      }
    }
    return 'professional';
  };

  const recommendedPlan = getRecommendedPlan();

  const calculateSavings = (plan) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    return monthlyCost - yearlyCost;
  };

  const handlePlanSelect = (planKey) => {
    setSelectedPlan(planKey);
  };

  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      const plan = plans[selectedPlan];
      const amount = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
      
      // Create payment with PayNow
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planName: selectedPlan,
          billingCycle,
          amount,
          currency: 'USD'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect to PayNow payment page
        window.location.href = data.redirectUrl;
      } else {
        alert('Failed to create payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatBusinessType = (type) => {
    return type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Business';
  };

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1>Choose Your Perfect Plan</h1>
        <p className="pricing-subtitle">
          Select the plan that best fits your {formatBusinessType(currentUser?.businessType)} business needs. 
          Upgrade or downgrade anytime.
        </p>
        
        <div className="billing-toggle">
          <div className="toggle-container">
            <button 
              className={`toggle-option ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`toggle-option ${billingCycle === 'yearly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly
              <span className="savings-badge">Save up to 20%</span>
            </button>
          </div>
        </div>
      </div>

      <div className="plans-grid">
        {Object.entries(plans).map(([planKey, plan]) => {
          const isRecommended = planKey === recommendedPlan;
          const isSelected = selectedPlan === planKey;
          const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          const savings = calculateSavings(plan);
          
          return (
            <div 
              key={planKey}
              className={`plan-card ${isSelected ? 'selected' : ''} ${isRecommended ? 'recommended' : ''}`}
              onClick={() => handlePlanSelect(planKey)}
            >
              {isRecommended && (
                <div className="recommended-badge">
                  <i className="fas fa-star"></i>
                  Recommended for You
                </div>
              )}
              
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <p className="plan-description">{plan.description}</p>
                
                <div className="plan-pricing">
                  <div className="price-display">
                    <span className="currency">$</span>
                    <span className="amount">{price}</span>
                    <span className="period">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                  
                  {billingCycle === 'yearly' && savings > 0 && (
                    <div className="savings-display">
                      Save ${savings} per year
                    </div>
                  )}
                </div>
              </div>

              <div className="plan-features">
                <h4>What's included:</h4>
                <ul className="features-list">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <i className="fas fa-check"></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.limitations.length > 0 && (
                  <div className="limitations">
                    <h5>Limitations:</h5>
                    <ul className="limitations-list">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="limitation-item">
                          <i className="fas fa-times"></i>
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="plan-action">
                <button 
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'} btn-full`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanSelect(planKey);
                  }}
                >
                  {isSelected ? 'Selected' : 'Select Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="plan-comparison">
        <h3>Why Businesses Choose {plans[recommendedPlan].name}?</h3>
        <div className="comparison-grid">
          <div className="comparison-item">
            <div className="comparison-icon">
              <i className="fas fa-users"></i>
            </div>
            <h4>Perfect for Your Business Type</h4>
            <p>
              {formatBusinessType(currentUser?.businessType)} businesses see the best results 
              with our {plans[recommendedPlan].name} plan features.
            </p>
          </div>
          
          <div className="comparison-item">
            <div className="comparison-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h4>Proven Results</h4>
            <p>
              Businesses on this plan see an average of 300% increase in bookings 
              within the first 3 months.
            </p>
          </div>
          
          <div className="comparison-item">
            <div className="comparison-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h4>Risk-Free Trial</h4>
            <p>
              Try any plan for 14 days. If you're not satisfied, 
              we'll refund your money, no questions asked.
            </p>
          </div>
        </div>
      </div>

      <div className="pricing-faq">
        <h3>Frequently Asked Questions</h3>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Can I change my plan later?</h4>
            <p>Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.</p>
          </div>
          
          <div className="faq-item">
            <h4>What payment methods do you accept?</h4>
            <p>We accept EcoCash, OneMoney, bank transfers, and major credit cards through our secure PayNow integration.</p>
          </div>
          
          <div className="faq-item">
            <h4>Is there a setup fee?</h4>
            <p>No setup fees! What you see is what you pay. We believe in transparent, honest pricing with no hidden costs.</p>
          </div>
          
          <div className="faq-item">
            <h4>Do you offer refunds?</h4>
            <p>Yes, we offer a 14-day money-back guarantee. If you're not completely satisfied, we'll refund your payment.</p>
          </div>
        </div>
      </div>

      <div className="pricing-cta">
        <div className="cta-content">
          <h3>Ready to Transform Your Business?</h3>
          <p>
            Join 750+ successful businesses already growing with Helensvale Connect. 
            Start your {plans[selectedPlan].name} plan today.
          </p>
          
          <div className="cta-pricing">
            <div className="final-price">
              <span className="price-label">You'll pay:</span>
              <span className="price-amount">
                ${billingCycle === 'monthly' ? plans[selectedPlan].monthlyPrice : plans[selectedPlan].yearlyPrice}
                <span className="price-period">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
              </span>
            </div>
            
            {billingCycle === 'yearly' && (
              <div className="yearly-savings">
                <i className="fas fa-piggy-bank"></i>
                You save ${calculateSavings(plans[selectedPlan])} per year
              </div>
            )}
          </div>
          
          <button 
            className="btn btn-primary btn-large"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-credit-card"></i>
                Subscribe to {plans[selectedPlan].name}
              </>
            )}
          </button>
          
          <div className="trust-indicators">
            <div className="trust-item">
              <i className="fas fa-lock"></i>
              <span>Secure Payment</span>
            </div>
            <div className="trust-item">
              <i className="fas fa-undo"></i>
              <span>14-Day Refund</span>
            </div>
            <div className="trust-item">
              <i className="fas fa-headset"></i>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
