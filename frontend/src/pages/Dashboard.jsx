/**
 * Dashboard Page - Modern Flat Design (PhonePe-inspired)
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, qrAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';
import '../styles/DashboardModern.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [accessPin, setAccessPin] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  useEffect(() => {
    loadDashboard();
    loadAccessPin();
  }, []);

  useEffect(() => {
    if (showQR && !qrCodeUrl) {
      loadQRCode();
    }
    
    // Cleanup QR code URL on unmount
    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [showQR]);

  const loadQRCode = async () => {
    try {
      const response = await qrAPI.getQRCode();
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Failed to load QR code:', error);
      setMessages([{
        type: 'error',
        message: 'Failed to load QR code. Please try again.'
      }]);
    }
  };

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
      <div className="dashboard-modern">
        <div className="dashboard-container-modern">
          {/* Skeleton Hero Card */}
          <div className="skeleton-hero-card"></div>
          
          {/* Skeleton Stats */}
          <div className="quick-stats-row">
            <div className="skeleton-stat-card skeleton"></div>
            <div className="skeleton-stat-card skeleton"></div>
            <div className="skeleton-stat-card skeleton"></div>
          </div>
          
          {/* Skeleton Action Grid */}
          <div className="action-grid-modern">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-action-card skeleton"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-modern">
      <div className="dashboard-container-modern">
        <FlashMessage messages={messages} onClose={() => setMessages([])} />

        {/* Hero Card - Total to Receive */}
        <div className="hero-card">
          <div className="hero-label">TOTAL TO RECEIVE</div>
          <div className="hero-amount">₹{summary?.outstanding_balance?.toFixed(2) || '0.00'}</div>
        </div>

        {/* Action Grid - Revolut Style */}
        <div className="action-grid-modern">
          <Link to="/customers" className="action-card">
            <div className="action-icon-modern icon-purple">
              <i className="fas fa-users"></i>
            </div>
            <div className="action-label-modern">Customers</div>
          </Link>

          <Link to="/products" className="action-card">
            <div className="action-icon-modern icon-green">
              <i className="fas fa-box"></i>
            </div>
            <div className="action-label-modern">Products</div>
          </Link>

          <Link to="/transactions" className="action-card">
            <div className="action-icon-modern icon-blue">
              <i className="fas fa-receipt"></i>
            </div>
            <div className="action-label-modern">Transactions</div>
          </Link>

          <Link to="/add-customer" className="action-card">
            <div className="action-icon-modern icon-purple">
              <i className="fas fa-user-plus"></i>
            </div>
            <div className="action-label-modern">Add Customer</div>
          </Link>

          <Link to="/add-product" className="action-card">
            <div className="action-icon-modern icon-green">
              <i className="fas fa-plus-circle"></i>
            </div>
            <div className="action-label-modern">Add Product</div>
          </Link>

          <Link to="/invoice" className="action-card">
            <div className="action-icon-modern icon-blue">
              <i className="fas fa-file-invoice"></i>
            </div>
            <div className="action-label-modern">Generate Invoice</div>
          </Link>

          <button className="action-card" onClick={() => setShowQR(!showQR)} style={{border: '1px solid var(--border-light)', background: 'white', cursor: 'pointer'}}>
            <div className="action-icon-modern icon-orange">
              <i className="fas fa-qrcode"></i>
            </div>
            <div className="action-label-modern">QR Code</div>
          </button>
        </div>

        {/* WhatsApp Button */}
        <Link to="/bulk-reminders" className="whatsapp-btn-modern">
          <i className="fab fa-whatsapp" style={{fontSize: '24px'}}></i>
          <span>Send All Reminders</span>
        </Link>

        {/* QR Section */}
        {showQR && (
          <div className="section-modern">
            <h3 style={{fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)', color: 'var(--text-primary)'}}>Customer Connection</h3>
            <p style={{fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)'}}>Share these details with your customers to connect</p>
            <div style={{background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', textAlign: 'center'}}>
              <div style={{fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)'}}>Your Business PIN</div>
              <div style={{fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-purple)', letterSpacing: '4px'}}>{accessPin}</div>
            </div>
            <div style={{background: 'white', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', display: 'flex', justifyContent: 'center'}}>
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl}
                  alt="Business QR Code"
                  style={{maxWidth: '100%', height: 'auto', maxHeight: '250px'}}
                />
              ) : (
                <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
                  <i className="fas fa-spinner fa-spin" style={{fontSize: '24px', marginBottom: '12px'}}></i>
                  <p>Loading QR Code...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Customers */}
        <div className="section-modern">
          <div className="section-header-modern">
            <h3 className="section-title-modern">Recent Customers</h3>
            <Link to="/customers" className="view-all-link-modern">View All</Link>
          </div>
          {(summary?.recent_customers && summary.recent_customers.length > 0) ? (
            <div>
              {summary.recent_customers.slice(0, 3).map((customer, index) => {
                // Ensure balance is a number and handle properly
                const balance = parseFloat(customer.balance) || 0;
                // Assign varied avatar colors using modulo rotation
                const colorClass = `avatar-color-${index % 10}`;
                return (
                  <Link 
                    key={customer.id} 
                    to={`/customer/${customer.id}`}
                    className="customer-item-modern"
                  >
                    <div className={`customer-avatar-modern ${colorClass}`}>
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="customer-info-modern">
                      <div className="customer-name-modern">{customer.name}</div>
                      <div className="customer-phone-modern">{customer.phone_number}</div>
                    </div>
                    <div className={`customer-balance-modern ${balance >= 0 ? 'balance-positive' : 'balance-negative'}`}>
                      ₹{Math.abs(balance).toFixed(2)}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-users"></i>
              <h3>No Customers Yet</h3>
              <p>Add your first customer to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
