import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function Home() {
  // Check if user is logged in, redirect to dashboard
  const token = localStorage.getItem('token');
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="logo-header">
      <div className="hb-icon">HB</div>
      <div className="app-name">HealthBand</div>
    </div>
        <h1>Healthcare Patient Portal</h1>
        <p>Welcome to the patient management system</p>
        <div className="home-buttons">
          <Link to="/login" className="home-btn login-btn">Login</Link>
          <Link to="/register" className="home-btn register-btn">Register</Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
