/**
 * Location Manager Component - Display and update business location
 */
import { useState, useEffect } from 'react';
import { locationAPI } from '../services/api';
import locationService from '../services/locationService';
import '../styles/LocationManager.css';

const LocationManager = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load current location on mount
  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      const response = await locationAPI.getLocation();
      if (response.data.location) {
        setLocation(response.data.location);
      }
    } catch (err) {
      console.error('Failed to load location:', err);
    }
  };

  const handleGetLocation = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Get device location
      const deviceLocation = await locationService.getCurrentLocation();
      
      // Update in database
      await locationAPI.updateLocation({
        latitude: deviceLocation.latitude,
        longitude: deviceLocation.longitude
      });

      setLocation({
        latitude: deviceLocation.latitude,
        longitude: deviceLocation.longitude,
        updated_at: new Date().toISOString()
      });

      setSuccess('Location updated successfully!');
    } catch (err) {
      console.error('Failed to update location:', err);
      setError(err.message || 'Failed to get location. Please check permissions.');
    } finally {
      setLoading(false);
    }
  };

  const formatCoordinate = (value, type) => {
    if (!value) return 'N/A';
    const formatted = Math.abs(value).toFixed(6);
    const direction = type === 'lat' 
      ? (value >= 0 ? 'N' : 'S')
      : (value >= 0 ? 'E' : 'W');
    return `${formatted}° ${direction}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const openInMaps = () => {
    if (location && location.latitude && location.longitude) {
      const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="location-manager">
      <div className="location-header">
        <h3>Business Location</h3>
        <p className="location-subtitle">Allow location access to help customers find you</p>
      </div>

      {error && (
        <div className="location-alert location-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="location-alert location-success">
          <span className="alert-icon">✓</span>
          {success}
        </div>
      )}

      <div className="location-content">
        {location && location.latitude && location.longitude ? (
          <div className="location-display">
            <div className="location-coordinates">
              <div className="coordinate-item">
                <span className="coordinate-label">Latitude:</span>
                <span className="coordinate-value">
                  {formatCoordinate(location.latitude, 'lat')}
                </span>
              </div>
              <div className="coordinate-item">
                <span className="coordinate-label">Longitude:</span>
                <span className="coordinate-value">
                  {formatCoordinate(location.longitude, 'lng')}
                </span>
              </div>
            </div>
            
            <div className="location-info">
              <span className="location-updated">
                Last updated: {formatDate(location.updated_at)}
              </span>
            </div>

            <div className="location-actions">
              <button 
                className="btn btn-secondary"
                onClick={openInMaps}
              >
                📍 View on Maps
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleGetLocation}
                disabled={loading}
              >
                {loading ? '🔄 Updating...' : '🔄 Update Location'}
              </button>
            </div>
          </div>
        ) : (
          <div className="location-empty">
            <div className="location-empty-icon">📍</div>
            <p className="location-empty-text">No location set</p>
            <p className="location-empty-subtitle">
              Click the button below to capture your current location
            </p>
            <button 
              className="btn btn-primary btn-large"
              onClick={handleGetLocation}
              disabled={loading}
            >
              {loading ? '🔄 Getting Location...' : '📍 Enable Location'}
            </button>
          </div>
        )}
      </div>

      <div className="location-footer">
        <small className="location-note">
          💡 Your location will be stored securely and used to help customers find your business.
        </small>
      </div>
    </div>
  );
};

export default LocationManager;
