import { useState, useEffect } from 'react';
import { calculateCardValue, formatPHP, TradeCard, CONDITION_MULTIPLIERS } from '../utils/tradingEngine';
import './TradeBinder.css';

interface BinderCard extends TradeCard {
  image_url?: string;
  type_line?: string;
  owner?: string;
  owner_rating?: number;
  verified_trader?: boolean;
}

interface Props {
  mode: 'browse' | 'my-binder';
  onSelectCard?: (card: BinderCard) => void;
  wishlistMatches?: boolean;
}

export default function TradeBinder({ mode, onSelectCard, wishlistMatches }: Props) {
  const [cards, setCards] = useState<BinderCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeMode, setSwipeMode] = useState(false);

  useEffect(() => {
    // Mock data - in production, fetch from API
    const mockCards: BinderCard[] = [
      {
        id: 1,
        name: 'Sheoldred, the Apocalypse',
        marketPrice: 4500,
        condition: 'NM',
        owner: 'MTGTrader_Manila',
        owner_rating: 4.8,
        verified_trader: true,
        image_url: 'https://cards.scryfall.io/normal/front/d/6/d67be074-cdd4-41d9-ac89-0a0456c4e4b2.jpg',
        type_line: 'Legendary Creature — Phyrexian Praetor'
      },
      {
        id: 2,
        name: 'The One Ring',
        marketPrice: 8500,
        condition: 'LP',
        owner: 'CardCollectorPH',
        owner_rating: 4.5,
        verified_trader: true,
      },
      {
        id: 3,
        name: 'Ragavan, Nimble Pilferer',
        marketPrice: 3200,
        condition: 'NM',
        owner: 'ProTrader_QC',
        owner_rating: 4.9,
        verified_trader: true,
      },
    ];
    setCards(mockCards);
  }, []);

  const currentCard = cards[currentIndex];
  const valuation = currentCard ? calculateCardValue(currentCard) : null;

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right' && currentCard) {
      setSelectedCards([...selectedCards, currentCard.id]);
      onSelectCard?.(currentCard);
    }
    
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedCards.includes(id)) {
      setSelectedCards(selectedCards.filter(cid => cid !== id));
    } else {
      setSelectedCards([...selectedCards, id]);
    }
  };

  if (!currentCard && swipeMode) {
    return (
      <div className="trade-binder empty">
        <div className="empty-state">
          <div className="empty-icon">🎴</div>
          <h3>No more cards</h3>
          <p>You've viewed all available cards in this binder</p>
          <button className="btn-primary" onClick={() => setCurrentIndex(0)}>
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trade-binder">
      <div className="binder-header">
        <h2>📋 Trade Binder</h2>
        <div className="view-toggle">
          <button 
            className={!swipeMode ? 'active' : ''}
            onClick={() => setSwipeMode(false)}
          >
            📏 Grid View
          </button>
          <button 
            className={swipeMode ? 'active' : ''}
            onClick={() => setSwipeMode(true)}
          >
            🎴 Swipe Mode
          </button>
        </div>
      </div>

      {swipeMode ? (
        <div className="swipe-container">
          <div className="swipe-card">
            <div className="card-image-large">
              {currentCard.image_url ? (
                <img src={currentCard.image_url} alt={currentCard.name} />
              ) : (
                <div className="no-image">🃏</div>
              )}
            </div>
            
            <div className="card-details-overlay">
              <div className="owner-badge">
                <span className="owner-icon">👤</span>
                <span>{currentCard.owner}</span>
                {currentCard.verified_trader && <span className="verified">✓</span>}
                <span className="rating">⭐ {currentCard.owner_rating}</span>
              </div>
              
              <h3>{currentCard.name}</h3>
              <p className="type-line">{currentCard.type_line}</p>
              
              <div className="condition-badge" data-condition={currentCard.condition}>
                {CONDITION_MULTIPLIERS[currentCard.condition].condition}
              </div>
              
              {valuation && (
                <div className="value-info">
                  <div className="value-row">
                    <span>Market Price:</span>
                    <strong>{formatPHP(valuation.marketValue)}</strong>
                  </div>
                  <div className="value-row">
                    <span>Trade Value:</span>
                    <strong className="trade-value">{formatPHP(valuation.adjustedValue)}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="swipe-actions">
            <button className="swipe-btn reject" onClick={() => handleSwipe('left')}>
              <span>❌</span>
              <span>Pass</span>
            </button>
            <button className="swipe-btn accept" onClick={() => handleSwipe('right')}>
              <span>❤️</span>
              <span>Want</span>
            </button>
          </div>

          <div className="swipe-counter">
            {currentIndex + 1} / {cards.length}
          </div>
        </div>
      ) : (
        <div className="binder-grid">
          {cards.map((card) => {
            const cardVal = calculateCardValue(card);
            const isSelected = selectedCards.includes(card.id);
            
            return (
              <div 
                key={card.id} 
                className={`binder-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleSelect(card.id)}
              >
                <div className="card-image">
                  {card.image_url ? (
                    <img src={card.image_url} alt={card.name} />
                  ) : (
                    <div className="no-image">🃏</div>
                  )}
                  {isSelected && <div className="selected-overlay">✓</div>}
                </div>
                
                <div className="card-info">
                  <h4>{card.name}</h4>
                  <div className="card-meta">
                    <span className="condition" data-condition={card.condition}>
                      {card.condition}
                    </span>
                    <span className="value">{formatPHP(cardVal.adjustedValue)}</span>
                  </div>
                  <div className="owner-info">
                    <span>👤 {card.owner}</span>
                    {card.verified_trader && <span className="verified-mini">✓</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCards.length > 0 && (
        <div className="selection-footer">
          <p>{selectedCards.length} cards selected</p>
          <button className="btn-primary">
            📝 Create Trade Offer
          </button>
        </div>
      )}
    </div>
  );
}
