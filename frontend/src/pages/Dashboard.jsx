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
    <div className="dashboard-container">
      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      {/* Business Profile Card */}
      <div className="business-profile-card">
        <div className="business-icon">
          <i className="fas fa-store"></i>
        </div>
        <div className="business-details">
          <h2 className="business-name">{business?.name || 'Your Business'}</h2>
          <p className="business-subtitle">My business account</p>
          <Link to="/profile" className="edit-profile-link">
            <i className="fas fa-edit"></i> Edit Profile
          </Link>
        </div>
      </div>

      {/* Total to Receive Card */}
      <div className="total-receive-card">
        <div className="receive-icon">
          <i className="fas fa-wallet"></i>
        </div>
        <div className="receive-details">
          <div className="receive-label">TOTAL TO RECEIVE</div>
          <div className="receive-amount">₹{summary?.outstanding_balance?.toFixed(2) || '0.00'}</div>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="action-grid">
        <Link to="/customers" className="action-button">
          <div className="action-icon blue">
            <i className="fas fa-users"></i>
          </div>
          <div className="action-label">View Customers</div>
        </Link>

        <Link to="/transactions" className="action-button">
          <div className="action-icon red">
            <i className="fas fa-receipt"></i>
          </div>
          <div className="action-label">View Transactions</div>
        </Link>

        <Link to="/add-customer" className="action-button">
          <div className="action-icon green">
            <i className="fas fa-user-plus"></i>
          </div>
          <div className="action-label">Add Customer</div>
        </Link>

        <button className="action-button" onClick={() => setShowQR(!showQR)}>
          <div className="action-icon orange">
            <i className="fas fa-qrcode"></i>
          </div>
          <div className="action-label">QR Code</div>
        </button>
      </div>

      {/* Send All Reminders Button */}
      <Link to="/bulk-reminders" className="whatsapp-reminder-btn">
        <i className="fab fa-whatsapp"></i> Send All Reminders
      </Link>

      {/* QR Code Section */}
      {showQR && (
        <div className="qr-section">
          <h3>Customer Connection</h3>
          <p>Share these details with your customers to connect</p>
          <div className="pin-display">
            <strong>Your Business PIN:</strong>
            <div className="pin-number">{accessPin}</div>
            <small>Permanent identifier for your business</small>
          </div>
          <div className="qr-code-container">
            <img 
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:5003/api'}/business/qr-code`} 
              alt="Business QR Code"
            />
          </div>
        </div>
      )}

      {/* Your Customers Section */}
      <div className="customers-section">
        <div className="section-header">
          <h3>Your Customers</h3>
          <Link to="/customers" className="view-all-link">View All</Link>
        </div>
        {summary?.recent_customers?.length > 0 ? (
          <div className="customers-preview">
            {summary.recent_customers.slice(0, 3).map((customer) => (
              <Link 
                key={customer.id} 
                to={`/customer/${customer.id}`}
                className="customer-preview-item"
              >
                <div className="customer-avatar">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="customer-info">
                  <div className="customer-name">{customer.name}</div>
                  <div className="customer-phone">{customer.phone_number}</div>
                </div>
                <div className={`customer-balance ${customer.balance >= 0 ? 'positive' : 'negative'}`}>
                  ₹{Math.abs(customer.balance).toFixed(2)}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-users"></i>
            <p>No customers yet. Add your first customer to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
