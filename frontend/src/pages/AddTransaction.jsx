import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { transactionAPI, customerAPI } from '../services/api';
import '../styles/Form.css';

const AddTransaction = () => {
  const { customerId: paramCustomerId } = useParams();
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState(paramCustomerId || '');
  const [type, setType] = useState('credit');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [billImage, setBillImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getCustomers();
      setCustomers(response.data.customers || []);
    } catch (err) {
      setError('Failed to load customers');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 16 * 1024 * 1024) {
        setError('File size must be less than 16MB');
        return;
      }
      setBillImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerId || !type || !amount) {
      setError('Customer, type, and amount are required');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('customer_id', customerId);
      formData.append('type', type);
      formData.append('amount', amountNum);
      formData.append('notes', notes);
      if (billImage) {
        formData.append('bill_image', billImage);
      }

      await transactionAPI.createTransaction(formData);
      
      if (paramCustomerId) {
        navigate(`/customer/${paramCustomerId}`);
      } else {
        navigate('/transactions');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="form-page">
        <div className="form-container">
          <h1>Add Transaction</h1>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="customer">Select Customer *</label>
              <select
                id="customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                disabled={loading || paramCustomerId}
              >
                <option value="">-- Select Customer --</option>
                {customers.map((customer) => (
                  <option key={customer.$id} value={customer.$id}>
                    {customer.name} ({customer.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Transaction Type *</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="credit"
                    checked={type === 'credit'}
                    onChange={(e) => setType(e.target.value)}
                    disabled={loading}
                  />
                  Credit (Given)
                </label>
                <label>
                  <input
                    type="radio"
                    value="payment"
                    checked={type === 'payment'}
                    onChange={(e) => setType(e.target.value)}
                    disabled={loading}
                  />
                  Payment (Received)
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount *</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                step="0.01"
                min="0"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes..."
                rows="3"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="billImage">Bill Image (Optional)</label>
              <input
                type="file"
                id="billImage"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
              />
              {billImage && <p className="file-name">{billImage.name}</p>}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddTransaction;
