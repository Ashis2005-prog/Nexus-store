import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../hooks/useApi';
import styles from './CartPage.module.css';

export default function CartPage() {
  const { cart, removeFromCart, updateQty, clearCart, cartTotal, tax, shipping, grandTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]       = useState('cart'); // cart | checkout | success
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [address, setAddress] = useState({ street: '123 Main St', city: 'New York', state: 'NY', zip: '10001' });
  const [orderId, setOrderId] = useState('');

  const handlePlaceOrder = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/orders', {
        items: cart.map(i => ({ product: i._id, qty: i.qty })),
        shippingAddress: address,
        paymentMethod: 'Card',
      });
      setOrderId(data._id);
      clearCart();
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') return (
    <div className={styles.successPage}>
      <div className={styles.successCard}>
        <div className={styles.successIcon}>🎉</div>
        <h2>Order Placed!</h2>
        <p>Your order <strong>{orderId}</strong> has been confirmed.</p>
        <div className={styles.successActions}>
          <button className={styles.primaryBtn} onClick={() => navigate('/orders')}>View My Orders</button>
          <button className={styles.secondaryBtn} onClick={() => navigate('/')}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );

  if (cart.length === 0) return (
    <div className={styles.emptyPage}>
      <div style={{ fontSize: 64 }}>🛒</div>
      <h2>Your cart is empty</h2>
      <p>Add some products to get started.</p>
      <Link to="/" className={styles.primaryBtn}>Browse Products</Link>
    </div>
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>
        {step === 'cart' ? 'Shopping Cart' : 'Checkout'}
        <span className={styles.stepIndicator}>
          <span className={step === 'cart' ? styles.stepActive : styles.stepDone}>1 Cart</span>
          <span className={styles.stepArrow}>→</span>
          <span className={step === 'checkout' ? styles.stepActive : step === 'success' ? styles.stepDone : styles.stepInactive}>2 Checkout</span>
        </span>
      </h1>

      <div className={styles.layout}>
        <div className={styles.main}>
          {step === 'cart' && (
            <div className={styles.itemsList}>
              {cart.map(item => (
                <div key={item._id} className={styles.item}>
                  <div className={styles.itemEmoji}>{item.image}</div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemPrice}>${item.price.toLocaleString()} each</div>
                  </div>
                  <div className={styles.qtyControl}>
                    <button onClick={() => item.qty === 1 ? removeFromCart(item._id) : updateQty(item._id, item.qty - 1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
                  </div>
                  <div className={styles.itemTotal}>${(item.price * item.qty).toLocaleString()}</div>
                  <button className={styles.removeBtn} onClick={() => removeFromCart(item._id)}>✕</button>
                </div>
              ))}
            </div>
          )}

          {step === 'checkout' && (
            <div className={styles.checkoutForm}>
              <h3>Shipping Address</h3>
              <div className={styles.formGrid}>
                {[['street','Street Address'],['city','City'],['state','State'],['zip','ZIP Code']].map(([key, label]) => (
                  <div key={key} className={styles.formField}>
                    <label>{label}</label>
                    <input value={address[key]} onChange={e => setAddress(a => ({ ...a, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <h3 style={{ marginTop: 24 }}>Payment</h3>
              <div className={styles.paymentBox}>
                <span>💳</span>
                <div>
                  <div style={{ fontWeight: 600 }}>Credit / Debit Card</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Secure checkout — demo mode</div>
                </div>
                <span style={{ marginLeft: 'auto', color: 'var(--green)', fontWeight: 700 }}>✓ Selected</span>
              </div>
              {error && <div className={styles.errorMsg}>{error}</div>}
            </div>
          )}
        </div>

        <div className={styles.summary}>
          <h3>Order Summary</h3>
          {cart.map(i => (
            <div key={i._id} className={styles.summaryLine}>
              <span>{i.name} ×{i.qty}</span>
              <span>${(i.price * i.qty).toLocaleString()}</span>
            </div>
          ))}
          <div className={styles.summaryDivider} />
          <div className={styles.summaryLine}><span>Subtotal</span><span>${cartTotal.toLocaleString()}</span></div>
          <div className={styles.summaryLine}><span>Tax (8%)</span><span>${tax}</span></div>
          <div className={styles.summaryLine}>
            <span>Shipping</span>
            <span style={{ color: shipping === 0 ? 'var(--green)' : undefined }}>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
          </div>
          <div className={styles.summaryTotal}><span>Total</span><span>${grandTotal.toLocaleString()}</span></div>

          {step === 'cart' ? (
            <button className={styles.checkoutBtn} onClick={() => setStep('checkout')}>
              Proceed to Checkout →
            </button>
          ) : (
            <>
              <button className={styles.checkoutBtn} onClick={handlePlaceOrder} disabled={loading}>
                {loading ? 'Placing Order...' : '✓ Place Order'}
              </button>
              <button className={styles.backBtn} onClick={() => setStep('cart')}>← Back to Cart</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
