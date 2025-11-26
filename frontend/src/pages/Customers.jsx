import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
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
      <Layout>
        <div className="loading">Loading customers...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="customers-page">
        <div className="page-header">
          <h1>Customers</h1>
          <Link to="/add-customer" className="btn btn-primary">
            Add Customer
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <p>No customers found</p>
            <Link to="/add-customer" className="btn btn-secondary">
              Add Your First Customer
            </Link>
          </div>
        ) : (
          <div className="customers-grid">
            {filteredCustomers.map((customer) => (
              <Link
                key={customer.$id}
                to={`/customer/${customer.$id}`}
                className="customer-card"
              >
                <div className="customer-info">
                  <h3>{customer.name}</h3>
                  <p className="phone">{customer.phone}</p>
                </div>
                <div className="customer-stats">
                  <div className="stat">
                    <span className="label">Balance:</span>
                    <span className={`value ${customer.balance > 0 ? 'positive' : ''}`}>
                      ₹{customer.balance?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="label">Transactions:</span>
                    <span className="value">{customer.transaction_count || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Customers;
