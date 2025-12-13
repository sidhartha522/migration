/**
 * BulkReminders Page - Modern Flat Design
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reminderAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';
import '../styles/BulkRemindersModern.css';

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
    <div className="bulk-reminders-modern">
      <FlashMessage 
        messages={error ? [{type: 'error', message: error}] : []} 
        onClose={() => setError(null)} 
      />
      
      <div className="reminders-container-modern">
        {/* Header */}
        <div className="reminders-header-card">
          <button className="btn-back-modern" onClick={() => navigate('/dashboard')}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="header-content">
            <h1 className="page-title">Send Reminders</h1>
            <p className="page-subtitle">{businessName || 'Your Business'}</p>
          </div>
        </div>

        {loading && (
          <div className="reminders-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="customer-card-skeleton">
                <div className="skeleton-circle"></div>
                <div style={{ flex: 1 }}>
                  <div className="skeleton-text" style={{ width: '60%', marginBottom: '8px' }}></div>
                  <div className="skeleton-text" style={{ width: '40%', height: '10px' }}></div>
                </div>
                <div className="skeleton-text" style={{ width: '120px', height: '36px' }}></div>
              </div>
            ))}
          </div>
        )}

      {!loading && (
        <>
          {/* Stats Card */}
          <div className="reminders-stats-card">
            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div>
                <div className="stat-value">{customers.length}</div>
                <div className="stat-label">Customers with Balance</div>
              </div>
            </div>
          </div>

          {/* Send All Button */}
          {customers.length > 0 && (
            <button className="btn-send-all-modern" onClick={handleSendAll}>
              <i className="fab fa-whatsapp"></i>
              <span>Send All Reminders</span>
            </button>
          )}

          {customers.length === 0 ? (
            <div className="empty-state-modern">
              <i className="fas fa-check-circle"></i>
              <h3>All Caught Up!</h3>
              <p>No outstanding balances to remind about.</p>
            </div>
          ) : (
            <div className="customers-grid-modern">
              {customers.map((customer) => (
                <div key={customer.id} className="customer-card-modern">
                  <div className="customer-header">
                    <div className="customer-avatar-modern">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="customer-details">
                      <h3 className="customer-name-modern">{customer.name}</h3>
                      <p className="customer-phone-modern">{customer.phone_number}</p>
                    </div>
                  </div>
                  <div className="customer-balance-info">
                    <div className="balance-label">Outstanding</div>
                    <div className="balance-amount">₹{customer.balance.toFixed(2)}</div>
                  </div>
                  <button 
                    className="btn-whatsapp-modern"
                    onClick={() => handleSendReminder(customer.whatsapp_url)}
                  >
                    <i className="fab fa-whatsapp"></i>
                    <span>Send Reminder</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default BulkReminders;
