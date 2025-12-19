import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ekthaa.kathape',
  appName: 'Kathape Business',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // For development, you can point to your local backend
    // url: 'http://192.168.29.156:5003',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#6366f1',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
