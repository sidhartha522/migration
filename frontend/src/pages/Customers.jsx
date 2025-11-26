import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerAPI } from '../services/api';
import '../styles/Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getCustomers();
      setCustomers(response.data.customers || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="loading">
        <i className="fas fa-spinner fa-spin"></i> Loading customers...
      </div>
    );
  }

  return (
    <div className="customer-container">
        <div className="section-actions">
          <Link to="/" className="back-btn">
            <i className="fas fa-arrow-left"></i> Back
          </Link>
          <Link to="/add-customer" className="add-btn">
            <i className="fas fa-user-plus"></i> Add Customer
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search search-icon"></i>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-users"></i>
            <p>No customers yet</p>
            <Link to="/add-customer" className="btn-primary">
              Add your first customer
            </Link>
          </div>
        ) : (
          <div className="customer-list">
            {filteredCustomers.map((customer) => (
              <Link
                key={customer.$id}
                to={`/customer/${customer.$id}`}
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
                  <h3 className="customer-name">{customer.name}</h3>
                  <p className="customer-phone">{customer.phone}</p>
                </div>
                <div className={`customer-balance ${customer.balance > 0 ? 'positive' : ''}`}>
                  ₹{customer.balance?.toFixed(2) || '0.00'}
                </div>
                <div className="remind-action">
                  <a
                    href={`https://wa.me/${customer.phone}?text=Hello%20${customer.name}`}
                    className="remind-btn"
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                    rel="noreferrer"
                    title="Send WhatsApp reminder"
                  >
                    <i className="fab fa-whatsapp"></i>
                  </a>
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
