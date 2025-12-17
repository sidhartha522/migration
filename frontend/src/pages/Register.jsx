/**
 * Register Page - Business registration
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FlashMessage from '../components/FlashMessage';
import '../styles/Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !phoneNumber || !password) {
      setMessages([{ type: 'error', message: 'All fields are required' }]);
      return;
    }

    // Validate phone number
    if (!phoneNumber.match(/^\d{10}$/)) {
      setMessages([{ type: 'error', message: 'Phone number must be exactly 10 digits' }]);
      return;
    }

    setLoading(true);
    setMessages([]);

    const result = await register(name, phoneNumber, password);
    
    if (result.success) {
      setMessages([{ type: 'success', message: 'Registration successful! Welcome to Ekthaa!' }]);
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
        {/* Illustration */}
        <div className="illustration-borderless">
          <img 
            src="/logo.png" 
            alt="Ekthaa" 
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

        {/* Register Card */}
        <div className="login-card-clean">
          <div className="card-header-clean">
            <h1>Create Your Business</h1>
            <h2>Credit Book</h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="input-clean">
              <i className="fas fa-store"></i>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your business name"
                required
              />
            </div>

            <div className="input-clean">
              <i className="fas fa-phone"></i>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your 10-digit mobile number"
                required
              />
            </div>
            
            <div className="input-clean">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
              />
            </div>
            
            <button type="submit" className="btn-submit-clean" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Registering...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i> Register
                </>
              )}
            </button>
            
            <Link to="/login" className="link-switch-clean">
              <i className="fas fa-sign-in-alt"></i> Already have an account? Login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
