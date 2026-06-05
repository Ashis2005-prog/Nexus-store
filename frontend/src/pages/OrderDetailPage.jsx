import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../hooks/useApi';
import styles from './OrderDetailPage.module.css';

const STATUS_STEPS = ['Processing','Confirmed','Shipped','Delivered'];
const STATUS_COLORS = { Processing:'var(--blue)',Confirmed:'var(--blue)',Shipped:'var(--amber)',Delivered:'var(--green)',Cancelled:'var(--red)' };

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data)).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      setOrder(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel order');
    } finally { setCancelling(false); }
  };

  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (!order)  return <div className={styles.loading}>Order not found.</div>;

  const stepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className={styles.page}>
      <Link to="/orders" className={styles.back}>← Back to Orders</Link>
      <div className={styles.header}>
        <div>
          <h1 className={styles.orderId}>Order #{order._id.slice(-8).toUpperCase()}</h1>
          <div className={styles.meta}>{new Date(order.createdAt).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</div>
        </div>
        <span className={styles.statusBadge} style={{color:STATUS_COLORS[order.status],borderColor:STATUS_COLORS[order.status]+'44',background:STATUS_COLORS[order.status]+'14'}}>{order.status}</span>
      </div>

      {order.status !== 'Cancelled' && (
        <div className={styles.tracker}>
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className={styles.trackStep}>
              <div className={`${styles.trackDot} ${i <= stepIdx ? styles.trackDotDone : ''}`}>{i < stepIdx ? '✓' : i + 1}</div>
              <div className={`${styles.trackLabel} ${i === stepIdx ? styles.trackLabelActive : ''}`}>{step}</div>
              {i < STATUS_STEPS.length - 1 && <div className={`${styles.trackLine} ${i < stepIdx ? styles.trackLineDone : ''}`} />}
            </div>
          ))}
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.itemsCard}>
          <h3>Items Ordered</h3>
          {order.items.map((item, i) => (
            <div key={i} className={styles.item}>
              <span className={styles.itemEmoji}>{item.image}</span>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemQty}>Qty: {item.qty}</div>
              </div>
              <div className={styles.itemTotal}>${(item.price * item.qty).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div className={styles.sideCard}>
          <h3>Order Summary</h3>
          <div className={styles.summaryRow}><span>Subtotal</span><span>${order.itemsPrice?.toLocaleString()}</span></div>
          <div className={styles.summaryRow}><span>Tax</span><span>${order.taxPrice}</span></div>
          <div className={styles.summaryRow}><span>Shipping</span><span style={{color:order.shippingPrice===0?'var(--green)':undefined}}>{order.shippingPrice===0?'Free':`$${order.shippingPrice}`}</span></div>
          <div className={styles.summaryTotal}><span>Total</span><span>${order.totalPrice?.toLocaleString()}</span></div>

          <h3 style={{marginTop:20}}>Shipping To</h3>
          <div className={styles.address}>
            {order.shippingAddress?.street}<br/>
            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}
          </div>

          {order.status === 'Processing' && (
            <button className={styles.cancelBtn} onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
