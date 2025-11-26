import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { recurringAPI, customerAPI } from '../services/api';
import '../styles/Form.css';

const AddRecurringTransaction = () => {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [notes, setNotes] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerId || !amount || !frequency) {
      setError('Customer, amount, and frequency are required');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    setLoading(true);

    try {
      await recurringAPI.createRecurringTransaction({
        customer_id: customerId,
        amount: amountNum,
        frequency,
        notes,
      });
      navigate('/recurring-transactions');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create recurring transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="form-page">
        <div className="form-container">
          <h1>Add Recurring Transaction</h1>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="customer">Select Customer *</label>
              <select
                id="customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                disabled={loading}
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
              <label htmlFor="frequency">Frequency *</label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                disabled={loading}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
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

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/recurring-transactions')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Recurring Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddRecurringTransaction;
