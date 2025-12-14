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
      <div className="customer-dashboard">
        <div className="page-header">
          <div className="skeleton" style={{width: '100px', height: '40px', borderRadius: '8px'}}></div>
          <div className="skeleton" style={{flex: 1, height: '32px', marginLeft: '16px'}}></div>
        </div>
        
        <div className="dashboard-section">
          <div className="businesses-list">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="business-card-inner" style={{marginBottom: '10px'}}>
                <div className="skeleton skeleton-circle" style={{width: '48px', height: '48px'}}></div>
                <div className="business-info" style={{flex: 1}}>
                  <div className="skeleton" style={{height: '18px', width: '60%', marginBottom: '8px'}}></div>
                  <div className="skeleton" style={{height: '14px', width: '40%'}}></div>
                </div>
                <div className="skeleton" style={{width: '60px', height: '32px', borderRadius: '16px'}}></div>
              </div>
            ))}
          </div>
        </div>
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
