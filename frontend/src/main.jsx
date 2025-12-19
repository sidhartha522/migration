import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapApp } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';

// Initialize Capacitor plugins
const initializeApp = async () => {
  try {
    // Set status bar to not overlay web view
    await StatusBar.setOverlaysWebView({ overlay: false });
    
    // Set status bar style
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#7c3aed' });
    
    // Hide splash screen after app is ready
    await SplashScreen.hide();
    
    // Handle back button on Android
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        CapApp.exitApp();
      } else {
        window.history.back();
      }
    });
    
    // Configure keyboard behavior
    Keyboard.setAccessoryBarVisible({ isVisible: true });
  } catch (error) {
    console.log('Running in browser mode');
  }
};

initializeApp();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
