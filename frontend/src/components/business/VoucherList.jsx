/**
 * VoucherList - Component to manage business vouchers
 */
import { useState, useEffect } from 'react';
import { businessAPI } from '../../services/api';
import './VoucherList.css';

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    minPurchase: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    quantity: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await businessAPI.getVouchers();
      setVouchers(response.data.vouchers || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await businessAPI.createVoucher(formData);
      await fetchVouchers(); // Refresh list
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        amount: '',
        minPurchase: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        quantity: '',
        status: 'draft'
      });
    } catch (error) {
      console.error('Error creating voucher:', error);
      alert(error.response?.data?.error || 'Failed to create voucher');
    } finally {
      setLoading(false);
    }
  };

  const toggleVoucher = async (id) => {
    try {
      await businessAPI.toggleVoucher(id);
      await fetchVouchers(); // Refresh list
    } catch (error) {
      console.error('Error toggling voucher:', error);
      alert('Failed to toggle voucher');
    }
  };

  const deleteVoucher = async (id) => {
    if (!window.confirm('Are you sure you want to delete this voucher?')) {
      return;
    }
    
    try {
      await businessAPI.deleteVoucher(id);
      await fetchVouchers(); // Refresh list
    } catch (error) {
      console.error('Error deleting voucher:', error);
      alert('Failed to delete voucher');
    }
  };

  return (
    <div className="voucher-list">
      <div className="voucher-header">
        <h3>Vouchers & Coupons</h3>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          <i className="fas fa-plus"></i>
          {showForm ? 'Cancel' : 'Create Voucher'}
        </button>
      </div>

      {showForm && (
        <form className="voucher-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Voucher Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., ₹50 Store Voucher"
              />
            </div>

            <div className="form-group">
              <label>Voucher Amount (₹) *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="1"
                placeholder="100"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Min Purchase (₹)</label>
              <input
                type="number"
                name="minPurchase"
                value={formData.minPurchase}
                onChange={handleChange}
                min="0"
                placeholder="300"
              />
            </div>

            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="1"
                placeholder="100"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Valid From *</label>
              <input
                type="date"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Valid Until *</label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe this voucher offer"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            <i className="fas fa-plus-circle"></i>
            {loading ? 'Creating...' : 'Create Voucher'}
          </button>
        </form>
      )}

      <div className="vouchers-grid">
        {loading ? (
          <div className="empty-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading vouchers...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-ticket-alt"></i>
            <p>No vouchers yet</p>
            <small>Create your first voucher to attract customers</small>
          </div>
        ) : (
          vouchers.map(voucher => (
            <div key={voucher.$id} className={`voucher-card ${voucher.status !== 'active' ? 'inactive' : ''}`}>
              <div className="voucher-code">
                <span className="code">{voucher.title || `₹${voucher.amount} Voucher`}</span>
                <span className="badge">₹{voucher.amount}</span>
              </div>
              
              <p className="voucher-description">{voucher.description || 'No description'}</p>
              
              <div className="voucher-details">
                {voucher.minPurchase > 0 && (
                  <div className="detail">
                    <i className="fas fa-rupee-sign"></i>
                    <span>Min: ₹{voucher.minPurchase}</span>
                  </div>
                )}
                <div className="detail">
                  <i className="fas fa-list-ol"></i>
                  <span>Qty: {voucher.quantity}</span>
                </div>
                <div className="detail">
                  <i className="fas fa-calendar"></i>
                  <span>Until: {new Date(voucher.validUntil).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="voucher-actions">
                <button 
                  className={`btn-toggle ${voucher.status === 'active' ? 'active' : ''}`}
                  onClick={() => toggleVoucher(voucher.$id)}
                  disabled={loading}
                >
                  <i className={`fas fa-${voucher.status === 'active' ? 'check-circle' : 'times-circle'}`}></i>
                  {voucher.status === 'active' ? 'Active' : 'Draft'}
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => deleteVoucher(voucher.$id)}
                  disabled={loading}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VoucherList;
