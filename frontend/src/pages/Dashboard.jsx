import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { dashboardAPI } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading dashboard...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-message">{error}</div>
      </Layout>
    );
  }

  const { business, summary, recent_transactions, pending_customers } = dashboardData || {};

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="business-pin">
            <span>Business PIN: </span>
            <strong>{business?.pin}</strong>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="card">
            <h3>Total Customers</h3>
            <p className="card-value">{summary?.total_customers || 0}</p>
          </div>
          <div className="card">
            <h3>Total Credit Given</h3>
            <p className="card-value">₹{summary?.total_credit?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="card">
            <h3>Total Payments Received</h3>
            <p className="card-value">₹{summary?.total_payment?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="card highlight">
            <h3>Outstanding Balance</h3>
            <p className="card-value">₹{summary?.outstanding_balance?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/add-customer" className="btn btn-primary">
              Add Customer
            </Link>
            <Link to="/add-transaction" className="btn btn-secondary">
              Add Transaction
            </Link>
            <Link to="/customers" className="btn btn-secondary">
              View All Customers
            </Link>
            <Link to="/bulk-reminders" className="btn btn-secondary">
              Send Reminders
            </Link>
          </div>
        </div>

        {/* Pending Customers */}
        {pending_customers && pending_customers.length > 0 && (
          <div className="section">
            <h2>Customers with Pending Payments</h2>
            <div className="customer-list">
              {pending_customers.map((customer) => (
                <Link
                  key={customer.id}
                  to={`/customer/${customer.id}`}
                  className="customer-card"
                >
                  <div className="customer-info">
                    <h3>{customer.name}</h3>
                    <p>{customer.phone}</p>
                  </div>
                  <div className="customer-balance">
                    <span className="balance-label">Balance:</span>
                    <span className="balance-value">₹{customer.balance?.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {recent_transactions && recent_transactions.length > 0 && (
          <div className="section">
            <h2>Recent Transactions</h2>
            <div className="transactions-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_transactions.map((transaction) => (
                    <tr key={transaction.$id}>
                      <td>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge ${transaction.type}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className={transaction.type === 'credit' ? 'credit' : 'payment'}>
                        ₹{parseFloat(transaction.amount).toFixed(2)}
                      </td>
                      <td>{transaction.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
