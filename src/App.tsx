import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Inventory from './pages/Inventory';
import POS from './pages/POS';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="app-header">
        <h1>🃏 TradeBinder</h1>
        <p>MTG Card Trading Platform</p>
        <div className="header-actions">
          <a href="/login" className="btn-primary">Login</a>
          <a href="/dashboard" className="btn-secondary">Dashboard</a>
        </div>
      </header>
      <main className="app-main">
        <div className="features-grid">
          <FeatureCard 
            title="Inventory" 
            emoji="📦" 
            description="Manage 200+ MTG cards"
            link="/inventory"
          />
          <FeatureCard 
            title="POS" 
            emoji="🛒" 
            description="Quick checkout system"
            link="/pos"
          />
          <FeatureCard 
            title="Customers" 
            emoji="👥" 
            description="Customer management"
            link="/customers"
          />
          <FeatureCard 
            title="Reports" 
            emoji="📊" 
            description="Sales analytics"
            link="/reports"
          />
        </div>
        <div className="api-status">
          <p>API: {API_URL}</p>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ title, emoji, description, link }: any) {
  return (
    <a href={link} className="feature-card">
      <div className="feature-emoji">{emoji}</div>
      <h3>{title}</h3>
      <p className="feature-description">{description}</p>
      <span className="feature-link">View →</span>
    </a>
  );
}

function LoginPage() {
  const [email, setEmail] = useState('admin@tradebinder.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. API: ' + API_URL);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>🃏 TradeBinder Login</h1>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tradebinder.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="hint">Default: admin@tradebinder.com / admin123</p>
        </form>
        <a href="/" className="back-link">← Back to Home</a>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <nav className="dashboard-nav">
          <a href="/inventory">Inventory</a>
          <a href="/pos">POS</a>
          <a href="/customers">Customers</a>
          <a href="/reports">Reports</a>
          <a href="/">Logout</a>
        </nav>
      </header>
      <main className="dashboard-content">
        <div className="stats-grid">
          <StatCard title="Total Cards" value="342" icon="🃏" />
          <StatCard title="Inventory Value" value="₱45,230" icon="💰" />
          <StatCard title="Orders" value="127" icon="📦" />
          <StatCard title="Customers" value="15" icon="👥" />
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}

function CustomersPage() {
  return <PlaceholderPage title="👥 Customers" message="Customer management coming soon..." />;
}

function ReportsPage() {
  return <PlaceholderPage title="📊 Reports" message="Sales analytics coming soon..." />;
}

function PlaceholderPage({ title, message }: any) {
  return (
    <div className="placeholder-page">
      <h1>{title}</h1>
      <p>{message}</p>
      <a href="/dashboard" className="btn-primary">← Back to Dashboard</a>
    </div>
  );
}

export default App;
