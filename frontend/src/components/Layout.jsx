import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    closeMobileMenu();
    logout();
  };

  return (
    <div className="layout">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Khatape</h1>
          
          <button 
            className={`nav-toggle ${mobileMenuOpen ? 'active' : ''}`} 
            id="navToggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle Menu"
          >
            <i className="fas fa-bars"></i>
          </button>
          
          <nav className={`nav-links ${mobileMenuOpen ? 'active' : ''}`} id="navLinks">
            <Link to="/dashboard" onClick={closeMobileMenu}>
              <i className="fas fa-chart-line"></i> Dashboard
            </Link>
            <Link to="/customers" onClick={closeMobileMenu}>
              <i className="fas fa-users"></i> Customers
            </Link>
            <Link to="/profile" onClick={closeMobileMenu}>
              <i className="fas fa-user-circle"></i> Profile
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Theme Toggle Button */}
      <div className="theme-toggle" onClick={toggleTheme} title="Toggle light/dark theme">
        {theme === 'light' ? (
          <i className="fas fa-moon"></i>
        ) : (
          <i className="fas fa-sun"></i>
        )}
      </div>
      
      <div className="container">
        <main className="main-content">{children}</main>
      </div>

      <footer className="footer">
        <div className="container">
          © 2024 Khatape. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
