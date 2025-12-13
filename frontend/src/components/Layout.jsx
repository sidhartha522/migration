/**
 * Layout Component - Main layout wrapper
 */
import { useLocation } from 'react-router-dom';
import Header from './Header';
import ThemeToggle from './ThemeToggle';

const Layout = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="app-container">
      <div className="animated-bg"></div>
      <Header />
      <main className={`main-content ${isDashboard ? 'main-dashboard' : ''}`}>
        {children}
      </main>
      <footer className="footer">
        <div className="container">
          © 2024 KhataPe Business. All rights reserved.
        </div>
      </footer>
      <ThemeToggle />
    </div>
  );
};

export default Layout;
