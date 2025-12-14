/**
 * AppBar Component - Ekthaa Branding Bar (PhonePe-style)
 */
import { useLocation, Link } from 'react-router-dom';
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
            <span className="logo-text">Ekthaa</span>
          </div>
        )}
        
        {title && (
          <h1 className="app-bar-title">{title}</h1>
        )}
        
        <div className="app-bar-actions">
          {rightAction || (
            <Link to="/profile" className="profile-btn-topnav">
              <i className="fas fa-user-circle"></i>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppBar;
