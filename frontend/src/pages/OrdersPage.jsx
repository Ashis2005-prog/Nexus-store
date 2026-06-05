import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../hooks/useApi';
import styles from './OrdersPage.module.css';

const STATUS_COLORS = { Processing:'var(--blue)', Confirmed:'var(--blue)', Shipped:'var(--amber)', Delivered:'var(--green)', Cancelled:'var(--red)' };

export default function OrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/mine')
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}><div className="skeleton" style={{width:400,height:80}} /></div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Orders</h1>
      {orders.length === 0 ? (
        <div className={styles.empty}>
          <div style={{fontSize:48}}>📦</div>
          <p>No orders yet.</p>
          <Link to="/" className={styles.shopBtn}>Start Shopping</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map(order => (
            <Link to={`/orders/${order._id}`} key={order._id} className={styles.orderCard}>
              <div className={styles.orderTop}>
                <div>
                  <div className={styles.orderId}>{order._id.slice(-8).toUpperCase()}</div>
                  <div className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <span className={styles.statusBadge} style={{color:STATUS_COLORS[order.status],borderColor:STATUS_COLORS[order.status]+'44',background:STATUS_COLORS[order.status]+'14'}}>{order.status}</span>
                  <span className={styles.total}>${order.totalPrice?.toLocaleString()}</span>
                </div>
              </div>
              <div className={styles.items}>
                {order.items.map((item,i) => (
                  <span key={i} className={styles.itemChip}>{item.image} {item.name} ×{item.qty}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
