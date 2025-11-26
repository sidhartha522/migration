/**
 * BulkReminders Page - Send bulk reminders to customers
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reminderAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';

const BulkReminders = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleSendBulkReminders = async () => {
    if (!window.confirm('Send reminders to all customers with outstanding balances?')) {
      return;
    }

    setLoading(true);
    setMessages([]);

    try {
      await reminderAPI.sendBulkReminders();
      setMessages([{ type: 'success', message: 'Bulk reminders sent successfully!' }]);
    } catch (error) {
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to send bulk reminders'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-dashboard">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h1>Bulk Reminders</h1>
      </div>

      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      <div className="dashboard-section">
        <div className="card">
          <h3>Send Reminders to All Customers</h3>
          <p>This will send WhatsApp reminders to all customers with outstanding balances.</p>
          
          <button 
            className="btn primary-btn" 
            onClick={handleSendBulkReminders}
            disabled={loading}
            style={{marginTop: '20px'}}
          >
            <i className="fab fa-whatsapp"></i> {loading ? 'Sending...' : 'Send Bulk Reminders'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkReminders;
