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
    title: '',
    description: '',
    discount: '',
    validFrom: '',
    validUntil: '',
    image: null
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

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
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
        title: '',
        description: '',
        discount: '',
        validFrom: '',
        validUntil: '',
        image: null
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
            <label>Offer Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Summer Sale 2025"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe your offer"
              rows="3"
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
              placeholder="20"
            />
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
            <label>Offer Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <button type="submit" className="btn-submit">
            <i className="fas fa-plus-circle"></i>
            Create Offer
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
            <div key={offer.$id} className={`offer-card ${!offer.is_active ? 'inactive' : ''}`}>
              <div className="offer-badge">{offer.discount}% OFF</div>
              
              {offer.image_url && (
                <div className="offer-image">
                  <img src={offer.image_url} alt={offer.title} />
                </div>
              )}
              
              <div className="offer-content">
                <h4>{offer.title}</h4>
                <p>{offer.description}</p>
                
                <div className="offer-dates">
                  <i className="fas fa-calendar"></i>
                  <span>
                    {new Date(offer.valid_from).toLocaleDateString()} - {new Date(offer.valid_until).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="offer-actions">
                <button 
                  className={`btn-toggle ${offer.is_active ? 'active' : ''}`}
                  onClick={() => toggleOffer(offer.$id)}
                  disabled={loading}
                >
                  <i className={`fas fa-${offer.is_active ? 'check-circle' : 'times-circle'}`}></i>
                  {offer.is_active ? 'Active' : 'Inactive'}
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
