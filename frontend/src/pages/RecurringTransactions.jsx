import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { recurringAPI } from '../services/api';
import '../styles/RecurringTransactions.css';

const RecurringTransactions = () => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecurringTransactions();
  }, []);

  const fetchRecurringTransactions = async () => {
    try {
      setLoading(true);
      const response = await recurringAPI.getRecurringTransactions();
      setRecurringTransactions(response.data.recurring_transactions || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load recurring transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (recurringId) => {
    try {
      await recurringAPI.toggleRecurringTransaction(recurringId);
      fetchRecurringTransactions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to toggle status');
    }
  };

  const handleDelete = async (recurringId) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) {
      return;
    }

    try {
      await recurringAPI.deleteRecurringTransaction(recurringId);
      fetchRecurringTransactions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading recurring transactions...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="recurring-page">
        <div className="page-header">
          <h1>Recurring Transactions</h1>
          <Link to="/add-recurring" className="btn btn-primary">
            Add Recurring Transaction
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {recurringTransactions.length === 0 ? (
          <div className="empty-state">
            <p>No recurring transactions found</p>
            <Link to="/add-recurring" className="btn btn-secondary">
              Create Your First Recurring Transaction
            </Link>
          </div>
        ) : (
          <div className="recurring-list">
            {recurringTransactions.map((rt) => (
              <div key={rt.$id} className={`recurring-card ${rt.is_active ? 'active' : 'inactive'}`}>
                <div className="recurring-info">
                  <h3>{rt.customer_name}</h3>
                  <p className="amount">₹{parseFloat(rt.amount).toFixed(2)}</p>
                  <p className="frequency">Frequency: {rt.frequency}</p>
                  {rt.notes && <p className="notes">{rt.notes}</p>}
                </div>
                <div className="recurring-actions">
                  <button
                    onClick={() => handleToggle(rt.$id)}
                    className={`btn ${rt.is_active ? 'btn-warning' : 'btn-success'}`}
                  >
                    {rt.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(rt.$id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RecurringTransactions;
