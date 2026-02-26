import { useState, useEffect } from 'react';
import './Trading.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface TradeCard {
  id: number;
  name: string;
  type_line: string;
  set_name: string;
  rarity: string;
  price_php: number;
  image_url?: string;
  owner?: string;
  quantity?: number;
}

interface TradeOffer {
  id: number;
  from_user: string;
  to_user: string;
  offering: TradeCard[];
  requesting: TradeCard[];
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export default function Trading() {
  const [activeTab, setActiveTab] = useState<'browse' | 'wishlist' | 'my-trades' | 'offers'>('browse');
  const [availableCards, setAvailableCards] = useState<TradeCard[]>([]);
  const [wishlist, setWishlist] = useState<TradeCard[]>([]);
  const [myTrades, setMyTrades] = useState<TradeCard[]>([]);
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch available cards from inventory
      const invResponse = await fetch(`${API_URL}/api/inventory`);
      const invData = await invResponse.json();
      
      // Simulate cards from other traders (in production, fetch from users API)
      const cards = (invData.inventory || []).map((card: any) => ({
        ...card,
        owner: ['User123', 'MTGTrader99', 'CardCollector', 'ProTrader'][Math.floor(Math.random() * 4)],
      }));
      
      setAvailableCards(cards);
      
      // Load user's wishlist from localStorage
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
      
      // Load user's trade list
      const savedTrades = localStorage.getItem('myTrades');
      if (savedTrades) {
        setMyTrades(JSON.parse(savedTrades));
      }
      
      // Simulate trade offers
      setTradeOffers([
        {
          id: 1,
          from_user: 'MTGTrader99',
          to_user: 'You',
          offering: cards.slice(0, 2),
          requesting: cards.slice(2, 4),
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = (card: TradeCard) => {
    if (!wishlist.find(c => c.id === card.id)) {
      const newWishlist = [...wishlist, card];
      setWishlist(newWishlist);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    }
  };

  const removeFromWishlist = (id: number) => {
    const newWishlist = wishlist.filter(c => c.id !== id);
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  const addToMyTrades = (card: TradeCard) => {
    if (!myTrades.find(c => c.id === card.id)) {
      const newTrades = [...myTrades, card];
      setMyTrades(newTrades);
      localStorage.setItem('myTrades', JSON.stringify(newTrades));
    }
  };

  const removeFromMyTrades = (id: number) => {
    const newTrades = myTrades.filter(c => c.id !== id);
    setMyTrades(newTrades);
    localStorage.setItem('myTrades', JSON.stringify(newTrades));
  };

  const toggleCardSelection = (id: number) => {
    if (selectedCards.includes(id)) {
      setSelectedCards(selectedCards.filter(cid => cid !== id));
    } else {
      setSelectedCards([...selectedCards, id]);
    }
  };

  const createTradeOffer = () => {
    if (selectedCards.length === 0) {
      alert('Select cards to trade!');
      return;
    }
    alert(`Trade offer created! Selected ${selectedCards.length} cards.`);
    setSelectedCards([]);
  };

  const filteredCards = availableCards.filter(card =>
    card.name.toLowerCase().includes(search.toLowerCase()) ||
    card.type_line.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="trading-page">
        <div className="loading">Loading trading data...</div>
      </div>
    );
  }

  return (
    <div className="trading-page">
      <header className="page-header">
        <h1>🔄 Trading Hub</h1>
        <p className="subtitle">Trade cards with other collectors</p>
      </header>

      <div className="trading-content">
        <div className="tabs">
          <button
            className={activeTab === 'browse' ? 'active' : ''}
            onClick={() => setActiveTab('browse')}
          >
            🔍 Browse Cards
          </button>
          <button
            className={activeTab === 'wishlist' ? 'active' : ''}
            onClick={() => setActiveTab('wishlist')}
          >
            ⭐ Wishlist ({wishlist.length})
          </button>
          <button
            className={activeTab === 'my-trades' ? 'active' : ''}
            onClick={() => setActiveTab('my-trades')}
          >
            📤 My Trade List ({myTrades.length})
          </button>
          <button
            className={activeTab === 'offers' ? 'active' : ''}
            onClick={() => setActiveTab('offers')}
          >
            💼 Trade Offers ({tradeOffers.length})
          </button>
        </div>

        {/* Browse Cards Tab */}
        {activeTab === 'browse' && (
          <div className="tab-content">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Search cards from other traders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="cards-grid">
              {filteredCards.slice(0, 30).map((card) => (
                <div key={card.id} className="trade-card">
                  <div className="card-image">
                    {card.image_url ? (
                      <img src={card.image_url} alt={card.name} />
                    ) : (
                      <div className="no-image">🃏</div>
                    )}
                    <div className="card-owner">@{card.owner}</div>
                  </div>
                  <div className="card-info">
                    <h4>{card.name}</h4>
                    <p className="type">{card.type_line}</p>
                    <div className="card-meta">
                      <span className="rarity" data-rarity={card.rarity}>
                        {card.rarity}
                      </span>
                      <span className="value">₱{card.price_php}</span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn-wishlist"
                      onClick={() => addToWishlist(card)}
                      disabled={wishlist.find(c => c.id === card.id) !== undefined}
                    >
                      {wishlist.find(c => c.id === card.id) ? '✓ In Wishlist' : '⭐ Add to Wishlist'}
                    </button>
                    <button
                      className="btn-offer"
                      onClick={() => toggleCardSelection(card.id)}
                    >
                      {selectedCards.includes(card.id) ? '✓ Selected' : '💼 Make Offer'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {selectedCards.length > 0 && (
              <div className="floating-action">
                <p>Selected {selectedCards.length} cards</p>
                <button className="btn-primary" onClick={createTradeOffer}>
                  Create Trade Offer
                </button>
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>⭐ Your Wishlist</h2>
              <p>Cards you're looking for</p>
            </div>

            {wishlist.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">⭐</div>
                <h3>Your wishlist is empty</h3>
                <p>Browse cards and add ones you want to your wishlist</p>
                <button className="btn-primary" onClick={() => setActiveTab('browse')}>
                  Browse Cards
                </button>
              </div>
            ) : (
              <div className="cards-grid">
                {wishlist.map((card) => (
                  <div key={card.id} className="trade-card">
                    <div className="card-image">
                      {card.image_url ? (
                        <img src={card.image_url} alt={card.name} />
                      ) : (
                        <div className="no-image">🃏</div>
                      )}
                    </div>
                    <div className="card-info">
                      <h4>{card.name}</h4>
                      <p className="type">{card.type_line}</p>
                      <div className="card-meta">
                        <span className="rarity" data-rarity={card.rarity}>
                          {card.rarity}
                        </span>
                        <span className="value">₱{card.price_php}</span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button
                        className="btn-remove"
                        onClick={() => removeFromWishlist(card.id)}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Trade List Tab */}
        {activeTab === 'my-trades' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>📤 Your Trade List</h2>
              <p>Cards you're offering to trade</p>
              <button className="btn-secondary" onClick={() => setActiveTab('browse')}>
                + Add Cards
              </button>
            </div>

            {myTrades.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📤</div>
                <h3>No cards in your trade list</h3>
                <p>Add cards from your inventory that you want to trade</p>
                <button className="btn-primary" onClick={() => window.location.href = '/inventory'}>
                  Go to Inventory
                </button>
              </div>
            ) : (
              <div className="cards-grid">
                {myTrades.map((card) => (
                  <div key={card.id} className="trade-card">
                    <div className="card-image">
                      {card.image_url ? (
                        <img src={card.image_url} alt={card.name} />
                      ) : (
                        <div className="no-image">🃏</div>
                      )}
                      <div className="card-badge">Available</div>
                    </div>
                    <div className="card-info">
                      <h4>{card.name}</h4>
                      <p className="type">{card.type_line}</p>
                      <div className="card-meta">
                        <span className="rarity" data-rarity={card.rarity}>
                          {card.rarity}
                        </span>
                        <span className="value">₱{card.price_php}</span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button
                        className="btn-remove"
                        onClick={() => removeFromMyTrades(card.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trade Offers Tab */}
        {activeTab === 'offers' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>💼 Trade Offers</h2>
              <p>Pending trade proposals</p>
            </div>

            {tradeOffers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💼</div>
                <h3>No trade offers</h3>
                <p>You don't have any pending trade offers</p>
              </div>
            ) : (
              <div className="offers-list">
                {tradeOffers.map((offer) => (
                  <div key={offer.id} className="trade-offer">
                    <div className="offer-header">
                      <h3>Trade Offer from @{offer.from_user}</h3>
                      <span className={`status ${offer.status}`}>{offer.status}</span>
                    </div>
                    <div className="offer-content">
                      <div className="offer-section">
                        <h4>They're offering:</h4>
                        <div className="mini-cards">
                          {offer.offering.map((card) => (
                            <div key={card.id} className="mini-card">
                              <div className="mini-image">🃏</div>
                              <div className="mini-info">
                                <p>{card.name}</p>
                                <span>₱{card.price_php}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="offer-divider">⇄</div>
                      <div className="offer-section">
                        <h4>They're requesting:</h4>
                        <div className="mini-cards">
                          {offer.requesting.map((card) => (
                            <div key={card.id} className="mini-card">
                              <div className="mini-image">🃏</div>
                              <div className="mini-info">
                                <p>{card.name}</p>
                                <span>₱{card.price_php}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {offer.status === 'pending' && (
                      <div className="offer-actions">
                        <button className="btn-accept">✓ Accept</button>
                        <button className="btn-reject">✗ Reject</button>
                        <button className="btn-counter">💬 Counter Offer</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <a href="/dashboard" className="back-link">← Back to Dashboard</a>
    </div>
  );
}
