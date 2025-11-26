import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);

    const result = await login(phone, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="app-logo">
        <h1>Khatape</h1>
        <p>Your Digital Credit Book</p>
      </div>

      <div className="auth-card">
        <div className="tab-selector">
          <div 
            className={`tab-option ${userType === 'customer' ? 'active' : ''}`}
            onClick={() => setUserType('customer')}
          >
            <i className="fas fa-user"></i> Customer
          </div>
          <div 
            className={`tab-option ${userType === 'business' ? 'active' : ''}`}
            onClick={() => setUserType('business')}
          >
            <i className="fas fa-store"></i> Business
          </div>
        </div>
        
        <div className="tab-content">
          <div className="user-type-display">
            <i className={`fas ${userType === 'customer' ? 'fa-user-circle' : 'fa-store'}`}></i>
            Logging in as: <span>{userType.charAt(0).toUpperCase() + userType.slice(1)}</span>
          </div>
          
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="phone" className="form-label">Mobile Number</label>
              <input 
                type="tel" 
                id="phone" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input" 
                required 
                placeholder="Enter your mobile number"
                maxLength="10"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input" 
                required 
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
            
            <button type="submit" className="btn primary-btn" disabled={loading}>
              <i className="fas fa-sign-in-alt"></i> {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <Link to="/register" className="btn secondary-btn">
              <i className="fas fa-user-plus"></i> New User? Register
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
