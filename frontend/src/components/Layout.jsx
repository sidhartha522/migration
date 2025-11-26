import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <h2>KathaPe Business</h2>
          <span className="business-name">{user?.business_name}</span>
        </div>

        <div className="navbar-menu">
          <Link
            to="/dashboard"
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/customers"
            className={`nav-link ${isActive('/customers') ? 'active' : ''}`}
          >
            Customers
          </Link>
          <Link
            to="/transactions"
            className={`nav-link ${isActive('/transactions') ? 'active' : ''}`}
          >
            Transactions
          </Link>
          <Link
            to="/recurring-transactions"
            className={`nav-link ${isActive('/recurring-transactions') ? 'active' : ''}`}
          >
            Recurring
          </Link>
          <Link
            to="/bulk-reminders"
            className={`nav-link ${isActive('/bulk-reminders') ? 'active' : ''}`}
          >
            Reminders
          </Link>
          <Link
            to="/profile"
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
          >
            Profile
          </Link>
          <button onClick={logout} className="nav-link logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
