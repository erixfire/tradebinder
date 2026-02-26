import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import './POS.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface CartItem {
  id: number;
  name: string;
  price_php: number;
  quantity: number;
  image_url?: string;
}

export default function POS() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const subtotal = cart.reduce((sum, item) => sum + (item.price_php * item.quantity), 0);
  const tax = subtotal * 0;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/trading/payment');
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="pos-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading POS...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="pos-page">
        <div className="pos-container">
          <div className="pos-left">
            <div className="pos-header">
              <h1>💰 Point of Sale</h1>
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search cards..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="products-grid">
              {filteredInventory.map((item) => (
                <div key={item.id} className="product-card" onClick={() => addToCart(item)}>
                  <div className="product-image">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} loading="lazy" />
                    ) : (
                      <div className="no-image">🃏</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h4>{item.name}</h4>
                    <p className="price">₱{item.price_php.toLocaleString()}</p>
                    <span className="stock">{item.quantity} in stock</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pos-right">
            <div className="cart-header">
              <h2>🛒 Shopping Cart</h2>
              {cart.length > 0 && (
                <button className="clear-cart" onClick={() => setCart([])}>
                  🗑️ Clear
                </button>
              )}
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-icon">🛒</div>
                  <p>Cart is empty</p>
                  <span>Click on cards to add them</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p className="item-price">₱{item.price_php.toLocaleString()}</p>
                    </div>
                    <div className="item-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <span className="quantity">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                        🗑️
                      </button>
                    </div>
                    <div className="item-total">
                      ₱{(item.price_php * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <strong>₱{subtotal.toLocaleString()}</strong>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <strong>₱{total.toLocaleString()}</strong>
              </div>
              <button 
                className="checkout-btn" 
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                💳 Checkout ({cart.length} items)
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
