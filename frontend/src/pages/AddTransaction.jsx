/**
 * AddTransaction Page - Add a transaction for a customer
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transactionAPI, customerAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';

const AddTransaction = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: customerId,
    transaction_type: 'credit',
    amount: '',
    notes: '',
    bill_photo: null
  });
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  const loadCustomer = async () => {
    try {
      const response = await customerAPI.getCustomer(customerId);
      setCustomer(response.data.customer);
    } catch (error) {
      setMessages([{
        type: 'error',
        message: 'Failed to load customer details'
      }]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        bill_photo: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setMessages([{ type: 'error', message: 'Please enter a valid amount' }]);
      return;
    }

    setLoading(true);
    setMessages([]);

    try {
      await transactionAPI.createTransaction(formData);
      setMessages([{ type: 'success', message: 'Transaction added successfully!' }]);
      setTimeout(() => {
        navigate(`/customer/${customerId}`);
      }, 1000);
    } catch (error) {
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to add transaction'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-dashboard">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(`/customer/${customerId}`)}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h1>Add Transaction</h1>
      </div>

      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      {customer && (
        <div className="card" style={{marginBottom: '20px'}}>
          <h3>{customer.name}</h3>
          <p>Current Balance: ₹{Math.abs(customer.balance || 0).toFixed(2)} {customer.balance > 0 ? 'to receive' : 'received'}</p>
        </div>
      )}

      <div className="auth-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Transaction Type *</label>
            <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
              <label style={{flex: 1, display: 'flex', alignItems: 'center', padding: '14px', border: `2px solid ${formData.transaction_type === 'credit' ? 'var(--danger-color)' : 'var(--input-border)'}`, borderRadius: '12px', cursor: 'pointer'}}>
                <input
                  type="radio"
                  name="transaction_type"
                  value="credit"
                  checked={formData.transaction_type === 'credit'}
                  onChange={handleChange}
                  style={{marginRight: '8px'}}
                />
                <span>Credit (You Gave)</span>
              </label>
              <label style={{flex: 1, display: 'flex', alignItems: 'center', padding: '14px', border: `2px solid ${formData.transaction_type === 'payment' ? 'var(--secondary-color)' : 'var(--input-border)'}`, borderRadius: '12px', cursor: 'pointer'}}>
                <input
                  type="radio"
                  name="transaction_type"
                  value="payment"
                  checked={formData.transaction_type === 'payment'}
                  onChange={handleChange}
                  style={{marginRight: '8px'}}
                />
                <span>Payment (You Received)</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="amount" className="form-label">Amount *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              className="form-input"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes" className="form-label">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              className="form-input"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes about this transaction"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bill_photo" className="form-label">Bill Photo (Optional)</label>
            <input
              type="file"
              id="bill_photo"
              name="bill_photo"
              className="form-input"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>

          <button type="submit" className="btn primary-btn" disabled={loading}>
            <i className="fas fa-check"></i> {loading ? 'Adding...' : 'Add Transaction'}
          </button>
          
          <button 
            type="button" 
            className="btn secondary-btn" 
            onClick={() => navigate(`/customer/${customerId}`)}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
