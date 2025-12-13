/**
 * AppBar Component - KathaPe Branding Bar (PhonePe-style)
 */
import { useLocation } from 'react-router-dom';
import '../styles/AppBar.css';

const AppBar = ({ title, showBack, onBack, rightAction }) => {
  const location = useLocation();
  
  // Determine if we're on a main tab
  const isMainTab = ['/', '/dashboard', '/customers', '/products', '/transactions', '/profile'].includes(location.pathname);
  
  return (
    <div className="app-bar">
      <div className="app-bar-content">
        {showBack && !isMainTab ? (
          <button className="app-bar-back" onClick={onBack}>
            <i className="fas fa-arrow-left"></i>
          </button>
        ) : (
          <div className="app-bar-logo">
            <span className="logo-text">KathaPe</span>
          </div>
        )}
        
        {title && (
          <h1 className="app-bar-title">{title}</h1>
        )}
        
        <div className="app-bar-actions">
          {rightAction || <div style={{width: '40px'}}></div>}
        </div>
      </div>
    </div>
  );
};

export default AppBar;
