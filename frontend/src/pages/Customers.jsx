/**
 * Customers Page - Modern App Design
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';
import SearchBar from '../components/SearchBar';
import '../styles/CustomersModern.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

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
      <div className="customers-modern">
        {/* Skeleton Search */}
        <div className="search-section-card">
          <div className="skeleton" style={{height: '48px', borderRadius: '12px'}}></div>
        </div>
        
        {/* Skeleton Customer Cards */}
        <div className="customers-container-modern">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="customer-item-card" style={{pointerEvents: 'none'}}>
              <div className="skeleton skeleton-circle" style={{width: '48px', height: '48px'}}></div>
              <div style={{flex: 1}}>
                <div className="skeleton" style={{height: '16px', width: '60%', marginBottom: '8px'}}></div>
                <div className="skeleton" style={{height: '14px', width: '40%'}}></div>
              </div>
              <div className="skeleton" style={{height: '20px', width: '80px'}}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="customers-modern">
      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      {/* Search Section */}
      <div className="search-section-card">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customers..."
          onClear={() => {
            setSearchQuery('');
            loadCustomers();
          }}
        />
      </div>

      {/* Add Customer FAB */}
      <Link to="/add-customer" className="fab-add">
        <i className="fas fa-user-plus"></i>
      </Link>

      {customers.length === 0 ? (
        <div className="empty-state-modern">
          <div className="icon-wrapper" style={{ backgroundColor: 'var(--purple-light)', fontSize: '48px', width: '80px', height: '80px' }}>
            <i className="fas fa-users" style={{ color: 'var(--primary-purple)' }}></i>
          </div>
          <h3>No Customers Yet</h3>
          <p>Start adding customers to track their transactions</p>
          <Link to="/add-customer" className="btn btn-primary">
            <i className="fas fa-user-plus"></i> Add First Customer
          </Link>
        </div>
      ) : (
        <div className="customers-container-modern">
          {customers.map((customer, index) => {
            // Ensure balance is properly parsed as a number
            const balance = parseFloat(customer.balance) || 0;
            // Assign varied colors to avatars using modulo for rotation
            const colorClass = `avatar-color-${index % 10}`;
            return (
              <div key={customer.id} className="customer-item-card">
                <Link
                  to={`/customer/${customer.id}`}
                  className="customer-link-wrapper"
                >
                  <div className={`customer-avatar-circle ${colorClass}`}>
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="customer-details">
                    <div className="customer-name-text">{customer.name}</div>
                    <div className="customer-phone-text">{customer.phone_number || customer.phone}</div>
                  </div>
                  <div className="customer-balance-amount">
                    <div className={`balance-value ${balance > 0 ? 'positive' : 'negative'}`}>
                      ₹{Math.abs(balance).toFixed(2)}
                    </div>
                    <div className="balance-label">
                      {balance > 0 ? 'TO RECEIVE' : 'RECEIVED'}
                    </div>
                  </div>
                  <i className="fas fa-chevron-right" style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}></i>
                </Link>
                <a
                  href={`https://wa.me/91${customer.phone_number || customer.phone}?text=Hi ${customer.name}, your balance is ₹${Math.abs(balance).toFixed(2)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn-customer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <i className="fab fa-whatsapp"></i>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Customers;
