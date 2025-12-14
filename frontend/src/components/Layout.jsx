/**
 * Layout Component - Modern flat design with Ekthaa branding
 */
import { useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import AppBar from './AppBar';
import { useAuth } from '../context/AuthContext';
import '../styles/DesignSystem.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Pages where bottom nav and app bar should be hidden
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="app-container-modern">
      {isAuthenticated && !isAuthPage && <AppBar />}
      <main className="main-content-modern">
        {children}
      </main>
      {isAuthenticated && !isAuthPage && <BottomNav />}
    </div>
  );
};

export default Layout;
