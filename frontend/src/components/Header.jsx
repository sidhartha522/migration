/**
 * Header Component - Navigation bar for Business app
 */
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Only show the header title on dashboard page
  const isDashboardPage = location.pathname === '/dashboard';

  return (
    <header className="app-header">
      <div className="header-content">
        {isDashboardPage && (
          <Link to="/" className="app-title">
            KhataPe Business
          </Link>
        )}
        
        <button 
          className="nav-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle Navigation Menu"
        >
          <i className="fas fa-bars"></i>
        </button>
        
        <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                <i className="fas fa-home"></i> Dashboard
              </Link>
              <Link to="/customers" className="nav-link" onClick={closeMenu}>
                <i className="fas fa-users"></i> Customers
              </Link>
              <Link to="/transactions" className="nav-link" onClick={closeMenu}>
                <i className="fas fa-receipt"></i> Transactions
              </Link>
              <Link to="/profile" className="nav-link" onClick={closeMenu}>
                <i className="fas fa-user-circle"></i> Profile
              </Link>
              <button onClick={handleLogout} className="nav-link logout-btn">
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={closeMenu}>
                <i className="fas fa-sign-in-alt"></i> Login
              </Link>
              <Link to="/register" className="nav-link" onClick={closeMenu}>
                <i className="fas fa-user-plus"></i> Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
