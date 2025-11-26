/**
 * Dashboard Page - Business Dashboard
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, qrAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [accessPin, setAccessPin] = useState('');

  useEffect(() => {
    loadDashboard();
    loadAccessPin();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardAPI.getDashboard();
      setSummary(response.data.summary);
      setBusiness(response.data.business);
    } catch (error) {
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to load dashboard'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const loadAccessPin = async () => {
    try {
      const response = await qrAPI.getAccessPin();
      setAccessPin(response.data.access_pin);
    } catch (error) {
      console.error('Failed to load access pin', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      {/* Business Profile Section */}
      <div className="profile-section">
        <div className="profile-image">
          {business?.profile_photo_url ? (
            <img src={business.profile_photo_url} alt="Business Profile" />
          ) : (
            <i className="fas fa-store"></i>
          )}
        </div>
        <div className="profile-info">
          <h2>{business?.name || 'Your Business'}</h2>
          <p className="phone-number">
            <i className="fas fa-phone"></i> {business?.phone}
          </p>
          {business?.description && <p>{business.description}</p>}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Financial Summary</h3>
        </div>
        <div className="summary-cards">
          <div className="card">
            <div className="card-icon" style={{backgroundColor: 'var(--danger-color)'}}>
              <i className="fas fa-wallet"></i>
            </div>
            <div className="card-content">
              <div className="card-label">Total to Receive</div>
              <div className="card-amount" style={{color: 'var(--danger-color)'}}>
                ₹{summary?.total_outstanding || '0.00'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Quick Actions</h3>
        </div>
        <div className="quick-links">
          <Link to="/customers" className="quick-link-card">
            <div className="quick-link-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="quick-link-text">View Customers</div>
          </Link>
          
          <Link to="/transactions" className="quick-link-card">
            <div className="quick-link-icon">
              <i className="fas fa-receipt"></i>
            </div>
            <div className="quick-link-text">View Transactions</div>
          </Link>
          
          <Link to="/add-customer" className="quick-link-card">
            <div className="quick-link-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <div className="quick-link-text">Add Customer</div>
          </Link>
          
          <button 
            className="quick-link-card" 
            onClick={() => setShowQR(!showQR)}
            style={{border: 'none', background: 'rgba(255, 255, 255, 0.5)'}}
          >
            <div className="quick-link-icon">
              <i className="fas fa-qrcode"></i>
            </div>
            <div className="quick-link-text">QR Code</div>
          </button>
        </div>
      </div>

      {/* QR Code Section */}
      {showQR && (
        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">Customer Connection</h3>
          </div>
          <div className="card" style={{textAlign: 'center'}}>
            <p>Share these details with your customers to connect</p>
            <div className="pin-display" style={{margin: '20px 0', padding: '20px', backgroundColor: 'var(--light-color)', borderRadius: '12px'}}>
              <strong>Your Business PIN:</strong>
              <div style={{fontSize: '2rem', color: 'var(--primary-color)', fontWeight: '700', margin: '10px 0'}}>
                {accessPin}
              </div>
              <small>Permanent identifier for your business</small>
            </div>
            <div className="qr-code-container" style={{margin: '20px 0'}}>
              <img 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/business/qr-code`} 
                alt="Business QR Code" 
                style={{maxWidth: '300px', border: '2px solid var(--input-border)', borderRadius: '12px'}}
              />
            </div>
          </div>
        </div>
      )}

      {/* Recent Customers */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Recent Customers</h3>
          <Link to="/customers" className="add-business-btn">
            View All <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        {/* Customer list will be added here */}
      </div>
    </div>
  );
};

export default Dashboard;
