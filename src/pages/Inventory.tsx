import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import './Inventory.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface Card {
  id: number;
  name: string;
  mana_cost: string;
  type_line: string;
  oracle_text: string;
  power?: string;
  toughness?: string;
  colors: string;
  set_name: string;
  set_code: string;
  rarity: string;
  image_url?: string;
}

interface InventoryItem extends Card {
  quantity: number;
  condition: string;
  price_php: number;
}

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/inventory`);
      const data = await response.json();
      setInventory(data.inventory || []);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.type_line.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.rarity.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const totalValue = filteredInventory.reduce((sum, item) => sum + (item.price_php * item.quantity), 0);
  const totalCards = filteredInventory.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="inventory-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading inventory...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="inventory-page">
        <header className="page-header">
          <div className="header-content">
            <h1>📦 Inventory Management</h1>
            <div className="header-stats">
              <div className="stat-card">
                <span className="stat-icon">🃏</span>
                <div>
                  <span className="stat-label">Total Cards</span>
                  <span className="stat-value">{totalCards.toLocaleString()}</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">💰</span>
                <div>
                  <span className="stat-label">Total Value</span>
                  <span className="stat-value">₱{totalValue.toLocaleString()}</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">✨</span>
                <div>
                  <span className="stat-label">Unique Cards</span>
                  <span className="stat-value">{filteredInventory.length}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="inventory-content">
          <div className="controls">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search cards by name or type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-buttons">
              <button
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                All Rarities
              </button>
              <button
                className={filter === 'common' ? 'active' : ''}
                onClick={() => setFilter('common')}
              >
                Common
              </button>
              <button
                className={filter === 'uncommon' ? 'active' : ''}
                onClick={() => setFilter('uncommon')}
              >
                Uncommon
              </button>
              <button
                className={filter === 'rare' ? 'active' : ''}
                onClick={() => setFilter('rare')}
              >
                Rare
              </button>
              <button
                className={filter === 'mythic' ? 'active' : ''}
                onClick={() => setFilter('mythic')}
              >
                Mythic
              </button>
            </div>
          </div>

          <div className="inventory-grid">
            {filteredInventory.map((item) => (
              <div key={item.id} className="card-item">
                <div className="card-image">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} loading="lazy" />
                  ) : (
                    <div className="no-image">
                      <span>🃏</span>
                      <p>No Image</p>
                    </div>
                  )}
                  <div className="rarity-badge" data-rarity={item.rarity}>
                    {item.rarity}
                  </div>
                </div>
                <div className="card-details">
                  <h3 className="card-name">{item.name}</h3>
                  <p className="mana-cost">{item.mana_cost || '—'}</p>
                  <p className="type-line">{item.type_line}</p>
                  <div className="card-meta">
                    <span className="set-badge">{item.set_code.toUpperCase()}</span>
                    {item.power && item.toughness && (
                      <span className="pt-badge">{item.power}/{item.toughness}</span>
                    )}
                  </div>
                  <div className="inventory-info">
                    <div className="info-row">
                      <span className="info-label">Qty</span>
                      <span className="info-value">{item.quantity}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Condition</span>
                      <span className="info-value condition-badge">{item.condition}</span>
                    </div>
                    <div className="info-row price-row">
                      <span className="info-label">Price</span>
                      <span className="info-value price">₱{item.price_php.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredInventory.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No cards found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
