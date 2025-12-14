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
              <div className="skeleton-circle"></div>
              <div style={{ flex: 1 }}>
                <div className="skeleton-text" style={{ width: '60%', marginBottom: '8px' }}></div>
                <div className="skeleton-text" style={{ width: '40%', height: '10px' }}></div>
              </div>
              <div>
                <div className="skeleton-text" style={{ width: '80px', marginBottom: '4px' }}></div>
                <div className="skeleton-text" style={{ width: '60px', height: '10px' }}></div>
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

        {transactions.length === 0 ? (
          <div className="empty-state-modern">
            <i className="fas fa-receipt"></i>
            <h3>No Transactions Yet</h3>
            <p>Transaction history will appear here</p>
          </div>
        ) : (
          <div>
            {transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item-modern">
                <div className={`transaction-icon-bubble ${transaction.transaction_type === 'credit' ? 'icon-red' : 'icon-green'}`}>
                  <i className={`fas fa-${transaction.transaction_type === 'credit' ? 'arrow-up' : 'arrow-down'}`}></i>
                </div>
                <div className="transaction-details-modern">
                  <div className="transaction-customer-modern">
                    {transaction.customer_name || 'Customer'}
                  </div>
                  <div className="transaction-type-modern">
                    {transaction.transaction_type === 'credit' ? 'Credit taken' : 'Payment made'}
                  </div>
                  <div className="transaction-date-modern">
                    {new Date(transaction.created_at).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                  {transaction.notes && (
                    <div className="transaction-notes-modern">{transaction.notes}</div>
                  )}
                </div>
                <div className={`transaction-amount-modern ${transaction.transaction_type === 'credit' ? 'amount-credit' : 'amount-payment'}`}>
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
