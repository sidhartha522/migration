/**
 * Location Service - Handle device location access
 * Works on both web (browser API) and mobile (Capacitor)
 */
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

class LocationService {
  /**
   * Check if running on native platform or web
   */
  isNative() {
    return Capacitor.isNativePlatform();
  }

  /**
   * Request location permissions
   */
  async requestPermissions() {
    try {
      if (this.isNative()) {
        // Use Capacitor for mobile
        const permission = await Geolocation.requestPermissions();
        return permission.location === 'granted';
      } else {
        // Browser doesn't have a separate permission request API
        // Permission is requested when getCurrentPosition is called
        return true;
      }
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
      if (this.isNative()) {
        const permission = await Geolocation.checkPermissions();
        return permission.location === 'granted';
      } else {
        // For web, we can use the Permissions API if available
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          return result.state === 'granted';
        }
        // If Permissions API not available, assume we need to request
        return false;
      }
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
      if (this.isNative()) {
        // Use Capacitor for mobile
        const hasPermission = await this.checkPermissions();
        
        if (!hasPermission) {
          const granted = await this.requestPermissions();
          if (!granted) {
            throw new Error('Location permission denied');
          }
        }

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
      } else {
        // Use browser's native Geolocation API
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp
              });
            },
            (error) => {
              let errorMessage = 'Failed to get location';
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage = 'Location information is unavailable.';
                  break;
                case error.TIMEOUT:
                  errorMessage = 'Location request timed out.';
                  break;
              }
              reject(new Error(errorMessage));
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        });
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      throw error;
    }
  }

  /**
   * Watch location changes (for continuous tracking)
   */
  watchPosition(callback) {
    if (this.isNative()) {
      // Use Capacitor for mobile
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
    } else {
      // Use browser's native Geolocation API
      if (!navigator.geolocation) {
        callback(null, new Error('Geolocation is not supported by your browser'));
        return null;
      }

      return navigator.geolocation.watchPosition(
        (position) => {
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          console.error('Error watching position:', error);
          callback(null, error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }

  /**
   * Clear location watch
   */
  async clearWatch(watchId) {
    try {
      if (this.isNative()) {
        await Geolocation.clearWatch({ id: watchId });
      } else {
        if (navigator.geolocation && watchId) {
          navigator.geolocation.clearWatch(watchId);
        }
      }
    } catch (error) {
      console.error('Error clearing watch:', error);
    }
  }
}

export default new LocationService();
