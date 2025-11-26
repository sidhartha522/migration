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
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !phone || !password) {
      setMessages([{ type: 'error', message: 'All fields are required' }]);
      return;
    }

    // Validate phone number
    if (!phone.match(/^\d{10}$/)) {
      setMessages([{ type: 'error', message: 'Phone number must be exactly 10 digits' }]);
      return;
    }

    setLoading(true);
    setMessages([]);

    const result = await register(name, phone, password);
    
    if (result.success) {
      setMessages([{ type: 'success', message: 'Registration successful! Welcome to KhataPe Business!' }]);
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
            <i className="fas fa-store"></i> Business Registration
          </div>
          
          <FlashMessage messages={messages} onClose={() => setMessages([])} />
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Business Name</label>
              <input
                type="text"
                id="name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your business name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">Mobile Number</label>
              <input
                type="tel"
                id="phone"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your 10-digit mobile number"
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
                placeholder="Create a password"
                required
              />
            </div>
            
            <button type="submit" className="btn primary-btn" disabled={loading}>
              <i className="fas fa-user-plus"></i> {loading ? 'Registering...' : 'Register'}
            </button>
            
            <Link to="/login" className="btn secondary-btn">
              <i className="fas fa-sign-in-alt"></i> Already have an account? Login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
