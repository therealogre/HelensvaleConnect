import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import './StoreManagement.css';

const StoreManagement = () => {
  const { currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    fetchStoreData();
    fetchCampaigns();
    fetchOffers();
  }, []);

  const fetchStoreData = async () => {
    try {
      const response = await fetch('/api/stores/my-store', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStoreData(data);
      }
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/offers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOffers(data.offers || []);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Store Overview', icon: 'fas fa-store' },
    { id: 'campaigns', label: 'Marketing Campaigns', icon: 'fas fa-bullhorn' },
    { id: 'offers', label: 'Special Offers', icon: 'fas fa-tags' },
    { id: 'analytics', label: 'Performance', icon: 'fas fa-chart-line' },
    { id: 'settings', label: 'Store Settings', icon: 'fas fa-cog' }
  ];

  if (loading) {
    return (
      <div className="store-management-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your store...</p>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="store-management-container">
        <div className="no-store-state">
          <div className="no-store-icon">
            <i className="fas fa-store-slash"></i>
          </div>
          <h2>No Store Found</h2>
          <p>You haven't created your store yet. Let's get you set up!</p>
          <button className="btn btn-primary btn-large">
            <i className="fas fa-plus"></i>
            Create Your Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="store-management-container">
      <div className="store-header">
        <div className="store-info">
          <div className="store-avatar">
            {storeData.logo ? (
              <img src={storeData.logo} alt={storeData.name} />
            ) : (
              <div className="store-placeholder">
                <i className="fas fa-store"></i>
              </div>
            )}
          </div>
          <div className="store-details">
            <h1>{storeData.name}</h1>
            <p className="store-category">{storeData.category}</p>
            <div className="store-status">
              <span className={`status-badge ${storeData.status}`}>
                <i className={`fas fa-${storeData.status === 'active' ? 'check-circle' : 'clock'}`}></i>
                {storeData.status === 'active' ? 'Live' : 'Pending Review'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="store-actions">
          <button className="btn btn-outline">
            <i className="fas fa-eye"></i>
            View Store
          </button>
          <button className="btn btn-primary">
            <i className="fas fa-edit"></i>
            Edit Store
          </button>
        </div>
      </div>

      <div className="store-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="store-content">
        {activeTab === 'overview' && <StoreOverview storeData={storeData} />}
        {activeTab === 'campaigns' && <MarketingCampaigns campaigns={campaigns} setCampaigns={setCampaigns} />}
        {activeTab === 'offers' && <SpecialOffers offers={offers} setOffers={setOffers} />}
        {activeTab === 'analytics' && <StoreAnalytics storeData={storeData} />}
        {activeTab === 'settings' && <StoreSettings storeData={storeData} setStoreData={setStoreData} />}
      </div>
    </div>
  );
};

// Store Overview Component
const StoreOverview = ({ storeData }) => {
  const quickStats = [
    { label: 'Total Views', value: '2,847', change: '+12%', icon: 'fas fa-eye' },
    { label: 'Inquiries', value: '156', change: '+8%', icon: 'fas fa-envelope' },
    { label: 'Bookings', value: '89', change: '+23%', icon: 'fas fa-calendar-check' },
    { label: 'Rating', value: '4.8', change: '+0.2', icon: 'fas fa-star' }
  ];

  const recentActivities = [
    { type: 'booking', message: 'New booking from Sarah M.', time: '2 hours ago' },
    { type: 'review', message: 'Received 5-star review', time: '4 hours ago' },
    { type: 'inquiry', message: 'Price inquiry for wedding package', time: '6 hours ago' },
    { type: 'view', message: 'Store viewed 15 times today', time: '1 day ago' }
  ];

  return (
    <div className="overview-content">
      <div className="quick-stats">
        <h3>Quick Stats</h3>
        <div className="stats-grid">
          {quickStats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">
                <i className={stat.icon}></i>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-change positive">
                  <i className="fas fa-arrow-up"></i>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overview-grid">
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  <i className={`fas fa-${
                    activity.type === 'booking' ? 'calendar-plus' :
                    activity.type === 'review' ? 'star' :
                    activity.type === 'inquiry' ? 'envelope' : 'eye'
                  }`}></i>
                </div>
                <div className="activity-content">
                  <p>{activity.message}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-card">
              <i className="fas fa-plus"></i>
              <span>Add Service</span>
            </button>
            <button className="action-card">
              <i className="fas fa-camera"></i>
              <span>Upload Photos</span>
            </button>
            <button className="action-card">
              <i className="fas fa-share-alt"></i>
              <span>Share Store</span>
            </button>
            <button className="action-card">
              <i className="fas fa-chart-bar"></i>
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Marketing Campaigns Component
const MarketingCampaigns = ({ campaigns, setCampaigns }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'promotion',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    targetAudience: 'local'
  });

  const campaignTypes = [
    { value: 'promotion', label: 'Promotional Campaign', icon: 'fas fa-percentage' },
    { value: 'awareness', label: 'Brand Awareness', icon: 'fas fa-bullhorn' },
    { value: 'seasonal', label: 'Seasonal Campaign', icon: 'fas fa-calendar-alt' },
    { value: 'launch', label: 'Product Launch', icon: 'fas fa-rocket' }
  ];

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newCampaign)
      });

      if (response.ok) {
        const campaign = await response.json();
        setCampaigns([...campaigns, campaign]);
        setShowCreateForm(false);
        setNewCampaign({
          name: '',
          type: 'promotion',
          description: '',
          startDate: '',
          endDate: '',
          budget: '',
          targetAudience: 'local'
        });
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  return (
    <div className="campaigns-content">
      <div className="campaigns-header">
        <h3>Marketing Campaigns</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          <i className="fas fa-plus"></i>
          Create Campaign
        </button>
      </div>

      {showCreateForm && (
        <div className="campaign-form-overlay">
          <div className="campaign-form">
            <div className="form-header">
              <h4>Create New Campaign</h4>
              <button 
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateCampaign}>
              <div className="form-group">
                <label>Campaign Name</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  placeholder="Enter campaign name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Campaign Type</label>
                <select
                  value={newCampaign.type}
                  onChange={(e) => setNewCampaign({...newCampaign, type: e.target.value})}
                >
                  {campaignTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                  placeholder="Describe your campaign goals and strategy"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="campaigns-grid">
        {campaigns.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-bullhorn"></i>
            <h4>No Campaigns Yet</h4>
            <p>Create your first marketing campaign to attract more customers</p>
          </div>
        ) : (
          campaigns.map((campaign, index) => (
            <div key={index} className="campaign-card">
              <div className="campaign-header">
                <div className="campaign-type">
                  <i className={campaignTypes.find(t => t.value === campaign.type)?.icon}></i>
                  <span>{campaignTypes.find(t => t.value === campaign.type)?.label}</span>
                </div>
                <div className="campaign-status active">
                  <i className="fas fa-play"></i>
                  Active
                </div>
              </div>
              
              <h4>{campaign.name}</h4>
              <p>{campaign.description}</p>
              
              <div className="campaign-metrics">
                <div className="metric">
                  <span className="metric-value">1,234</span>
                  <span className="metric-label">Impressions</span>
                </div>
                <div className="metric">
                  <span className="metric-value">89</span>
                  <span className="metric-label">Clicks</span>
                </div>
                <div className="metric">
                  <span className="metric-value">7.2%</span>
                  <span className="metric-label">CTR</span>
                </div>
              </div>
              
              <div className="campaign-actions">
                <button className="btn btn-sm btn-outline">
                  <i className="fas fa-chart-bar"></i>
                  View Analytics
                </button>
                <button className="btn btn-sm btn-primary">
                  <i className="fas fa-edit"></i>
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Special Offers Component
const SpecialOffers = ({ offers, setOffers }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOffer, setNewOffer] = useState({
    title: '',
    type: 'percentage',
    value: '',
    description: '',
    validUntil: '',
    minPurchase: '',
    maxUses: '',
    isActive: true
  });

  const offerTypes = [
    { value: 'percentage', label: 'Percentage Discount', symbol: '%' },
    { value: 'fixed', label: 'Fixed Amount Off', symbol: '$' },
    { value: 'bogo', label: 'Buy One Get One', symbol: '2x' },
    { value: 'free_service', label: 'Free Service', symbol: 'FREE' }
  ];

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newOffer)
      });

      if (response.ok) {
        const offer = await response.json();
        setOffers([...offers, offer]);
        setShowCreateForm(false);
        setNewOffer({
          title: '',
          type: 'percentage',
          value: '',
          description: '',
          validUntil: '',
          minPurchase: '',
          maxUses: '',
          isActive: true
        });
      }
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  return (
    <div className="offers-content">
      <div className="offers-header">
        <h3>Special Offers</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          <i className="fas fa-plus"></i>
          Create Offer
        </button>
      </div>

      {showCreateForm && (
        <div className="offer-form-overlay">
          <div className="offer-form">
            <div className="form-header">
              <h4>Create Special Offer</h4>
              <button 
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateOffer}>
              <div className="form-group">
                <label>Offer Title</label>
                <input
                  type="text"
                  value={newOffer.title}
                  onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                  placeholder="e.g., Summer Special 20% Off"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Offer Type</label>
                  <select
                    value={newOffer.type}
                    onChange={(e) => setNewOffer({...newOffer, type: e.target.value})}
                  >
                    {offerTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Value</label>
                  <input
                    type="number"
                    value={newOffer.value}
                    onChange={(e) => setNewOffer({...newOffer, value: e.target.value})}
                    placeholder="20"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newOffer.description}
                  onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                  placeholder="Describe the offer details and terms"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valid Until</label>
                  <input
                    type="date"
                    value={newOffer.validUntil}
                    onChange={(e) => setNewOffer({...newOffer, validUntil: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Max Uses</label>
                  <input
                    type="number"
                    value={newOffer.maxUses}
                    onChange={(e) => setNewOffer({...newOffer, maxUses: e.target.value})}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="offers-grid">
        {offers.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-tags"></i>
            <h4>No Special Offers</h4>
            <p>Create attractive offers to boost sales and attract new customers</p>
          </div>
        ) : (
          offers.map((offer, index) => (
            <div key={index} className="offer-card">
              <div className="offer-badge">
                <span className="offer-value">
                  {offer.value}{offerTypes.find(t => t.value === offer.type)?.symbol}
                </span>
                <span className="offer-type">OFF</span>
              </div>
              
              <div className="offer-content">
                <h4>{offer.title}</h4>
                <p>{offer.description}</p>
                
                <div className="offer-details">
                  <div className="detail">
                    <i className="fas fa-calendar"></i>
                    <span>Valid until {new Date(offer.validUntil).toLocaleDateString()}</span>
                  </div>
                  <div className="detail">
                    <i className="fas fa-users"></i>
                    <span>{offer.usedCount || 0} / {offer.maxUses || '∞'} used</span>
                  </div>
                </div>
              </div>
              
              <div className="offer-actions">
                <button className="btn btn-sm btn-outline">
                  <i className="fas fa-share"></i>
                  Share
                </button>
                <button className="btn btn-sm btn-primary">
                  <i className="fas fa-edit"></i>
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Store Analytics Component
const StoreAnalytics = ({ storeData }) => {
  return (
    <div className="analytics-content">
      <h3>Store Performance Analytics</h3>
      <div className="analytics-placeholder">
        <i className="fas fa-chart-line"></i>
        <h4>Analytics Coming Soon</h4>
        <p>Detailed analytics and reporting features will be available in the next update.</p>
      </div>
    </div>
  );
};

// Store Settings Component
const StoreSettings = ({ storeData, setStoreData }) => {
  return (
    <div className="settings-content">
      <h3>Store Settings</h3>
      <div className="settings-placeholder">
        <i className="fas fa-cog"></i>
        <h4>Settings Panel Coming Soon</h4>
        <p>Store configuration and settings will be available in the next update.</p>
      </div>
    </div>
  );
};

export default StoreManagement;
