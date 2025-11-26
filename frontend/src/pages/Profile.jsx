import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { profileAPI } from '../services/api';
import '../styles/Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      setProfile(response.data.business);
      setName(response.data.business.name);
      setPhone(response.data.business.phone || '');
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      setSaving(true);
      await profileAPI.updateProfile({ name, phone });
      setMessage('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleRegeneratePin = async () => {
    if (!confirm('Are you sure you want to regenerate your business PIN? The old PIN will no longer work.')) {
      return;
    }

    try {
      const response = await profileAPI.regeneratePin();
      setMessage(`New PIN generated: ${response.data.pin}`);
      fetchProfile();
    } catch (err) {
      setError('Failed to regenerate PIN');
    }
  };

  const handleShowQR = async () => {
    try {
      const response = await profileAPI.getQRCode();
      const url = URL.createObjectURL(response.data);
      setQrCodeUrl(url);
      setShowQR(true);
    } catch (err) {
      setError('Failed to generate QR code');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading profile...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="profile-page">
        <div className="page-header">
          <h1>Business Profile</h1>
        </div>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="profile-card">
          {editing ? (
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="name">Business Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength="10"
                  disabled={saving}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-info">
                <div className="info-row">
                  <span>Business Name:</span>
                  <strong>{profile?.name}</strong>
                </div>
                <div className="info-row">
                  <span>Phone:</span>
                  <strong>{profile?.phone || 'Not set'}</strong>
                </div>
                <div className="info-row highlight">
                  <span>Business PIN:</span>
                  <strong className="pin">{profile?.pin}</strong>
                </div>
              </div>

              <div className="profile-actions">
                <button onClick={() => setEditing(true)} className="btn btn-primary">
                  Edit Profile
                </button>
                <button onClick={handleRegeneratePin} className="btn btn-warning">
                  Regenerate PIN
                </button>
                <button onClick={handleShowQR} className="btn btn-secondary">
                  Show QR Code
                </button>
              </div>
            </>
          )}
        </div>

        {showQR && qrCodeUrl && (
          <div className="qr-code-section">
            <h2>Business PIN QR Code</h2>
            <img src={qrCodeUrl} alt="Business QR Code" className="qr-code-image" />
            <p>Customers can scan this QR code to get your business PIN</p>
            <button onClick={() => setShowQR(false)} className="btn btn-secondary">
              Close
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
