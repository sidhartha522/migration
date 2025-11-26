import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { customerAPI } from '../services/api';
import '../styles/CustomerDetails.css';

const CustomerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchCustomerDetails();
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getCustomerDetails(customerId);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async () => {
    try {
      setSending(true);
      await customerAPI.remindCustomer(customerId);
      alert('Reminder sent successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send reminder');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading customer details...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-message">{error}</div>
      </Layout>
    );
  }

  const { customer, transactions, summary } = data || {};

  return (
    <Layout>
      <div className="customer-details">
        <div className="page-header">
          <button onClick={() => navigate('/customers')} className="btn-back">
            ← Back
          </button>
          <h1>{customer?.name}</h1>
        </div>

        <div className="customer-info-card">
          <div className="info-row">
            <span>Phone:</span>
            <strong>{customer?.phone}</strong>
          </div>
          <div className="info-row">
            <span>Total Credit:</span>
            <strong className="credit">₹{summary?.total_credit?.toFixed(2)}</strong>
          </div>
          <div className="info-row">
            <span>Total Payment:</span>
            <strong className="payment">₹{summary?.total_payment?.toFixed(2)}</strong>
          </div>
          <div className="info-row highlight">
            <span>Outstanding Balance:</span>
            <strong>₹{summary?.balance?.toFixed(2)}</strong>
          </div>
        </div>

        <div className="action-buttons">
          <Link
            to={`/add-transaction/${customerId}`}
            className="btn btn-primary"
          >
            Add Transaction
          </Link>
          <button
            onClick={handleSendReminder}
            className="btn btn-secondary"
            disabled={sending || summary?.balance <= 0}
          >
            {sending ? 'Sending...' : 'Send Reminder'}
          </button>
        </div>

        <div className="transactions-section">
          <h2>Transaction History</h2>
          {transactions && transactions.length > 0 ? (
            <div className="transactions-list">
              {transactions.map((txn) => (
                <div key={txn.$id} className="transaction-item">
                  <div className="txn-info">
                    <span className={`txn-type ${txn.type}`}>
                      {txn.type === 'credit' ? '↓ Credit' : '↑ Payment'}
                    </span>
                    <span className="txn-date">
                      {new Date(txn.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="txn-amount">
                    <span className={txn.type}>₹{parseFloat(txn.amount).toFixed(2)}</span>
                  </div>
                  {txn.notes && <div className="txn-notes">{txn.notes}</div>}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No transactions yet</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CustomerDetails;
