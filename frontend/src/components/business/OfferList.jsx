/**
 * OfferList - Component to manage business offers
 */
import { useState, useEffect } from 'react';
import { businessAPI } from '../../services/api';
import './OfferList.css';

const OfferList = () => {
  const [offers, setOffers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    offerType: 'flat_discount',
    discountValue: '',
    buyQuantity: '',
    getQuantity: '',
    specialPrice: '',
    originalPrice: '',
    minPurchase: '',
    maxDiscount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active'
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await businessAPI.getOffers();
      setOffers(response.data.offers || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
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
      await businessAPI.createOffer(formData);
      await fetchOffers(); // Refresh list
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        offerType: 'flat_discount',
        discountValue: '',
        buyQuantity: '',
        getQuantity: '',
        specialPrice: '',
        originalPrice: '',
        minPurchase: '',
        maxDiscount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'active'
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      alert(error.response?.data?.error || 'Failed to create offer');
    } finally {
      setLoading(false);
    }
  };

  const toggleOffer = async (id) => {
    try {
      await businessAPI.toggleOffer(id);
      await fetchOffers(); // Refresh list
    } catch (error) {
      console.error('Error toggling offer:', error);
      alert('Failed to toggle offer');
    }
  };

  const deleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) {
      return;
    }
    
    try {
      await businessAPI.deleteOffer(id);
      await fetchOffers(); // Refresh list
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Failed to delete offer');
    }
  };

  return (
    <div className="offer-list">
      <div className="offer-header">
        <h3>Special Offers</h3>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          <i className="fas fa-plus"></i>
          {showForm ? 'Cancel' : 'Create Offer'}
        </button>
      </div>

      {showForm && (
        <form className="offer-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Offer Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Summer Sale 2025"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your offer"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Offer Type *</label>
            <select name="offerType" value={formData.offerType} onChange={handleChange}>
              <option value="flat_discount">Flat Discount (₹)</option>
              <option value="percentage_discount">Percentage Discount (%)</option>
              <option value="buy_x_get_y">Buy X Get Y</option>
              <option value="special_price">Special Price</option>
            </select>
          </div>

          {(formData.offerType === 'flat_discount' || formData.offerType === 'percentage_discount') && (
            <div className="form-group">
              <label>Discount Value *</label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                required
                min="0"
                placeholder={formData.offerType === 'percentage_discount' ? '20' : '100'}
              />
            </div>
          )}

          {formData.offerType === 'buy_x_get_y' && (
            <div className="form-row">
              <div className="form-group">
                <label>Buy Quantity *</label>
                <input
                  type="number"
                  name="buyQuantity"
                  value={formData.buyQuantity}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="2"
                />
              </div>
              <div className="form-group">
                <label>Get Quantity *</label>
                <input
                  type="number"
                  name="getQuantity"
                  value={formData.getQuantity}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="1"
                />
              </div>
            </div>
          )}

          {formData.offerType === 'special_price' && (
            <div className="form-row">
              <div className="form-group">
                <label>Special Price (₹) *</label>
                <input
                  type="number"
                  name="specialPrice"
                  value={formData.specialPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="499"
                />
              </div>
              <div className="form-group">
                <label>Original Price (₹)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  min="0"
                  placeholder="999"
                />
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Min Purchase (₹)</label>
              <input
                type="number"
                name="minPurchase"
                value={formData.minPurchase}
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
                placeholder="1000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            <i className="fas fa-plus-circle"></i>
            {loading ? 'Creating...' : 'Create Offer'}
          </button>
        </form>
      )}

      <div className="offers-grid">
        {loading ? (
          <div className="empty-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-tags"></i>
            <p>No offers yet</p>
            <small>Create special offers to boost sales</small>
          </div>
        ) : (
          offers.map(offer => (
            <div key={offer.$id} className={`offer-card ${offer.status !== 'active' ? 'inactive' : ''}`}>
              <div className="offer-badge">
                {offer.offerType === 'flat_discount' && `₹${offer.discountValue} OFF`}
                {offer.offerType === 'percentage_discount' && `${offer.discountValue}% OFF`}
                {offer.offerType === 'buy_x_get_y' && `Buy ${offer.buyQuantity} Get ${offer.getQuantity}`}
                {offer.offerType === 'special_price' && `Special Price ₹${offer.specialPrice}`}
              </div>
              
              <div className="offer-content">
                <h4>{offer.name}</h4>
                <p>{offer.description || 'No description'}</p>
                
                {offer.minPurchase > 0 && (
                  <div className="offer-detail">
                    <i className="fas fa-shopping-cart"></i>
                    <span>Min Purchase: ₹{offer.minPurchase}</span>
                  </div>
                )}
                
                <div className="offer-dates">
                  <i className="fas fa-calendar"></i>
                  <span>
                    {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="offer-actions">
                <button 
                  className={`btn-toggle ${offer.status === 'active' ? 'active' : ''}`}
                  onClick={() => toggleOffer(offer.$id)}
                  disabled={loading}
                >
                  <i className={`fas fa-${offer.status === 'active' ? 'check-circle' : 'times-circle'}`}></i>
                  {offer.status === 'active' ? 'Active' : 'Inactive'}
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => deleteOffer(offer.$id)}
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

export default OfferList;
