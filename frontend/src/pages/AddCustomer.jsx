/**
 * AddCustomer Page - Add a new customer
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';
import '../styles/AddCustomerModern.css';

const AddCustomer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      setMessages([{ type: 'error', message: 'All fields are required' }]);
      return;
    }

    // Validate phone number
    if (!formData.phone.match(/^\d{10}$/)) {
      setMessages([{ type: 'error', message: 'Phone number must be exactly 10 digits' }]);
      return;
    }

    setLoading(true);
    setMessages([]);

    try {
      await customerAPI.addCustomer(formData);
      setMessages([{ type: 'success', message: 'Customer added successfully!' }]);
      setTimeout(() => {
        navigate('/customers');
      }, 1000);
    } catch (error) {
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to add customer'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-customer-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/customers')}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="page-title">Add New Customer</h1>
      </div>

      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      <form onSubmit={handleSubmit} className="customer-form">
        <div className="form-card">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Customer Name *</label>
            <div className="icon-input-wrapper">
              <i className="fas fa-user input-icon"></i>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter customer name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Mobile Number *</label>
            <div className="icon-input-wrapper">
              <i className="fas fa-phone input-icon"></i>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter 10-digit mobile number"
                required
              />
            </div>
            <div className="form-helper">Must be exactly 10 digits</div>
          </div>
        </div>

        <div className="info-card">
          <div className="info-card-header">
            <div className="info-card-icon">
              <i className="fas fa-info"></i>
            </div>
            <h3 className="info-card-title">Quick Tip</h3>
          </div>
          <p className="info-card-text">
            You can add transactions to this customer after creating their profile.
          </p>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Adding Customer...' : 'Add Customer'}
        </button>
      </form>
    </div>
  );
};

export default AddCustomer;
