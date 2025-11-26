import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { customerAPI } from '../services/api';
import '../styles/Form.css';

const AddCustomer = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !phone) {
      setError('Name and phone number are required');
      return;
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);

    try {
      await customerAPI.addCustomer({ name, phone });
      navigate('/customers');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="form-page">
        <div className="form-container">
          <h1>Add New Customer</h1>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="name">Customer Name *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter customer name"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit phone number"
                maxLength="10"
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/customers')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Customer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddCustomer;
