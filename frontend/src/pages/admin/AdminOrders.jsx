import { useState, useEffect } from 'react';
import api from '../../hooks/useApi';
import styles from './Admin.module.css';

const STATUSES = ['Processing','Confirmed','Shipped','Delivered','Cancelled'];
const STATUS_COLORS = { Processing:'var(--blue)',Confirmed:'var(--blue)',Shipped:'var(--amber)',Delivered:'var(--green)',Cancelled:'var(--red)' };

export default function AdminOrders() {
  const [orders, setOrders]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('');
  const [updating, setUpdating] = useState(null);

  const load = (status) => {
    setLoading(true);
    api.get('/orders', { params: status ? { status } : {} })
      .then(({ data }) => { setOrders(data.orders); setTotal(data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const { data } = await api.put(`/orders/${orderId}`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: data.status } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(null); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.adminBadge}>ADMIN PANEL</span>
          <h1 className={styles.pageTitle}>Orders <span style={{color:'var(--text-muted)',fontSize:18}}>({total})</span></h1>
        </div>
      </div>

      <div className={styles.filterRow}>
        {['', ...STATUSES].map(s => (
          <button key={s} className={`${styles.filterBtn} ${filter===s?styles.filterActive:''}`} onClick={()=>setFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <div className={styles.loading}>Loading orders…</div> : (
        <div className={styles.orderTable}>
          <div className={styles.tableHead}>
            <span>Order ID</span><span>Customer</span><span>Items</span><span>Total</span><span>Date</span><span>Status</span>
          </div>
          {orders.map(order => (
            <div key={order._id} className={styles.tableRow}>
              <span className={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</span>
              <span className={styles.customer}>{order.user?.name || '—'}<br/><small>{order.user?.email}</small></span>
              <span className={styles.itemCount}>{order.items.reduce((s,i)=>s+i.qty,0)} item(s)</span>
              <span className={styles.orderTotal}>${order.totalPrice?.toLocaleString()}</span>
              <span className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</span>
              <span>
                <select
                  className={styles.statusSelect}
                  value={order.status}
                  disabled={updating===order._id}
                  onChange={e=>handleStatusChange(order._id, e.target.value)}
                  style={{color:STATUS_COLORS[order.status]}}
                >
                  {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
