/**
 * Location Manager Component - Display and update business location with OpenStreetMap
 */
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { locationAPI } from '../services/api';
import locationService from '../services/locationService';
import '../styles/LocationManager.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom purple marker icon
const purpleIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjN2MzYWVkIiBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDkuNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIxLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHptMCAxNy41Yy0yLjggMC01LTIuMi01LTVzMi4yLTUgNS01IDUgMi4yIDUgNS0yLjIgNS01IDV6Ii8+PC9zdmc+',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// Component to update map view when location changes
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

const LocationManager = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mapKey, setMapKey] = useState(0); // Key to force map re-render

  // Load current location on mount
  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      const response = await locationAPI.getLocation();
      if (response.data.location) {
        setLocation(response.data.location);
        setMapKey(prev => prev + 1); // Force map update
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

      setMapKey(prev => prev + 1); // Force map update
      setSuccess('Location updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to update location:', err);
      setError(err.message || 'Failed to get location. Please check permissions.');
      setTimeout(() => setError(null), 5000);
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
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openInMaps = () => {
    if (location && location.latitude && location.longitude) {
      const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="location-manager-modern">
      <div className="location-header-modern">
        <h3 className="location-title-modern">
          <i className="fas fa-map-marker-alt"></i>
          Business Location
        </h3>
        <p className="location-subtitle-modern">
          Help customers find your business on the map
        </p>
      </div>

      {error && (
        <div className="location-alert-modern location-alert-error">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="location-alert-modern location-alert-success">
          <i className="fas fa-check-circle"></i>
          <span>{success}</span>
        </div>
      )}

      <div className="location-content-modern">
        {location && location.latitude && location.longitude ? (
          <>
            {/* Map Display */}
            <div className="map-container-modern">
              <MapContainer
                key={mapKey}
                center={[location.latitude, location.longitude]}
                zoom={15}
                style={{ height: '300px', width: '100%', borderRadius: '16px' }}
                scrollWheelZoom={false}
              >
                <ChangeMapView center={[location.latitude, location.longitude]} zoom={15} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[location.latitude, location.longitude]} icon={purpleIcon}>
                  <Popup>
                    <strong>Your Business Location</strong><br />
                    {formatCoordinate(location.latitude, 'lat')}<br />
                    {formatCoordinate(location.longitude, 'lng')}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Coordinates Display */}
            <div className="coordinates-card-modern">
              <div className="coordinate-item-modern">
                <i className="fas fa-compass coordinate-icon"></i>
                <div className="coordinate-details">
                  <span className="coordinate-label-modern">Latitude</span>
                  <span className="coordinate-value-modern">
                    {formatCoordinate(location.latitude, 'lat')}
                  </span>
                </div>
              </div>
              <div className="coordinate-divider"></div>
              <div className="coordinate-item-modern">
                <i className="fas fa-compass coordinate-icon"></i>
                <div className="coordinate-details">
                  <span className="coordinate-label-modern">Longitude</span>
                  <span className="coordinate-value-modern">
                    {formatCoordinate(location.longitude, 'lng')}
                  </span>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="location-updated-modern">
              <i className="fas fa-clock"></i>
              Last updated: {formatDate(location.updated_at)}
            </div>

            {/* Action Buttons */}
            <div className="location-actions-modern">
              <button 
                className="location-btn-secondary"
                onClick={openInMaps}
              >
                <i className="fas fa-external-link-alt"></i>
                Open in Google Maps
              </button>
              <button 
                className="location-btn-primary"
                onClick={handleGetLocation}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync-alt"></i>
                    Update Location
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="location-empty-modern">
            <div className="location-empty-icon-modern">
              <i className="fas fa-map-marked-alt"></i>
            </div>
            <h4 className="location-empty-title">No Location Set</h4>
            <p className="location-empty-text">
              Enable location access to show your business on the map
            </p>
            <button 
              className="location-btn-primary-large"
              onClick={handleGetLocation}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Getting Location...
                </>
              ) : (
                <>
                  <i className="fas fa-location-arrow"></i>
                  Enable Location
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="location-footer-modern">
        <i className="fas fa-info-circle"></i>
        <span>Your location is stored securely and only used to help customers find you</span>
      </div>
    </div>
  );
};

export default LocationManager;
