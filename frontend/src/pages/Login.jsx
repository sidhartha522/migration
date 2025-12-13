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
    <div className="login-ios">
      <FlashMessage messages={messages} onClose={() => setMessages([])} />
      
      <div className="login-wrapper">
        {/* Illustration - Borderless */}
        <div className="illustration-borderless">
          <img 
            src="/logo.png" 
            alt="KhataPe Business" 
            className="logo-illustration"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
          <div className="logo-fallback" style={{ display: 'none' }}>
            <i className="fas fa-store"></i>
          </div>
        </div>

        {/* Login Card */}
        <div className="login-card-clean">
          <div className="card-header-clean">
            <h1>Login to Access Your</h1>
            <h2>Credit Book</h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="input-clean">
              <i className="fas fa-phone"></i>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your mobile number"
                required
              />
            </div>
            
            <div className="input-clean">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button type="submit" className="btn-login-clean" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="divider-clean">
            <span>Or login as</span>
          </div>

          <a href="https://customer.khatape.tech" className="btn-customer-clean">
            <i className="fas fa-user"></i>
            <span>Customer Login</span>
          </a>

          <div className="signup-link">
            <span>Don't have an account?</span>
            <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
