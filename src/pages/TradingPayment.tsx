import { useState, useEffect } from 'react';
import './TradingPayment.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface TradeOffer {
  id: number;
  offering_value: number;
  requesting_value: number;
  buyer: string;
  seller: string;
}

interface PaymentOption {
  method: 'gcash' | 'maya' | 'card' | 'cash';
  name: string;
  logo: string;
  fee: number;
}

export default function TradingPayment({ tradeId }: { tradeId: number }) {
  const [trade, setTrade] = useState<TradeOffer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya' | 'card' | 'cash'>('gcash');
  const [step, setStep] = useState<'select' | 'payment' | 'escrow' | 'complete'>('select');
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');

  const paymentOptions: PaymentOption[] = [
    { method: 'gcash', name: 'GCash', logo: '💳', fee: 0 },
    { method: 'maya', name: 'Maya (PayMaya)', logo: '💳', fee: 0 },
    { method: 'card', name: 'Credit/Debit Card', logo: '💳', fee: 2.5 },
    { method: 'cash', name: 'Cash on Meetup', logo: '💵', fee: 0 },
  ];

  useEffect(() => {
    // Simulate fetching trade details
    setTrade({
      id: tradeId,
      offering_value: 500,
      requesting_value: 600,
      buyer: 'You',
      seller: 'MTGTrader99',
    });
  }, [tradeId]);

  const difference = trade ? trade.requesting_value - trade.offering_value : 0;
  const platformFee = Math.round(difference * 0.025 + 15);
  const total = difference + platformFee;

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Create payment intent
      const response = await fetch(`${API_URL}/api/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade_id: tradeId,
          amount: total,
          currency: 'PHP',
          method: paymentMethod,
          buyer_email: 'user@example.com',
          seller_email: 'seller@example.com',
        }),
      });

      const data = await response.json();

      if (data.checkout_url) {
        setCheckoutUrl(data.checkout_url);
        setStep('payment');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const simulatePayment = () => {
    setStep('escrow');
    setTimeout(() => setStep('complete'), 3000);
  };

  if (!trade) return <div>Loading...</div>;

  return (
    <div className="payment-page">
      <div className="payment-container">
        {/* Step 1: Select Payment Method */}
        {step === 'select' && (
          <>
            <h1>💰 Complete Trade Payment</h1>
            <div className="trade-summary">
              <h3>Trade Summary</h3>
              <div className="summary-row">
                <span>Your cards value:</span>
                <strong>₱{trade.offering_value.toLocaleString()}</strong>
              </div>
              <div className="summary-row">
                <span>Requesting cards value:</span>
                <strong>₱{trade.requesting_value.toLocaleString()}</strong>
              </div>
              <div className="summary-row highlight">
                <span>Difference to pay:</span>
                <strong>₱{difference.toLocaleString()}</strong>
              </div>
              <div className="summary-row">
                <span>Platform fee (2.5% + ₱15):</span>
                <strong>₱{platformFee.toLocaleString()}</strong>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <strong>₱{total.toLocaleString()}</strong>
              </div>
            </div>

            <div className="payment-methods">
              <h3>Select Payment Method</h3>
              {paymentOptions.map((option) => (
                <div
                  key={option.method}
                  className={`payment-option ${paymentMethod === option.method ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod(option.method)}
                >
                  <div className="option-info">
                    <span className="option-logo">{option.logo}</span>
                    <div>
                      <h4>{option.name}</h4>
                      {option.fee > 0 && <p className="fee">+{option.fee}% fee</p>}
                    </div>
                  </div>
                  <div className="option-radio">
                    {paymentMethod === option.method && '✓'}
                  </div>
                </div>
              ))}
            </div>

            <div className="escrow-notice">
              <h4>🔒 Protected by Escrow</h4>
              <ul>
                <li>Your payment is held securely</li>
                <li>Released only when both parties confirm</li>
                <li>7-day dispute resolution period</li>
                <li>Full refund if trade doesn't complete</li>
              </ul>
            </div>

            <button
              className="btn-primary btn-pay"
              onClick={paymentMethod === 'cash' ? () => setStep('complete') : simulatePayment}
              disabled={loading}
            >
              {loading ? 'Processing...' : paymentMethod === 'cash' ? 'Arrange Meetup' : `Pay ₱${total.toLocaleString()}`}
            </button>
          </>
        )}

        {/* Step 2: Payment Processing */}
        {step === 'payment' && (
          <>
            <h1>Processing Payment</h1>
            <div className="payment-processing">
              <div className="loader">⏳</div>
              <p>Redirecting to {paymentMethod === 'gcash' ? 'GCash' : paymentMethod === 'maya' ? 'Maya' : 'payment gateway'}...</p>
              {checkoutUrl && (
                <a href={checkoutUrl} className="btn-primary" target="_blank" rel="noopener noreferrer">
                  Open Payment Page
                </a>
              )}
            </div>
          </>
        )}

        {/* Step 3: Escrow Funded */}
        {step === 'escrow' && (
          <>
            <h1>✅ Payment Received</h1>
            <div className="escrow-status">
              <div className="status-icon">🔒</div>
              <h3>Funds in Escrow</h3>
              <p>Your payment of ₱{total.toLocaleString()} is now held securely in escrow.</p>
              
              <div className="next-steps">
                <h4>Next Steps:</h4>
                <ol>
                  <li>Seller will ship the cards to you</li>
                  <li>You confirm receipt of cards</li>
                  <li>Funds are released to seller</li>
                  <li>Trade complete! 🎉</li>
                </ol>
              </div>

              <div className="timeline">
                <div className="timeline-item completed">
                  <span className="timeline-icon">✓</span>
                  <span>Payment funded</span>
                </div>
                <div className="timeline-item active">
                  <span className="timeline-icon">⏳</span>
                  <span>Awaiting shipment</span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-icon">📦</span>
                  <span>In transit</span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-icon">✓</span>
                  <span>Delivered</span>
                </div>
              </div>

              <button className="btn-secondary">Open Dispute</button>
            </div>
          </>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && (
          <>
            <h1>🎉 Trade Complete!</h1>
            <div className="completion">
              <div className="completion-icon">✨</div>
              <h3>Payment Successful</h3>
              <p>Your trade has been processed successfully.</p>
              
              {paymentMethod === 'cash' ? (
                <div className="meetup-info">
                  <h4>📍 Meetup Details</h4>
                  <p>Coordinate with @{trade.seller} to arrange a safe meetup location.</p>
                  <button className="btn-primary">Message Seller</button>
                </div>
              ) : (
                <div className="shipping-info">
                  <h4>📦 Tracking Info</h4>
                  <p>Seller will provide tracking details once shipped.</p>
                  <button className="btn-primary">View Order</button>
                </div>
              )}
              
              <a href="/trading" className="back-link">← Back to Trading</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
