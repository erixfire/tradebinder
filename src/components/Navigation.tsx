import { useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

interface NavigationProps {
  onLogout?: () => void;
}

export default function Navigation({ onLogout }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => navigate('/')}>
          <span className="brand-icon">🎴</span>
          <span className="brand-name">TradeBinder</span>
        </div>

        <div className="nav-links">
          <button
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            <span className="nav-icon">📦</span>
            Inventory
          </button>

          <button
            className={`nav-link ${isActive('/import') ? 'active' : ''}`}
            onClick={() => navigate('/import')}
          >
            <span className="nav-icon">📥</span>
            Import
          </button>

          <button
            className={`nav-link ${isActive('/trading') ? 'active' : ''}`}
            onClick={() => navigate('/trading')}
          >
            <span className="nav-icon">🔄</span>
            Trading
          </button>

          <button
            className={`nav-link ${isActive('/pos') ? 'active' : ''}`}
            onClick={() => navigate('/pos')}
          >
            <span className="nav-icon">💰</span>
            POS
          </button>
        </div>

        <div className="nav-user">
          <div className="user-info">
            <span className="user-name">{user.firstName || 'User'}</span>
            <span className="user-role">{user.role || 'admin'}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
