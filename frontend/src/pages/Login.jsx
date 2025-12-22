/**
 * Login Page - Business login
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FlashMessage from '../components/FlashMessage';
import '../styles/Auth.css';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber || !password) {
      setMessages([{ type: 'error', message: 'Please enter both phone number and password' }]);
      return;
    }

    setLoading(true);
    setMessages([]);

    const result = await login(phoneNumber, password);
    
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
    <div className="login-ios" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <FlashMessage messages={messages} onClose={() => setMessages([])} />
      
      <div className="login-wrapper">
        {/* Illustration - Borderless */}
        <div className="illustration-borderless">
          <img 
            src="/logo.png" 
            alt="Ekthaa" 
            className="logo-illustration"
          />
          <div className="logo-fallback" style={{ display: 'none' }}>
            <i className="fas fa-store"></i>
          </div>
        </div>

        {/* Login Card */}
        <div className="login-card-clean">
          <div className="card-header-clean">
            <h1 style={{ fontWeight: 'bold', color: '#00A896' }}>Login to Ekthaa</h1>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="input-clean">
              <i className="fas fa-phone"></i>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
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
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Logging in...</span>
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="signup-link" style={{ marginTop: '20px', textAlign: 'center' }}>
            <span style={{ fontWeight: 'bold', color: '#00A896' }}>Don't have an account?</span>
            <Link to="/register" style={{ fontWeight: 'bold', color: '#00A896' }}>Create an account</Link>
          </div>

          <div className="divider-clean">
            <span>Or login as</span>
          </div>

          <a href="https://www.customer.ekthaa.app" className="btn-customer-clean">
            <i className="fas fa-user"></i>
            <span>Customer Login</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
