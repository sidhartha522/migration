/**
 * BusinessDetails - Component to view and edit business profile
 */
import { useState, useEffect } from 'react';
import { businessAPI } from '../../services/api';
import './BusinessDetails.css';

const BusinessDetails = () => {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    phone_number: '',
    email: '',
    address: '',
    description: '',
    logo: null
  });

  useEffect(() => {
    fetchBusinessDetails();
  }, []);

  const fetchBusinessDetails = async () => {
    try {
      setLoading(true);
      const response = await businessAPI.getBusinessProfile();
      const businessData = response.data.business;
      setBusiness(businessData);
      setFormData({
        name: businessData.name || '',
        category: businessData.category || '',
        phone_number: businessData.phone_number || '',
        email: businessData.email || '',
        address: businessData.address || '',
        description: businessData.description || '',
        logo: null
      });
    } catch (error) {
      console.error('Error fetching business details:', error);
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
      logo: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && key !== 'logo') {
          data.append(key, formData[key]);
        }
      });
      if (formData.logo) {
        data.append('profile_photo', formData.logo);
      }

      await businessAPI.updateBusinessProfile(data);
      await fetchBusinessDetails();
      setEditing(false);
    } catch (error) {
      console.error('Error updating business:', error);
      alert('Failed to update business details');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading business details...</p>
      </div>
    );
  }

  return (
    <div className="business-details">
      {!editing ? (
        <div className="business-view">
          <div className="business-header">
            {business?.logo && (
              <img src={business.logo} alt={business.name} className="business-logo" />
            )}
            <div className="business-info">
              <h2>{business?.name || 'No Business Name'}</h2>
              <p className="category">{business?.category || 'Category not set'}</p>
            </div>
          </div>

          <div className="business-details-grid">
            <div className="detail-item">
              <i className="fas fa-phone"></i>
              <div>
                <label>Phone</label>
                <p>{business?.phone_number || 'Not provided'}</p>
              </div>
            </div>

            <div className="detail-item">
              <i className="fas fa-envelope"></i>
              <div>
                <label>Email</label>
                <p>{business?.email || 'Not provided'}</p>
              </div>
            </div>

            <div className="detail-item">
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <label>Address</label>
                <p>{business?.address || 'Not provided'}</p>
              </div>
            </div>

            <div className="detail-item full-width">
              <i className="fas fa-info-circle"></i>
              <div>
                <label>Description</label>
                <p>{business?.description || 'No description available'}</p>
              </div>
            </div>
          </div>

          <button className="btn-edit" onClick={() => setEditing(true)}>
            <i className="fas fa-edit"></i>
            Edit Business Details
          </button>
        </div>
      ) : (
        <form className="business-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter business name"
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="e.g., Retail, Restaurant, Services"
            />
          </div>

          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              required
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter business address"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your business"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Business Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              <i className="fas fa-save"></i>
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BusinessDetails;
