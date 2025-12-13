/**
 * BottomNav Component - Mobile app style bottom navigation
 */
import { Link, useLocation } from 'react-router-dom';
import '../styles/BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    {
      path: '/dashboard',
      icon: 'fa-home',
      label: 'Home',
      color: '#14b8a6' // Teal
    },
    {
      path: '/customers',
      icon: 'fa-users',
      label: 'Customers',
      color: '#f97316' // Orange
    },
    {
      path: '/products',
      icon: 'fa-box',
      label: 'Products',
      color: '#10b981' // Emerald
    },
    {
      path: '/transactions',
      icon: 'fa-receipt',
      label: 'Transactions',
      color: '#8b5cf6' // Purple
    },
    {
      path: '/profile',
      icon: 'fa-user',
      label: 'Profile',
      color: '#6366f1' // Indigo
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          style={{
            '--nav-color': item.color
          }}
        >
          <i className={`fas ${item.icon}`}></i>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
