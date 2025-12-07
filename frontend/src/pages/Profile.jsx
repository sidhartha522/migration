/**
 * Profile Page - Business profile management
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    description: '',
    profile_photo: null
  });
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      setFormData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        description: response.data.description || '',
        profile_photo: null
      });
      setProfilePhotoUrl(response.data.profile_photo_url || '');
    } catch (error) {
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to load profile'
      }]);
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
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profile_photo: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setMessages([]);

    try {
      await profileAPI.updateProfile(formData);
      setMessages([{ type: 'success', message: 'Profile updated successfully!' }]);
      loadProfile();
    } catch (error) {
      setMessages([{
        type: 'error',
        message: error.response?.data?.error || 'Failed to update profile'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="customer-dashboard">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h1>Business Profile</h1>
      </div>

      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      <div className="auth-card">
        {profilePhotoUrl && (
          <div className="profile-photo-preview">
            <img src={profilePhotoUrl} alt="Profile" style={{width: '100px', height: '100px', borderRadius: '50%'}} />
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Business Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled
            />
            <small>Phone number cannot be changed</small>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-input"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of your business"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile_photo" className="form-label">Profile Photo</label>
            <input
              type="file"
              id="profile_photo"
              name="profile_photo"
              className="form-input"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>

          <button 
            type="submit" 
            className="btn primary-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="profile-actions">
          <button 
            className="btn secondary-btn"
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>

        <div className="profile-info">
          <h3>Account Information</h3>
          <p><strong>User ID:</strong> {user?.id}</p>
          <p><strong>Registered:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
