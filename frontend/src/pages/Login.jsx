/**
 * Login Page - Business login
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FlashMessage from '../components/FlashMessage';
import '../styles/Auth.css';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phone || !password) {
      setMessages([{ type: 'error', message: 'Please enter both phone number and password' }]);
      return;
    }

    setLoading(true);
    setMessages([]);

    const result = await login(phone, password);
    
    if (result.success) {
      setMessages([{ type: 'success', message: 'Successfully logged in!' }]);
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } else {
      setMessages([{ type: 'error', message: result.error }]);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="app-logo">
        <h1>KhataPe Business</h1>
        <p>Manage Your Business Credit Book</p>
      </div>

      <div className="auth-card">
        <div className="tab-content">
          <div className="user-type-display">
            <i className="fas fa-store"></i> Business Login
          </div>
          
          <FlashMessage messages={messages} onClose={() => setMessages([])} />
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="phone" className="form-label">Mobile Number</label>
              <input
                type="tel"
                id="phone"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your mobile number"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button type="submit" className="btn primary-btn" disabled={loading}>
              <i className="fas fa-sign-in-alt"></i> {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <div className="business-login-section">
              <div className="divider">
                <span>or</span>
              </div>
              <a href="https://customer.khatape.tech" className="btn business-btn">
                <i className="fas fa-user"></i> Login as Customer
              </a>
              <p className="business-help-text">
                Are you a customer? Click above to access the customer app.
              </p>
            </div>
            
            <Link to="/register" className="btn secondary-btn">
              <i className="fas fa-user-plus"></i> New Business? Register
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
