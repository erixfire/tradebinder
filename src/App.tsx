import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>🃏 TradeBinder</h1>
          <p>MTG Card Trading Platform</p>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Add more routes as features are built */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div className="home-page">
      <h2>Welcome to TradeBinder</h2>
      <p>Your MTG card inventory and trading platform is under construction.</p>
      <div className="features-grid">
        <FeatureCard title="Inventory" emoji="📦" status="Coming Soon" />
        <FeatureCard title="POS" emoji="🛒" status="Coming Soon" />
        <FeatureCard title="Customers" emoji="👤" status="Coming Soon" />
        <FeatureCard title="Reports" emoji="📊" status="Coming Soon" />
      </div>
    </div>
  );
}

function FeatureCard({ title, emoji, status }: { title: string; emoji: string; status: string }) {
  return (
    <div className="feature-card">
      <div className="feature-emoji">{emoji}</div>
      <h3>{title}</h3>
      <span className="feature-status">{status}</span>
    </div>
  );
}

export default App;
