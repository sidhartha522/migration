import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { transactionAPI, customerAPI } from '../services/api';
import '../styles/Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getTransactions();
      setTransactions(response.data.transactions || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading transactions...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="transactions-page">
        <div className="page-header">
          <h1>All Transactions</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {transactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="transactions-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.$id}>
                    <td>{new Date(txn.created_at).toLocaleDateString()}</td>
                    <td>{txn.customer_name}</td>
                    <td>
                      <span className={`badge ${txn.type}`}>{txn.type}</span>
                    </td>
                    <td className={txn.type}>
                      ₹{parseFloat(txn.amount).toFixed(2)}
                    </td>
                    <td>{txn.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Transactions;
