/**
 * AddCustomer Page - Add a new customer
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';

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
    <div className="customer-dashboard">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/customers')}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h1>Add New Customer</h1>
      </div>

      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      <div className="auth-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Customer Name *</label>
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

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Mobile Number *</label>
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

          <button type="submit" className="btn primary-btn" disabled={loading}>
            <i className="fas fa-user-plus"></i> {loading ? 'Adding...' : 'Add Customer'}
          </button>
          
          <button 
            type="button" 
            className="btn secondary-btn" 
            onClick={() => navigate('/customers')}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
