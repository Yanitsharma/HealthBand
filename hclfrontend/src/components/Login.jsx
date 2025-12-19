import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch('https://healthband-1.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      // Debug: Log the entire response from backend
      console.log('Backend response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token - try different possible formats
      const token = data.token || 
                    data.accessToken || 
                    data.access_token || 
                    data.jwt ||
                    (data.data && data.data.token) ||
                    (data.data && data.data.accessToken);
      
      if (token) {
        localStorage.setItem('token', token);
        console.log('✅ Token stored successfully');
        console.log('Token preview:', token.substring(0, 20) + '...');
      } else {
        console.error('❌ No token found in response!');
        console.log('Response structure:', JSON.stringify(data, null, 2));
        throw new Error('Login successful but no authentication token received. Please contact support or try again.');
      }

      // Store user info if returned
      const userData = data.user || data.data || data.patient;
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User data stored successfully');
      } else if (data.email || data.name) {
        // If user data is at root level
        localStorage.setItem('user', JSON.stringify(data));
        console.log('User data stored from root level');
      }

      setMessage('Login successful!');
      
      // Reset form
      setFormData({
        email: '',
        password: ''
      });

      // Redirect to dashboard after successful login
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      setError(err.message || 'An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Patient Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <div className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

