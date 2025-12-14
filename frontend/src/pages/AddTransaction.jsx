/**
 * AddTransaction Page - Add a transaction for a customer
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { transactionAPI, customerAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';
import '../styles/AddTransactionModern.css';

const AddTransaction = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [customer, setCustomer] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [formData, setFormData] = useState({
    customer_id: customerId,
    transaction_type: searchParams.get('type') || 'credit',
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
      setLoadingCustomer(true);
      const response = await customerAPI.getCustomer(customerId);
      setCustomer(response.data.customer);
    } catch (error) {
      setMessages([{
        type: 'error',
        message: 'Failed to load customer details'
      }]);
    } finally {
      setLoadingCustomer(false);
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
    <div className="add-transaction-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(`/customer/${customerId}`)}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="page-title">Add Transaction</h1>
      </div>

      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      {loadingCustomer ? (
        <div className="customer-info-card">
          <div className="skeleton skeleton-circle" style={{width: '40px', height: '40px'}}></div>
          <div style={{flex: 1}}>
            <div className="skeleton" style={{height: '16px', width: '60%', marginBottom: '8px'}}></div>
            <div className="skeleton" style={{height: '14px', width: '40%'}}></div>
          </div>
        </div>
      ) : customer && (
        <div className="customer-info-card">
          <div className="customer-avatar-small">
            {customer.name.charAt(0)}
          </div>
          <div className="customer-info-text">
            <div className="customer-name">{customer.name}</div>
            <div className={`customer-balance ${customer.balance > 0 ? 'positive' : 'negative'}`}>
              ₹{Math.abs(customer.balance || 0).toFixed(2)} {customer.balance > 0 ? 'to receive' : 'received'}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="type-selector">
          <label className={`type-option type-credit ${formData.transaction_type === 'credit' ? 'active' : ''}`}>
            <input
              type="radio"
              name="transaction_type"
              value="credit"
              checked={formData.transaction_type === 'credit'}
              onChange={handleChange}
            />
            <div className="type-icon">
              <i className="fas fa-arrow-up"></i>
            </div>
            <div className="type-label">Credit</div>
            <div className="type-sublabel">You Gave</div>
          </label>
          <label className={`type-option type-payment ${formData.transaction_type === 'payment' ? 'active' : ''}`}>
            <input
              type="radio"
              name="transaction_type"
              value="payment"
              checked={formData.transaction_type === 'payment'}
              onChange={handleChange}
            />
            <div className="type-icon">
              <i className="fas fa-arrow-down"></i>
            </div>
            <div className="type-label">Payment</div>
            <div className="type-sublabel">You Received</div>
          </label>
        </div>

        <div className="amount-input-card">
          <div className="amount-label">Amount</div>
          <div className="amount-input-wrapper">
            <span className="currency-symbol">₹</span>
            <input
              type="number"
              id="amount"
              name="amount"
              className="amount-input"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-card">
          <div className="form-group">
            <label htmlFor="notes" className="form-label">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              className="form-textarea"
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
              className="form-file-input"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Adding Transaction...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
};

export default AddTransaction;
