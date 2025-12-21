/**
 * BottomNav Component - Mobile app style bottom navigation
 */
import { Link, useLocation } from 'react-router-dom';
import '../styles/BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    {
      path: '/customers',
      icon: 'fa-users',
      label: 'Customers',
      color: '#f97316'
    },
    {
      path: '/products',
      icon: 'fa-box',
      label: 'Products',
      color: '#10b981'
    },
    {
      path: '/dashboard',
      icon: 'fa-home',
      label: 'Home',
      color: '#5f259f'
    },
    {
      path: '/business',
      icon: 'fa-store',
      label: 'Business',
      color: '#7c3aed'
    },
    {
      path: '/transactions',
      icon: 'fa-receipt',
      label: 'Transactions',
      color: '#3b82f6'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        item.disabled ? (
          <div
            key={item.path}
            className="nav-item nav-item-disabled"
            style={{
              '--nav-color': item.color
            }}
          >
            <i className={`fas ${item.icon}`}></i>
            <span>{item.label}</span>
          </div>
        ) : (
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
        )
      ))}
    </nav>
  );
};

export default BottomNav;
