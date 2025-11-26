/**
 * CustomerDetails Page - View customer details and transactions
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customerAPI, transactionAPI, reminderAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';

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
    try {
      await reminderAPI.sendReminder(customerId);
      setMessages([{ type: 'success', message: 'Reminder sent successfully!' }]);
    } catch (error) {
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to send reminder'
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

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="customer-dashboard">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/customers')}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h1>{customer.name}</h1>
      </div>

      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      <div className="profile-section">
        <div className="profile-image">
          <i className="fas fa-user"></i>
        </div>
        <div className="profile-info">
          <h2>{customer.name}</h2>
          <p className="phone-number">
            <i className="fas fa-phone"></i> {customer.phone}
          </p>
          <div className="business-balance" 
               style={{fontSize: '1.5rem', marginTop: '10px', color: customer.balance > 0 ? 'var(--danger-color)' : 'var(--secondary-color)'}}>
            ₹{Math.abs(customer.balance || 0).toFixed(2)} {customer.balance > 0 ? 'to receive' : 'received'}
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="quick-links">
          <Link to={`/customer/${customerId}/transaction`} className="quick-link-card">
            <div className="quick-link-icon">
              <i className="fas fa-plus-circle"></i>
            </div>
            <div className="quick-link-text">Add Transaction</div>
          </Link>
          
          <button className="quick-link-card" onClick={handleSendReminder} style={{border: 'none', background: 'rgba(255, 255, 255, 0.5)'}}>
            <div className="quick-link-icon">
              <i className="fab fa-whatsapp"></i>
            </div>
            <div className="quick-link-text">Send Reminder</div>
          </button>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Transaction History</h3>
        </div>
        
        {transactions.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-receipt"></i>
            <p>No transactions yet</p>
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
                    {transaction.transaction_type === 'credit' ? 'Credit' : 'Payment'}
                  </div>
                  <div>{new Date(transaction.created_at).toLocaleDateString()}</div>
                  {transaction.notes && <div style={{fontSize: '0.9rem', color: 'var(--dark-color)'}}>{transaction.notes}</div>}
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

export default CustomerDetails;
