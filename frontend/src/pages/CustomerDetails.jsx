/**
 * CustomerDetails Page - Modern Flat Design
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customerAPI, transactionAPI, reminderAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';
import '../styles/CustomerDetailsModern.css';

const CustomerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadCustomerDetails();
  }, [customerId]);

  const loadCustomerDetails = async () => {
    try {
      const [customerRes, transactionsRes] = await Promise.all([
        customerAPI.getCustomer(customerId),
        transactionAPI.getCustomerTransactions(customerId)
      ]);
      
      setCustomer(customerRes.data.customer);
      setTransactions(transactionsRes.data.transactions || []);
    } catch (error) {
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to load customer details'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async () => {
    // Open a new window immediately to avoid popup blocker
    const whatsappWindow = window.open('about:blank', '_blank');
    
    try {
      const response = await reminderAPI.sendReminder(customerId);
      const whatsappUrl = response.data.whatsapp_url;
      
      // Update the opened window with WhatsApp URL
      if (whatsappWindow) {
        whatsappWindow.location.href = whatsappUrl;
      }
      
      setMessages([{ 
        type: 'success', 
        message: `Opening WhatsApp to send reminder to ${response.data.customer_name}` 
      }]);
    } catch (error) {
      // Close the blank window if there was an error
      if (whatsappWindow) {
        whatsappWindow.close();
      }
      
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to generate reminder'
      }]);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="loading-container">
        <p>Customer not found</p>
      </div>
    );
  }

  return (
    <div className="customer-details-modern">
      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      <div className="customer-details-container">
        {/* Customer Header Card */}
        <div className="customer-header-card">
          <div className="customer-avatar-large">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="customer-name-large">{customer.name}</div>
          <div className="customer-phone-large">
            <i className="fas fa-phone"></i> {customer.phone}
          </div>

          {/* Balance Display */}
          <div className="balance-display">
            <div className="balance-label">
              {customer.balance > 0 ? 'Amount to Receive' : 'Amount Received'}
            </div>
            <div className={`balance-amount-large ${customer.balance > 0 ? 'positive' : 'negative'}`}>
              ₹{Math.abs(customer.balance || 0).toFixed(2)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons-grid">
            <Link to={`/customer/${customerId}/transaction`} className="action-btn action-btn-credit">
              <i className="fas fa-plus-circle"></i>
              Add Credit
            </Link>
            
            <button className="action-btn action-btn-payment" onClick={handleSendReminder}>
              <i className="fab fa-whatsapp"></i>
              Send Reminder
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="transactions-section">
          <div className="section-header">
            <h3 className="section-title">Transaction History</h3>
            <span style={{fontSize: '14px', color: 'var(--text-secondary)'}}>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {transactions.length === 0 ? (
            <div className="empty-transactions">
              <div style={{fontSize: '48px', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)'}}>
                <i className="fas fa-receipt"></i>
              </div>
              <p>No transactions yet</p>
              <Link to={`/customer/${customerId}/transaction`} style={{color: 'var(--primary-purple)', textDecoration: 'none', fontWeight: '600', marginTop: 'var(--space-2)', display: 'inline-block'}}>
                Add First Transaction
              </Link>
            </div>
          ) : (
            <div>
              {transactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className={`transaction-icon ${transaction.transaction_type}`}>
                    <i className={`fas fa-${transaction.transaction_type === 'credit' ? 'arrow-up' : 'arrow-down'}`}></i>
                  </div>
                  <div className="transaction-info">
                    <div className="transaction-type">
                      {transaction.transaction_type === 'credit' ? 'Money Given (Credit)' : 'Money Received (Payment)'}
                    </div>
                    <div className="transaction-date">
                      {new Date(transaction.created_at).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {transaction.notes && (
                      <div style={{fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px'}}>
                        {transaction.notes}
                      </div>
                    )}
                  </div>
                  <div className={`transaction-amount ${transaction.transaction_type}`}>
                    {transaction.transaction_type === 'credit' ? '+' : '-'}₹{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
