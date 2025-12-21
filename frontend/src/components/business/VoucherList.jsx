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
    code: '',
    discount: '',
    minAmount: '',
    maxDiscount: '',
    validUntil: '',
    description: ''
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
        code: '',
        discount: '',
        minAmount: '',
        maxDiscount: '',
        validUntil: '',
        description: ''
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
              <label>Voucher Code *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="e.g., SAVE20"
              />
            </div>

            <div className="form-group">
              <label>Discount (%) *</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                required
                min="0"
                max="100"
                placeholder="10"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Min Amount (₹)</label>
              <input
                type="number"
                name="minAmount"
                value={formData.minAmount}
                onChange={handleChange}
                min="0"
                placeholder="500"
              />
            </div>

            <div className="form-group">
              <label>Max Discount (₹)</label>
              <input
                type="number"
                name="maxDiscount"
                value={formData.maxDiscount}
                onChange={handleChange}
                min="0"
                placeholder="100"
              />
            </div>
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

          <button type="submit" className="btn-submit">
            <i className="fas fa-plus-circle"></i>
            Create Voucher
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
            <div key={voucher.$id} className={`voucher-card ${!voucher.is_active ? 'inactive' : ''}`}>
              <div className="voucher-code">
                <span className="code">{voucher.code}</span>
                <span className="badge">{voucher.discount}% OFF</span>
              </div>
              
              <p className="voucher-description">{voucher.description || 'No description'}</p>
              
              <div className="voucher-details">
                {voucher.min_amount > 0 && (
                  <div className="detail">
                    <i className="fas fa-rupee-sign"></i>
                    <span>Min: ₹{voucher.min_amount}</span>
                  </div>
                )}
                {voucher.max_discount > 0 && (
                  <div className="detail">
                    <i className="fas fa-tag"></i>
                    <span>Max: ₹{voucher.max_discount}</span>
                  </div>
                )}
                <div className="detail">
                  <i className="fas fa-calendar"></i>
                  <span>Until: {new Date(voucher.valid_until).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="voucher-actions">
                <button 
                  className={`btn-toggle ${voucher.is_active ? 'active' : ''}`}
                  onClick={() => toggleVoucher(voucher.$id)}
                  disabled={loading}
                >
                  <i className={`fas fa-${voucher.is_active ? 'check-circle' : 'times-circle'}`}></i>
                  {voucher.is_active ? 'Active' : 'Inactive'}
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
