/**
 * CustomerDetails Page - Modern Flat Design
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customerAPI, transactionAPI, reminderAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';
import '../styles/CustomerDetailsWhatsApp.css';

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
        {/* Customer Header */}
        <div className="customer-header-minimal">
          <button onClick={() => navigate('/customers')} className="back-btn-minimal">
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="customer-name-header">{customer.name}</div>
          <div className="customer-balance-header">
            ₹{Math.abs(customer.balance || 0).toFixed(0)}
          </div>
        </div>

        {/* Transaction History - WhatsApp Style */}
        <div className="transactions-whatsapp">
          {transactions.length === 0 ? (
            <div className="empty-transactions">
              <p>No transactions yet</p>
            </div>
          ) : (
            <>
              {transactions.map((transaction, index) => {
                const showDate = index === 0 || 
                  new Date(transactions[index-1].created_at).toDateString() !== new Date(transaction.created_at).toDateString();
                
                return (
                  <div key={transaction.id}>
                    {showDate && (
                      <div className="date-separator">
                        {new Date(transaction.created_at).toLocaleDateString('en-IN', { 
                          weekday: 'short',
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric'
                        })}
                      </div>
                    )}
                    <div className={`transaction-bubble ${transaction.transaction_type === 'credit' ? 'payment-bubble' : 'credit-bubble'}`}>
                      <div className="bubble-header">
                        <span className="bubble-name">
                          {transaction.transaction_type === 'credit' ? customer.name : 'You'}
                        </span>
                        <span className="bubble-type">
                          {transaction.transaction_type === 'credit' ? 'credit taken' : 'payment made'}
                        </span>
                      </div>
                      <div className="bubble-amount">
                        <div className={`amount-icon ${transaction.transaction_type}`}>
                          <i className={`fas fa-arrow-${transaction.transaction_type === 'credit' ? 'up' : 'down'}`}></i>
                        </div>
                        <span>₹{transaction.amount}</span>
                      </div>
                      <div className="bubble-time">
                        {new Date(transaction.created_at).toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Bottom Section - Balance and Actions */}
        <div className="bottom-actions">
          <div className="current-balance-section">
            <div className="balance-label-bottom">Current Balance</div>
            <div className={`balance-amount-bottom ${customer.balance > 0 ? 'positive' : 'negative'}`}>
              ₹{customer.balance > 0 ? '+' : '-'}{Math.abs(customer.balance || 0).toFixed(0)}
            </div>
            <div className="balance-status">{customer.balance > 0 ? 'You owe' : 'Received'}</div>
          </div>

          <div className="action-buttons-row">
            <a href={`tel:${customer.phone}`} className="icon-btn-round call-btn">
              <i className="fas fa-phone"></i>
            </a>
            <a 
              href={`https://wa.me/91${customer.phone}?text=Hi ${customer.name}, your balance is ₹${Math.abs(customer.balance || 0).toFixed(2)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn-round whatsapp-btn"
            >
              <i className="fab fa-whatsapp"></i>
            </a>
          </div>

          <div className="transaction-buttons">
            <Link to={`/customer/${customerId}/transaction?type=credit`} className="transaction-btn credit-btn">
              <i className="fas fa-arrow-up"></i>
              Take Credit
            </Link>
            <Link to={`/customer/${customerId}/transaction?type=payment`} className="transaction-btn payment-btn">
              <i className="fas fa-arrow-down"></i>
              Pay Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
