import { useState } from 'react';
import Layout from '../components/Layout';
import { customerAPI } from '../services/api';
import '../styles/BulkReminders.css';

const BulkReminders = () => {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendBulkReminders = async () => {
    if (!confirm('Are you sure you want to send reminders to all customers with pending balances?')) {
      return;
    }

    try {
      setSending(true);
      setError('');
      setMessage('');
      
      const response = await customerAPI.remindAllCustomers();
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reminders');
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="bulk-reminders-page">
        <div className="page-header">
          <h1>Bulk Reminders</h1>
        </div>

        <div className="reminder-info-card">
          <h2>Send Payment Reminders</h2>
          <p>
            This feature will send payment reminders to all customers who have pending balances.
            The system will automatically identify customers with outstanding payments.
          </p>
          
          <div className="reminder-features">
            <h3>What happens:</h3>
            <ul>
              <li>Reminders are sent only to customers with positive balances</li>
              <li>Each customer receives a personalized message</li>
              <li>Reminders are sent via SMS/WhatsApp (when configured)</li>
            </ul>
          </div>

          {message && (
            <div className="success-message">
              ✓ {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            onClick={handleSendBulkReminders}
            className="btn btn-primary btn-large"
            disabled={sending}
          >
            {sending ? 'Sending Reminders...' : 'Send Bulk Reminders'}
          </button>

          <p className="note">
            <strong>Note:</strong> Make sure you have configured SMS/WhatsApp integration
            in your settings for reminders to be delivered.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default BulkReminders;
