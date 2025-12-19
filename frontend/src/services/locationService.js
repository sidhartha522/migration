/**
 * Location Service - Handle device location access
 */
import { Geolocation } from '@capacitor/geolocation';

class LocationService {
  /**
   * Request location permissions
   */
  async requestPermissions() {
    try {
      const permission = await Geolocation.requestPermissions();
      return permission.location === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Check current permission status
   */
  async checkPermissions() {
    try {
      const permission = await Geolocation.checkPermissions();
      return permission.location === 'granted';
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return false;
    }
  }

  /**
   * Get current location (latitude, longitude)
   */
  async getCurrentLocation() {
    try {
      // Check if we have permission
      const hasPermission = await this.checkPermissions();
      
      if (!hasPermission) {
        // Request permission if not granted
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Location permission denied');
        }
      }

      // Get current position
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      throw error;
    }
  }

  /**
   * Watch location changes (for continuous tracking)
   */
  watchPosition(callback) {
    return Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      },
      (position, err) => {
        if (err) {
          console.error('Error watching position:', err);
          callback(null, err);
        } else {
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        }
      }
    );
  }

  /**
   * Clear location watch
   */
  async clearWatch(watchId) {
    try {
      await Geolocation.clearWatch({ id: watchId });
    } catch (error) {
      console.error('Error clearing watch:', error);
    }
  }
}

export default new LocationService();
