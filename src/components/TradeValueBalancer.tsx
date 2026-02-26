import { useState, useEffect } from 'react';
import { calculateTradeBalance, formatPHP, TradeCard } from '../utils/tradingEngine';
import './TradeValueBalancer.css';

interface Props {
  offeringCards: TradeCard[];
  requestingCards: TradeCard[];
  onCashTopup?: (amount: number) => void;
}

export default function TradeValueBalancer({ offeringCards, requestingCards, onCashTopup }: Props) {
  const [balance, setBalance] = useState(calculateTradeBalance(offeringCards, requestingCards));
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    setBalance(calculateTradeBalance(offeringCards, requestingCards));
  }, [offeringCards, requestingCards]);

  const handleTopup = () => {
    if (balance.cashTopupRequired > 0) {
      setShowPayment(true);
      onCashTopup?.(balance.cashTopupRequired);
    }
  };

  return (
    <div className="trade-value-balancer">
      <div className="balance-header">
        <h3>💰 Trade Value Balance</h3>
      </div>

      <div className="value-comparison">
        <div className="value-side offering">
          <div className="side-label">You're Offering</div>
          <div className="side-value">{formatPHP(balance.offeringValue)}</div>
          <div className="side-count">{offeringCards.length} cards</div>
        </div>

        <div className="balance-indicator">
          {balance.isBalanced ? (
            <div className="balanced-icon">⚖️</div>
          ) : (
            <div className="unbalanced-icon">⚠️</div>
          )}
        </div>

        <div className="value-side requesting">
          <div className="side-label">You're Requesting</div>
          <div className="side-value">{formatPHP(balance.requestingValue)}</div>
          <div className="side-count">{requestingCards.length} cards</div>
        </div>
      </div>

      <div className="balance-status">
        {balance.isBalanced ? (
          <div className="status-message balanced">
            <span className="status-icon">✅</span>
            <span>Trade is balanced! Values are within ₱50 difference.</span>
          </div>
        ) : balance.cashTopupRequired > 0 ? (
          <div className="status-message needs-topup">
            <span className="status-icon">💵</span>
            <div>
              <p>Cash top-up required: <strong>{formatPHP(balance.cashTopupRequired)}</strong></p>
              <button className="btn-topup" onClick={handleTopup}>
                💳 Pay via GCash/PayMaya
              </button>
            </div>
          </div>
        ) : (
          <div className="status-message offering-more">
            <span className="status-icon">📈</span>
            <span>You're offering {formatPHP(Math.abs(balance.difference))} more value</span>
          </div>
        )}
      </div>

      {showPayment && (
        <div className="payment-modal">
          <div className="payment-content">
            <h3>💳 Complete Payment</h3>
            <p className="payment-amount">{formatPHP(balance.cashTopupRequired)}</p>
            <div className="payment-methods">
              <button className="payment-btn gcash">
                <span className="payment-icon">📱</span>
                <span>GCash</span>
              </button>
              <button className="payment-btn paymaya">
                <span className="payment-icon">💳</span>
                <span>PayMaya</span>
              </button>
            </div>
            <button className="btn-cancel" onClick={() => setShowPayment(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
