import { useState } from 'react';
import { calculateStoreBuyback, formatPHP, TradeCard, CONDITION_MULTIPLIERS } from '../utils/tradingEngine';
import './StoreBuyback.css';

interface BuybackCard extends TradeCard {
  image_url?: string;
  set_name?: string;
}

export default function StoreBuyback() {
  const [cards, setCards] = useState<BuybackCard[]>([]);
  const [paymentType, setPaymentType] = useState<'STORE_CREDIT' | 'CASH'>('STORE_CREDIT');
  const [selectedCondition, setSelectedCondition] = useState<keyof typeof CONDITION_MULTIPLIERS>('NM');

  const buyback = cards.length > 0 ? calculateStoreBuyback(cards, paymentType) : null;

  const addCard = (card: BuybackCard) => {
    setCards([...cards, { ...card, condition: selectedCondition }]);
  };

  const removeCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  return (
    <div className="store-buyback">
      <div className="buyback-header">
        <h2>🏪 Store Buy-Back</h2>
        <p className="subtitle">Sell your cards to us for cash or store credit</p>
      </div>

      <div className="buyback-rates-card">
        <h3>📊 Current Buyback Rates</h3>
        <div className="rates-table">
          <div className="rates-header">
            <span>Condition</span>
            <span>Multiplier</span>
            <span>Store Credit</span>
            <span>Cash</span>
          </div>
          {Object.entries(CONDITION_MULTIPLIERS).map(([key, config]) => (
            <div key={key} className="rate-row">
              <span className="condition-name">{config.condition}</span>
              <span className="multiplier">{(config.multiplier * 100).toFixed(0)}%</span>
              <span className="store-credit">{config.storeCreditPercent}%</span>
              <span className="cash">{config.cashPercent}%</span>
            </div>
          ))}
        </div>
        <div className="rates-note">
          💡 Store credit offers better value than cash!
        </div>
      </div>

      <div className="buyback-form">
        <div className="form-row">
          <div className="form-group">
            <label>Card Condition</label>
            <select 
              value={selectedCondition} 
              onChange={(e) => setSelectedCondition(e.target.value as keyof typeof CONDITION_MULTIPLIERS)}
            >
              {Object.entries(CONDITION_MULTIPLIERS).map(([key, config]) => (
                <option key={key} value={key}>{config.condition}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Payment Method</label>
            <div className="payment-toggle">
              <button 
                className={paymentType === 'STORE_CREDIT' ? 'active' : ''}
                onClick={() => setPaymentType('STORE_CREDIT')}
              >
                🎫 Store Credit
              </button>
              <button 
                className={paymentType === 'CASH' ? 'active' : ''}
                onClick={() => setPaymentType('CASH')}
              >
                💵 Cash
              </button>
            </div>
          </div>
        </div>

        <div className="scan-section">
          <div className="scan-placeholder">
            <span className="scan-icon">📷</span>
            <p>Scan card barcode or search by name</p>
            <input type="text" placeholder="Search card name..." />
          </div>
        </div>
      </div>

      {cards.length > 0 && (
        <div className="buyback-list">
          <h3>📋 Cards to Sell ({cards.length})</h3>
          <div className="cards-list">
            {buyback?.breakdown.map((item, index) => (
              <div key={index} className="buyback-item">
                <div className="item-info">
                  <h4>{item.card.name}</h4>
                  <div className="item-meta">
                    <span className="condition-badge" data-condition={item.card.condition}>
                      {CONDITION_MULTIPLIERS[item.card.condition].condition}
                    </span>
                    <span className="market-price">
                      Market: {formatPHP(item.card.marketPrice)}
                    </span>
                  </div>
                </div>
                <div className="item-value">
                  <div className="buyback-value">{formatPHP(item.value)}</div>
                  <button className="btn-remove" onClick={() => removeCard(index)}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="buyback-summary">
            <div className="summary-row">
              <span>Payment Method:</span>
              <strong>{paymentType === 'STORE_CREDIT' ? '🎫 Store Credit' : '💵 Cash'}</strong>
            </div>
            <div className="summary-row total">
              <span>You'll Receive:</span>
              <strong className="total-value">{formatPHP(buyback?.total || 0)}</strong>
            </div>
            <button className="btn-complete-buyback">
              ✅ Complete Transaction
            </button>
          </div>
        </div>
      )}

      {cards.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <h3>No cards added yet</h3>
          <p>Scan or search for cards to start your buyback transaction</p>
        </div>
      )}
    </div>
  );
}
