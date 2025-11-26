/**
 * Customers Page - View all customers
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customerAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customerAPI.getCustomers();
      setCustomers(response.data.customers || []);
    } catch (error) {
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to load customers'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadCustomers();
      return;
    }
    
    try {
      const response = await customerAPI.searchCustomers(searchQuery);
      setCustomers(response.data.customers || []);
    } catch (error) {
      setMessages([{
        type: 'error',
        message: 'Search failed'
      }]);
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
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h1>Your Customers</h1>
      </div>

      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      <div className="dashboard-section">
        <div className="search-bar" style={{marginBottom: '20px'}}>
          <input
            type="text"
            className="form-input"
            placeholder="Search customers by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn primary-btn" onClick={handleSearch} style={{marginTop: '10px'}}>
            <i className="fas fa-search"></i> Search
          </button>
        </div>

        <Link to="/add-customer" className="btn primary-btn" style={{marginBottom: '20px'}}>
          <i className="fas fa-user-plus"></i> Add New Customer
        </Link>

        {customers.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-users"></i>
            <p>No customers found</p>
            <p className="empty-hint">Add your first customer to get started</p>
          </div>
        ) : (
          <div className="businesses-list">
            {customers.map((customer) => (
              <Link
                key={customer.id}
                to={`/customer/${customer.id}`}
                className="business-card"
              >
                <div className="business-card-inner">
                  <div className="business-icon">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="business-info">
                    <div className="business-name">{customer.name}</div>
                    <div className="business-balance" 
                         style={{color: customer.balance > 0 ? 'var(--danger-color)' : 'var(--secondary-color)'}}>
                      ₹{Math.abs(customer.balance || 0).toFixed(2)} {customer.balance > 0 ? 'to receive' : 'received'}
                    </div>
                  </div>
                  <div className="business-arrow">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
