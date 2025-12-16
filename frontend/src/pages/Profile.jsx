/**
 * Profile Page - Flat Modern Design with Sectioned Cards
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import FlashMessage from '../components/FlashMessage';
import '../styles/ProfileModern.css';
import '../styles/SettingsModern.css';

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
  const [previewUrl, setPreviewUrl] = useState('');
  const [businessStats, setBusinessStats] = useState({
    totalCustomers: 0,
    totalTransactions: 0,
    joinedDate: null
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      const businessData = response.data.business || response.data;
      
      setFormData({
        name: businessData.name || '',
        phone: businessData.phone || '',
        description: businessData.description || '',
        profile_photo: null
      });
      setProfilePhotoUrl(businessData.profile_photo_url || '');
      setPreviewUrl(businessData.profile_photo_url || '');
      setBusinessStats({
        totalCustomers: businessData.total_customers || 0,
        totalTransactions: businessData.total_transactions || 0,
        joinedDate: businessData.created_at || businessData.$createdAt || null
      });
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
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
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
    <div className="profile-modern">
      <FlashMessage messages={messages} onClose={() => setMessages([])} />

      <div className="profile-container-modern">
        {/* Profile Photo Card */}
        <div className="profile-photo-card">
          <div className="profile-photo-wrapper">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Profile" 
                className="profile-photo-display"
              />
            ) : (
              <div className="profile-photo-placeholder">
                <i className="fas fa-camera"></i>
              </div>
            )}
            <label htmlFor="profile_photo" className="profile-photo-edit">
              <i className="fas fa-camera"></i>
            </label>
            <input
              type="file"
              id="profile_photo"
              name="profile_photo"
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          <div className="profile-photo-info">
            <div className="profile-name-large">{formData.name || 'Business Name'}</div>
            <div className="profile-phone">{formData.phone || user?.phone}</div>
          </div>
        </div>

        {/* Business Stats Card */}
        <div className="stats-card">
          <div className="stat-item">
            <div className="stat-value amount-large">{businessStats.totalCustomers}</div>
            <div className="stat-label">Total Customers</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-value amount-large">{businessStats.totalTransactions}</div>
            <div className="stat-label">Transactions</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-value" style={{ fontSize: businessStats.joinedDate ? '16px' : '20px' }}>
              {businessStats.joinedDate 
                ? new Date(businessStats.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Just Joined'}
            </div>
            <div className="stat-label">Joined</div>
          </div>
        </div>

        {/* Settings Section - Google Style */}
        <div style={{marginTop: '20px', marginBottom: '20px'}}>
          <h3 style={{fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '16px', padding: '0 4px'}}>Settings</h3>
          
          {/* Settings List */}
          <div className="settings-section" style={{background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'}}>
            <div className="settings-item" onClick={() => navigate('/profile/edit')}>
              <div className="settings-icon blue">
                <i className="fas fa-user"></i>
              </div>
              <div className="settings-content">
                <div className="settings-title">Your info</div>
              </div>
              <i className="fas fa-chevron-right settings-arrow"></i>
            </div>
            
            <div className="settings-item" onClick={() => navigate('/customers')}>
              <div className="settings-icon purple">
                <i className="fas fa-users"></i>
              </div>
              <div className="settings-content">
                <div className="settings-title">Customers</div>
                <div className="settings-subtitle">{businessStats.totalCustomers} total customers</div>
              </div>
              <i className="fas fa-chevron-right settings-arrow"></i>
            </div>
            
            <div className="settings-item" onClick={() => navigate('/transactions')}>
              <div className="settings-icon green">
                <i className="fas fa-receipt"></i>
              </div>
              <div className="settings-content">
                <div className="settings-title">Transactions</div>
                <div className="settings-subtitle">{businessStats.totalTransactions} total transactions</div>
              </div>
              <i className="fas fa-chevron-right settings-arrow"></i>
            </div>
          </div>
          
          <div style={{height: '8px'}}></div>
          
          <div className="settings-section" style={{background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'}}>
            <div className="settings-item">
              <div className="settings-icon orange">
                <i className="fas fa-info-circle"></i>
              </div>
              <div className="settings-content">
                <div className="settings-title">About</div>
                <div className="settings-subtitle">Version 1.0.0</div>
              </div>
              <i className="fas fa-chevron-right settings-arrow"></i>
            </div>
            
            <div className="settings-item">
              <div className="settings-icon blue">
                <i className="fas fa-question-circle"></i>
              </div>
              <div className="settings-content">
                <div className="settings-title">Help & feedback</div>
              </div>
              <i className="fas fa-chevron-right settings-arrow"></i>
            </div>
            
            <div className="settings-item" onClick={handleLogout}>
              <div className="settings-icon red">
                <i className="fas fa-sign-out-alt"></i>
              </div>
              <div className="settings-content">
                <div className="settings-title">Sign out</div>
              </div>
              <i className="fas fa-chevron-right settings-arrow"></i>
            </div>
          </div>
        </div>

        {/* Business Information Card */}
        <div className="profile-section-card">
          <div className="section-header">
            <i className="fas fa-store"></i>
            <h2 className="section-title">Business Information</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Business Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="input input-disabled"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled
              />
              <small className="input-hint">
                <i className="fas fa-lock"></i> Phone number cannot be changed
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                className="input"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of your business"
                rows="3"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i> Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Account Information Card */}
        <div className="profile-section-card">
          <div className="section-header">
            <i className="fas fa-user-circle"></i>
            <h2 className="section-title">Account Information</h2>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">User ID</div>
              <div className="info-value">{user?.id || 'N/A'}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Registered On</div>
              <div className="info-value">
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Settings Card (Placeholder for future features) */}
        <div className="profile-section-card">
          <div className="section-header">
            <i className="fas fa-cog"></i>
            <h2 className="section-title">Settings</h2>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <i className="fas fa-bell"></i>
                <div>
                  <div className="setting-name">Notifications</div>
                  <div className="setting-desc">Manage notification preferences</div>
                </div>
              </div>
              <div className="setting-badge">Coming Soon</div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <i className="fas fa-shield-alt"></i>
                <div>
                  <div className="setting-name">Privacy</div>
                  <div className="setting-desc">Control your data and privacy</div>
                </div>
              </div>
              <div className="setting-badge">Coming Soon</div>
            </div>
          </div>
        </div>

        {/* Logout Card */}
        <div className="logout-card">
          <p className="logout-text">Need to switch accounts or sign out?</p>
          <button 
            className="btn btn-logout"
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
