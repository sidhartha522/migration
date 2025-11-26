/**
 * Transactions Page - View all transactions
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await transactionAPI.getTransactions();
      setTransactions(response.data.transactions || []);
    } catch (error) {
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to load transactions'
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h1>All Transactions</h1>
      </div>

      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      <div className="dashboard-section">
        {transactions.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-receipt"></i>
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="businesses-list">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="business-card-inner" style={{marginBottom: '10px'}}>
                <div className="business-icon" style={{
                  backgroundColor: transaction.transaction_type === 'credit' ? 'var(--danger-color)' : 'var(--secondary-color)'
                }}>
                  <i className={`fas fa-${transaction.transaction_type === 'credit' ? 'arrow-up' : 'arrow-down'}`}></i>
                </div>
                <div className="business-info">
                  <div className="business-name">
                    {transaction.customer_name || 'Customer'}
                  </div>
                  <div>{transaction.transaction_type === 'credit' ? 'Credit' : 'Payment'}</div>
                  <div style={{fontSize: '0.9rem', color: 'var(--dark-color)'}}>
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </div>
                  {transaction.notes && (
                    <div style={{fontSize: '0.9rem', color: 'var(--dark-color)'}}>{transaction.notes}</div>
                  )}
                </div>
                <div className="business-balance" style={{
                  color: transaction.transaction_type === 'credit' ? 'var(--danger-color)' : 'var(--secondary-color)'
                }}>
                  ₹{transaction.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
