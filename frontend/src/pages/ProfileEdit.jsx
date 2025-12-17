/**
 * Business Profile Edit - Comprehensive Business Information Form with 2-Level Categories
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';
import { getAllLevel1Categories, getLevel2Options } from '../data/businessCategoriesLevels';
import '../styles/ProfileEdit.css';

function ProfileEdit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [messages, setMessages] = useState([]);
  const [formData, setFormData] = useState({
    businessName: '',
    location: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    category: '',
    subcategory: '',
    businessType: '',
    customBusinessType: '',
    operatingHoursFrom: '09:00',
    operatingHoursTo: '18:00',
    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    description: '',
    keywords: [],
    gstNumber: '',
    phone_number: '',
    email: '',
    website: '',
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: ''
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [level2Options, setLevel2Options] = useState([]);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const businessCategoriesLevel1 = getAllLevel1Categories();

  useEffect(() => {
    loadProfile();
  }, []);

  // Update Level 2 options when category changes
  useEffect(() => {
    if (formData.category) {
      const options = getLevel2Options(formData.category);
      setLevel2Options(options);
      // Reset subcategory if not in new options
      if (formData.subcategory && !options.includes(formData.subcategory)) {
        setFormData(prev => ({ ...prev, subcategory: '' }));
      }
    } else {
      setLevel2Options([]);
    }
  }, [formData.category]);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await profileAPI.getProfile();
      const data = response.data.business || response.data;
      
      setFormData({
        businessName: data.name || '',
        location: data.location || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
        category: data.category || '',
        subcategory: data.subcategory || '',
        businessType: data.business_type || '',
        customBusinessType: data.custom_business_type || '',
        operatingHoursFrom: data.operating_hours_from || '09:00',
        operatingHoursTo: data.operating_hours_to || '18:00',
        operatingDays: data.operating_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        description: data.description || '',
        keywords: data.keywords || [],
        gstNumber: data.gst_number || '',
        phone_number: data.phone_number || '',
        email: data.email || '',
        website: data.website || '',
        facebook: data.facebook || '',
        instagram: data.instagram || '',
        twitter: data.twitter || '',
        linkedin: data.linkedin || ''
      });
      
      if (data.logo_url) {
        setLogoPreview(data.logo_url);
      }
    } catch (error) {
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to load profile'
      }]);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      operatingDays: prev.operatingDays.includes(day)
        ? prev.operatingDays.filter(d => d !== day)
        : [...prev.operatingDays, day]
    }));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessages([]);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'keywords' || key === 'operatingDays') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      await profileAPI.updateBusinessProfile(submitData);
      setMessages([{ type: 'success', message: 'Business profile updated successfully!' }]);
      setTimeout(() => navigate('/profile'), 2000);
    } catch (error) {
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to update profile'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-edit-page">
      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      {/* Header */}
      <div className="page-header-edit">
        <button onClick={() => navigate('/profile')} className="btn-back">
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1>Business Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="profile-edit-form">
        
        {/* Logo Upload */}
        <div className="section-card">
          <h3 className="section-title">
            <i className="fas fa-image"></i> Business Logo
          </h3>
          <div className="logo-upload-container">
            <div className="logo-preview">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" />
              ) : (
                <div className="logo-placeholder">
                  <i className="fas fa-store"></i>
                </div>
              )}
            </div>
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleLogoChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="logo-upload" className="btn-upload-logo">
              <i className="fas fa-camera"></i> Change Logo
            </label>
          </div>
        </div>

        {/* Basic Information */}
        <div className="section-card">
          <h3 className="section-title">
            <i className="fas fa-building"></i> Basic Information
          </h3>
          
          <div className="form-group">
            <label>Business Name *</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Enter your business name"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
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
            <label>GST Number</label>
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              placeholder="Enter GST number (optional)"
              pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
              title="Enter valid GST number"
            />
            <small>Format: 22AAAAA0000A1Z5</small>
          </div>
        </div>

        {/* Location */}
        <div className="section-card">
          <h3 className="section-title">
            <i className="fas fa-map-marker-alt"></i> Location
          </h3>
          
          <div className="form-group">
            <label>Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address, Building no."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>PIN Code *</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="PIN Code"
              pattern="[0-9]{6}"
              required
            />
          </div>

          <div className="form-group">
            <label>Landmark / Area</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Near landmark or area name"
            />
          </div>
        </div>

        {/* Business Type */}
        <div className="section-card">
          <h3 className="section-title">
            <i className="fas fa-briefcase"></i> Type of Business
          </h3>
          
          <div className="form-group">
            <label>Business Category (Level 1) *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select main category</option>
              {businessCategoriesLevel1.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          {formData.category && level2Options.length > 0 && (
            <div className="form-group">
              <label>Business Specialization (Level 2)</label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
              >
                <option value="">Select specialization (Optional)</option>
                {level2Options.map(subType => (
                  <option key={subType} value={subType}>
                    {subType}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.businessType === 'custom' && (
            <div className="form-group">
              <label>Custom Business Type *</label>
              <input
                type="text"
                name="customBusinessType"
                value={formData.customBusinessType}
                onChange={handleChange}
                placeholder="Enter your specific business type"
                required
              />
            </div>
          )}
        </div>

        {/* Operating Hours */}
        <div className="section-card">
          <h3 className="section-title">
            <i className="fas fa-clock"></i> Operating Hours
          </h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>From</label>
              <input
                type="time"
                name="operatingHoursFrom"
                value={formData.operatingHoursFrom}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>To</label>
              <input
                type="time"
                name="operatingHoursTo"
                value={formData.operatingHoursTo}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Operating Days</label>
            <div className="days-selector">
              {weekDays.map(day => (
                <button
                  key={day}
                  type="button"
                  className={`day-btn ${formData.operatingDays.includes(day) ? 'active' : ''}`}
                  onClick={() => handleDayToggle(day)}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="section-card">
          <h3 className="section-title">
            <i className="fas fa-align-left"></i> Business Description
          </h3>
          
          <div className="form-group">
            <label>About Your Business</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your business, products, and services..."
              rows="4"
            />
            <small>{formData.description.length}/500 characters</small>
          </div>
        </div>

        {/* Keywords */}
        <div className="section-card">
          <h3 className="section-title">
            <i className="fas fa-tags"></i> Search Keywords
          </h3>
          
          <div className="form-group">
            <label>Add Keywords (for better searchability)</label>
            <div className="keyword-input-group">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                placeholder="e.g., grocery, organic, home delivery"
              />
              <button type="button" onClick={handleAddKeyword} className="btn-add-keyword">
                <i className="fas fa-plus"></i>
              </button>
            </div>
            <div className="keywords-list">
              {formData.keywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">
                  {keyword}
                  <button type="button" onClick={() => handleRemoveKeyword(keyword)}>
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="section-card">
          <h3 className="section-title">
            <i className="fas fa-share-alt"></i> Social Media & Website
          </h3>
          
          <div className="form-group">
            <label><i className="fas fa-globe"></i> Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="form-group">
            <label><i className="fab fa-facebook"></i> Facebook</label>
            <input
              type="url"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div className="form-group">
            <label><i className="fab fa-instagram"></i> Instagram</label>
            <input
              type="url"
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/yourprofile"
            />
          </div>

          <div className="form-group">
            <label><i className="fab fa-twitter"></i> Twitter</label>
            <input
              type="url"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              placeholder="https://twitter.com/yourprofile"
            />
          </div>

          <div className="form-group">
            <label><i className="fab fa-linkedin"></i> LinkedIn</label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="linkedin.com/company/yourcompany"
              style={{wordBreak: 'break-all'}}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="btn-save-profile" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-check"></i> Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfileEdit;
