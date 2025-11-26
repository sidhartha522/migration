/**
 * Layout Component - Main layout wrapper
 */
import Header from './Header';
import ThemeToggle from './ThemeToggle';

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <div className="animated-bg"></div>
      <Header />
      <main className="main-content">
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
