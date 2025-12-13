/**
 * BulkReminders Page - Send bulk reminders to customers
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reminderAPI } from '../services/api';
import '../styles/BulkReminders.css';

const BulkReminders = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reminderAPI.getBulkReminders();
      setCustomers(response.data.customers);
      setBusinessName(response.data.business_name);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = (whatsappUrl) => {
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
  };

  const handleSendAll = () => {
    if (customers.length === 0) return;
    
    // Open all WhatsApp URLs (browsers may block multiple popups, so we'll open them with delay)
    customers.forEach((customer, index) => {
      setTimeout(() => {
        window.open(customer.whatsapp_url, '_blank');
      }, index * 500); // 500ms delay between each
    });
  };

  return (
    <div className="bulk-reminders-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h1>Send Reminders</h1>
      </div>

      {loading && (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i> Loading customers...
        </div>
      )}

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="reminders-header">
            <div className="header-info">
              <h2>{businessName}</h2>
              <p>{customers.length} customer{customers.length !== 1 ? 's' : ''} with outstanding balance</p>
            </div>
            {customers.length > 0 && (
              <button className="btn-send-all" onClick={handleSendAll}>
                <i className="fab fa-whatsapp"></i> Send All Reminders
              </button>
            )}
          </div>

          {customers.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-check-circle"></i>
              <p>All customers are up to date!</p>
              <small>No outstanding balances to remind about.</small>
            </div>
          ) : (
            <div className="customers-list">
              {customers.map((customer) => (
                <div key={customer.id} className="customer-card">
                  <div className="customer-avatar">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="customer-info">
                    <h3>{customer.name}</h3>
                    <p className="customer-phone">{customer.phone_number}</p>
                    <p className="customer-balance">
                      Outstanding: <strong>₹{customer.balance.toFixed(2)}</strong>
                    </p>
                  </div>
                  <button 
                    className="btn-whatsapp"
                    onClick={() => handleSendReminder(customer.whatsapp_url)}
                  >
                    <i className="fab fa-whatsapp"></i> Send Reminder
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BulkReminders;
