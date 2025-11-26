import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Register = () => {
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [businessPin, setBusinessPin] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!businessName || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await register(businessName, phone, password);

    if (result.success) {
      // Show the business PIN before redirecting
      setBusinessPin(result.user.business_pin);
      setShowPin(true);
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (showPin) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header success">
            <h1>✓ Registration Successful!</h1>
            <p>Your business has been registered</p>
          </div>

          <div className="pin-display">
            <h2>Your Business PIN</h2>
            <div className="pin-code">{businessPin}</div>
            <p className="pin-note">
              Save this PIN! Customers will use it to connect to your business.
            </p>
          </div>

          <button onClick={handleContinue} className="btn btn-primary">
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>KathaPe Business</h1>
          <p>Register your business</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="businessName">Business Name</label>
            <input
              type="text"
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter your business name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter 10-digit phone number"
              maxLength="10"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
