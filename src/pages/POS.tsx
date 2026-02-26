import { useState, useEffect } from 'react';
import './POS.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface CartItem {
  id: number;
  name: string;
  price_php: number;
  quantity: number;
  condition: string;
}

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [inventory, setInventory] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState(0);

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
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item: any) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c =>
        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price_php * item.quantity), 0);
  const change = amountPaid - total;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    if (paymentMethod === 'cash' && amountPaid < total) {
      alert('Insufficient payment!');
      return;
    }

    alert(`Order completed! Change: ₱${change.toFixed(2)}`);
    setCart([]);
    setAmountPaid(0);
  };

  return (
    <div className="pos-page">
      <header className="page-header">
        <h1>🛒 Point of Sale</h1>
      </header>

      <div className="pos-content">
        <div className="products-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search cards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="products-grid">
            {filteredInventory.slice(0, 20).map((item) => (
              <div key={item.id} className="product-card" onClick={() => addToCart(item)}>
                <h4>{item.name}</h4>
                <p className="type">{item.type_line}</p>
                <div className="product-footer">
                  <span className="price">₱{item.price_php}</span>
                  <span className="stock">Stock: {item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-section">
          <h2>Cart ({cart.length} items)</h2>

          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>₱{item.price_php} × {item.quantity}</p>
                </div>
                <div className="item-controls">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  <button className="remove" onClick={() => removeFromCart(item.id)}>🗑️</button>
                </div>
                <div className="item-total">
                  ₱{(item.price_php * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="empty-cart">
                <div className="empty-icon">🛒</div>
                <p>Cart is empty</p>
              </div>
            )}
          </div>

          <div className="cart-total">
            <div className="total-row">
              <span>Subtotal:</span>
              <strong>₱{total.toLocaleString()}</strong>
            </div>
            <div className="total-row main">
              <span>Total:</span>
              <strong>₱{total.toLocaleString()}</strong>
            </div>
          </div>

          <div className="payment-section">
            <div className="payment-method">
              <label>Payment Method:</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="gcash">GCash</option>
                <option value="card">Card</option>
              </select>
            </div>

            {paymentMethod === 'cash' && (
              <div className="cash-payment">
                <label>Amount Paid:</label>
                <input
                  type="number"
                  value={amountPaid || ''}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
                {amountPaid > 0 && (
                  <div className="change">
                    Change: <strong>₱{change.toFixed(2)}</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="checkout-btn" onClick={handleCheckout}>
            Complete Sale
          </button>
        </div>
      </div>

      <a href="/dashboard" className="back-link">← Back to Dashboard</a>
    </div>
  );
}
