/**
 * Transactions Page - Modern Flat Design
 */
import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';
import '../styles/TransactionsModern.css';

const Transactions = () => {
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
      <div className="transactions-modern">
        <div className="transactions-container-modern">
          {/* Skeleton Loading */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="transaction-card-skeleton">
              <div className="skeleton-circle" style={{width: '56px', height: '56px'}}></div>
              <div style={{ flex: 1 }}>
                <div className="skeleton-text" style={{ width: '65%', marginBottom: '10px', borderRadius: '8px', height: '16px' }}></div>
                <div className="skeleton-text" style={{ width: '45%', height: '12px', borderRadius: '6px' }}></div>
              </div>
              <div>
                <div className="skeleton-text" style={{ width: '90px', marginBottom: '6px', borderRadius: '8px', height: '18px' }}></div>
                <div className="skeleton-text" style={{ width: '70px', height: '12px', borderRadius: '6px' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-modern">
      <div className="transactions-container-modern">
        <FlashMessage messages={messages} onClose={() => setMessages([])} />

        {/* Title Section */}
        <div style={{padding: '20px 0 16px', borderBottom: '1px solid #e5e7eb'}}>
          <h2 style={{fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0}}>Transactions</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state-modern">
            <i className="fas fa-receipt"></i>
            <h3>No Transactions Yet</h3>
            <p>Transaction history will appear here</p>
          </div>
        ) : (
          <div style={{padding: '16px 0'}}>
            {transactions.map((transaction, index) => {
              // Show date separator if different from previous transaction
              const showDate = index === 0 || 
                new Date(transactions[index-1].created_at).toDateString() !== new Date(transaction.created_at).toDateString();
              
              return (
                <div key={transaction.id}>
                  {showDate && (
                    <div style={{
                      textAlign: 'center',
                      fontSize: '13px',
                      color: '#9ca3af',
                      padding: '12px 0',
                      fontWeight: '500'
                    }}>
                      {new Date(transaction.created_at).toLocaleDateString('en-IN', { 
                        weekday: 'short',
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </div>
                  )}
                  
                  {/* GPay-style Transaction Card */}
                  <div className="transaction-card" style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #f3f4f6'
                  }}>
                    <div style={{display: 'flex', alignItems: 'flex-start', gap: '12px'}}>
                      {/* Avatar with varied colors */}
                      <div className={`avatar-color-${index % 10}`} style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: '700',
                        flexShrink: 0
                      }}>
                        {transaction.customer_name ? transaction.customer_name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      
                      <div style={{flex: 1, minWidth: 0}}>
                        {/* Transaction Title */}
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#111827',
                          marginBottom: '4px'
                        }}>
                          {transaction.transaction_type === 'credit' 
                            ? `Payment from ${transaction.customer_name || 'Customer'}` 
                            : `Payment to ${transaction.customer_name || 'Customer'}`}
                        </div>
                        
                        {/* Amount */}
                        <div style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: transaction.transaction_type === 'credit' ? '#ef4444' : '#10b981',
                          marginBottom: '8px'
                        }}>
                          ₹{transaction.amount}
                        </div>
                        
                        {/* Status Badge */}
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'}}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: transaction.transaction_type === 'credit' ? '#ef4444' : '#10b981',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            <i className={`fas fa-${transaction.transaction_type === 'credit' ? 'arrow-up' : 'check-circle'}`}></i>
                            {transaction.transaction_type === 'credit' ? 'Credit taken' : 'Paid'}
                          </span>
                          <span style={{color: '#9ca3af', fontSize: '14px'}}>•</span>
                          <span style={{color: '#6b7280', fontSize: '14px'}}>
                            {new Date(transaction.created_at).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short'
                            })}
                          </span>
                        </div>
                        
                        {/* Notes if any */}
                        {transaction.notes && (
                          <div style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            marginTop: '8px',
                            padding: '8px 12px',
                            background: '#f9fafb',
                            borderRadius: '8px'
                          }}>
                            {transaction.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
