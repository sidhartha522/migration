import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { dashboardAPI } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleQRCode = (e) => {
    e.preventDefault();
    setShowQR(!showQR);
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i> Loading dashboard...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-message">{error}</div>
      </Layout>
    );
  }

  const { business, summary, recent_transactions, pending_customers } = dashboardData || {};

  return (
    <Layout>
      <div className="dashboard-container">
        {/* Business Profile Section */}
        <div className="profile-card">
          <div className="profile-image">
            {business?.profile_photo_url ? (
              <img src={business.profile_photo_url} alt="Business Profile" />
            ) : (
              <div className="placeholder">
                <i className="fas fa-store"></i>
              </div>
            )}
          </div>
          <div className="profile-info">
            <h2>{business?.name || 'Business Name'}</h2>
            <p>{business?.description || 'Business Description'}</p>
            <Link to="/profile" className="edit-profile-link">
              <i className="fas fa-edit"></i> Edit Profile
            </Link>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="summary-cards">
          <div className="summary-card balance-card">
            <div className="summary-icon">
              <i className="fas fa-wallet"></i>
            </div>
            <div className="summary-content">
              <div className="summary-label">TOTAL TO RECEIVE</div>
              <div className="summary-amount">₹{summary?.outstanding_balance?.toFixed(2) || '0.00'}</div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="action-buttons">
          <Link to="/customers" className="action-btn customers-btn">
            <i className="fas fa-users"></i>
            <span>View Customers</span>
          </Link>
          <Link to="/transactions" className="action-btn transactions-btn">
            <i className="fas fa-receipt"></i>
            <span>View Transactions</span>
          </Link>
          <Link to="/add-customer" className="action-btn add-btn">
            <i className="fas fa-user-plus"></i>
            <span>Add Customer</span>
          </Link>
          <a href="#" className="action-btn qr-btn" onClick={toggleQRCode}>
            <i className="fas fa-qrcode"></i>
            <span>QR Code</span>
          </a>
        </div>

        {/* Bulk Actions */}
        <div className="bulk-actions">
          <Link to="/bulk-reminders" className="bulk-action-btn remind-all-btn" title="Send WhatsApp reminders to all customers with outstanding balances">
            <i className="fab fa-whatsapp"></i>
            <span>Send All Reminders</span>
          </Link>
        </div>

        {/* QR Code Section */}
        {showQR && (
          <div className="connect-card" id="qr-section">
            <div className="connect-header">
              <h3>Customer Connection</h3>
              <p>Share these details with your customers to connect</p>
            </div>
            <div className="connect-content">
              <div className="pin-display">
                <span className="label">Your Business PIN:</span>
                <span className="pin">{business?.pin || 'N/A'}</span>
                <span className="pin-subtitle">Permanent identifier for your business</span>
              </div>
            
              <div className="qr-code-container">
                <div className="qr-code">
                  <img src={`/api/business/qr/${business?.id}`} alt="Business QR Code" />
                </div>
                <p className="qr-info">Scan to connect with {business?.name}</p>
              </div>
            </div>
          </div>
        )}
             
        {/* Customers Section */}
        <div className="section-header">
          <h3>Your Customers</h3>
          <Link to="/customers" className="view-all">View All</Link>
        </div>

        {pending_customers && pending_customers.length > 0 ? (
          <div className="customer-list">
            {pending_customers.slice(0, 5).map((customer) => (
              <Link
                key={customer.id}
                to={`/customer/${customer.id}`}
                className="customer-card"
              >
                <div className="customer-avatar">
                  {customer.profile_photo_url ? (
                    <img src={customer.profile_photo_url} alt={customer.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {customer.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div className="customer-info">
                  <div className="customer-name">{customer.name}</div>
                  <div className={`customer-balance ${customer.balance > 0 ? 'positive' : ''}`}>
                    ₹{customer.balance?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div className="customer-actions">
                  <a href={`https://wa.me/${customer.phone}?text=Hello%20${customer.name}`} className="remind-btn" target="_blank" rel="noreferrer" title="Send WhatsApp reminder" onClick={(e) => e.stopPropagation()}>
                    <i className="fab fa-whatsapp"></i>
                  </a>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-users"></i>
            <p>No customers yet</p>
            <Link to="/add-customer" className="btn btn-primary">Add your first customer</Link>
          </div>
        )}

        {/* Transactions Section */}
        <div className="section-header">
          <h3>Recent Transactions</h3>
          <Link to="/transactions" className="view-all">View All</Link>
        </div>

        {recent_transactions && recent_transactions.length > 0 ? (
          <div className="transaction-list">
            {recent_transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.$id} className="transaction-card">
                <div className={`transaction-icon ${transaction.type === 'credit' ? 'credit-icon' : 'payment-icon'}`}>
                  {transaction.type === 'credit' ? (
                    <i className="fas fa-arrow-up"></i>
                  ) : (
                    <i className="fas fa-arrow-down"></i>
                  )}
                </div>
                <div className="transaction-info">
                  <div className="transaction-name">{transaction.customer_name || 'Unknown'}</div>
                  <div className="transaction-date">
                    {new Date(transaction.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === 'credit' ? '+' : '-'}₹{parseFloat(transaction.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-receipt"></i>
            <p>No transactions yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
