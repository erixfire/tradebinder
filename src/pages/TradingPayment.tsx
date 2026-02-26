import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import './TradingPayment.css';

interface CartItem {
  id: number;
  name: string;
  price_php: number;
  quantity: number;
}

export default function TradingPayment() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash' | 'card'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      navigate('/pos');
    }
  }, [navigate]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price_php * item.quantity), 0);
  const total = subtotal;
  const change = cashReceived ? parseFloat(cashReceived) - total : 0;

  const handlePayment = async () => {
    if (paymentMethod === 'cash' && change < 0) {
      alert('Insufficient cash received!');
      return;
    }

    setProcessing(true);
    
    setTimeout(() => {
      alert(`✅ Payment successful!\nMethod: ${paymentMethod.toUpperCase()}\nTotal: ₱${total.toLocaleString()}`);
      localStorage.removeItem('cart');
      navigate('/pos');
    }, 1500);
  };

  if (cart.length === 0) {
    return (
      <>
        <Navigation />
        <div className="payment-page">
          <div className="empty-state">
            <p>No items to checkout</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-left">
            <h1>💳 Payment</h1>
            
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="order-items">
                {cart.map((item) => (
                  <div key={item.id} className="order-item">
                    <div>
                      <p className="item-name">{item.name}</p>
                      <p className="item-qty">Qty: {item.quantity}</p>
                    </div>
                    <p className="item-price">₱{(item.price_php * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              
              <div className="order-total">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <strong>₱{subtotal.toLocaleString()}</strong>
                </div>
                <div className="total-row grand-total">
                  <span>Total:</span>
                  <strong>₱{total.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="payment-right">
            <h2>Payment Method</h2>
            
            <div className="payment-methods">
              <button
                className={`payment-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <span className="method-icon">💵</span>
                Cash
              </button>
              <button
                className={`payment-btn ${paymentMethod === 'gcash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('gcash')}
              >
                <span className="method-icon">📱</span>
                GCash
              </button>
              <button
                className={`payment-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <span className="method-icon">💳</span>
                Card
              </button>
            </div>

            {paymentMethod === 'cash' && (
              <div className="cash-input">
                <label>Cash Received</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  autoFocus
                />
                {cashReceived && (
                  <div className="change-display">
                    <span>Change:</span>
                    <strong className={change >= 0 ? 'positive' : 'negative'}>
                      ₱{Math.abs(change).toLocaleString()}
                    </strong>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'gcash' && (
              <div className="gcash-info">
                <p>📱 Scan QR code or enter GCash number</p>
                <div className="qr-placeholder">
                  <div className="qr-code">👁️</div>
                  <p>GCash QR Code</p>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="card-info">
                <p>💳 Swipe or insert card</p>
                <div className="card-placeholder">
                  <div className="card-icon">💳</div>
                  <p>Waiting for card...</p>
                </div>
              </div>
            )}

            <button
              className="complete-btn"
              onClick={handlePayment}
              disabled={processing || (paymentMethod === 'cash' && change < 0)}
            >
              {processing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>✅ Complete Payment</>
              )}
            </button>

            <button className="cancel-btn" onClick={() => navigate('/pos')}>
              ← Back to POS
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
