/**
 * RecurringTransactions Page - Manage recurring transactions
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recurringAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';

const RecurringTransactions = () => {
  const navigate = useNavigate();
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadRecurringTransactions();
  }, []);

  const loadRecurringTransactions = async () => {
    try {
      const response = await recurringAPI.getRecurringTransactions();
      setRecurringTransactions(response.data.recurring_transactions || []);
    } catch (error) {
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to load recurring transactions'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await recurringAPI.toggleRecurringTransaction(id);
      setMessages([{ type: 'success', message: 'Recurring transaction updated!' }]);
      loadRecurringTransactions();
    } catch (error) {
      setMessages([{
        type: 'error',
        message: 'Failed to update recurring transaction'
      }]);
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
        <h1>Recurring Transactions</h1>
      </div>

      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      <div className="dashboard-section">
        {recurringTransactions.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-sync-alt"></i>
            <p>No recurring transactions found</p>
          </div>
        ) : (
          <div className="businesses-list">
            {recurringTransactions.map((recurring) => (
              <div key={recurring.id} className="business-card-inner" style={{marginBottom: '10px'}}>
                <div className="business-icon" style={{
                  backgroundColor: recurring.transaction_type === 'credit' ? 'var(--danger-color)' : 'var(--secondary-color)'
                }}>
                  <i className="fas fa-sync-alt"></i>
                </div>
                <div className="business-info">
                  <div className="business-name">
                    {recurring.customer_name || 'Customer'}
                  </div>
                  <div>{recurring.transaction_type === 'credit' ? 'Credit' : 'Payment'} - {recurring.frequency}</div>
                  <div style={{fontSize: '0.9rem', color: 'var(--dark-color)'}}>
                    Next: {new Date(recurring.next_date).toLocaleDateString()}
                  </div>
                  <div style={{fontSize: '0.9rem', color: recurring.is_active ? 'var(--secondary-color)' : 'var(--dark-color)'}}>
                    {recurring.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px'}}>
                  <div className="business-balance" style={{
                    color: recurring.transaction_type === 'credit' ? 'var(--danger-color)' : 'var(--secondary-color)'
                  }}>
                    ₹{recurring.amount}
                  </div>
                  <button 
                    className="btn primary-btn" 
                    onClick={() => handleToggle(recurring.id)}
                    style={{padding: '6px 12px', fontSize: '0.85rem'}}
                  >
                    {recurring.is_active ? 'Pause' : 'Resume'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecurringTransactions;
