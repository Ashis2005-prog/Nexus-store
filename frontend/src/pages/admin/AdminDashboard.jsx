import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../hooks/useApi';
import styles from './Admin.module.css';

const STATUS_COLORS = { Processing:'var(--blue)',Confirmed:'var(--blue)',Shipped:'var(--amber)',Delivered:'var(--green)',Cancelled:'var(--red)' };

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [orders, setOrders]   = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/orders?limit=5'),
      api.get('/products?limit=100'),
    ]).then(([ordersRes, productsRes]) => {
      const allOrders = ordersRes.data.orders;
      const allProducts = productsRes.data.products;
      setOrders(allOrders);
      setProducts(allProducts);
      setStats({
        revenue: allOrders.filter(o=>o.status!=='Cancelled').reduce((s,o)=>s+o.totalPrice,0),
        orders:  ordersRes.data.total,
        products: productsRes.data.total,
        lowStock: allProducts.filter(p=>p.stock<10).length,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Loading dashboard…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.adminBadge}>ADMIN PANEL</span>
          <h1 className={styles.pageTitle}>Dashboard</h1>
        </div>
        <div className={styles.headerActions}>
          <Link to="/admin/products" className={styles.actionBtn}>Manage Products</Link>
          <Link to="/admin/orders"   className={styles.actionBtnPrimary}>Manage Orders</Link>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {[
          { label:'Total Revenue',  value:`$${stats.revenue.toLocaleString()}`, icon:'💰', color:'var(--green)',  bg:'var(--green-soft)' },
          { label:'Total Orders',   value:stats.orders,   icon:'📦', color:'var(--blue)',   bg:'var(--blue-soft)'  },
          { label:'Products',       value:stats.products, icon:'🛍️', color:'var(--accent)', bg:'var(--accent-soft)'},
          { label:'Low Stock Items',value:stats.lowStock, icon:'⚠️', color:'var(--amber)',  bg:'rgba(245,158,11,0.1)'},
        ].map(s => (
          <div key={s.label} className={styles.statCard} style={{borderColor:s.color+'33'}}>
            <div className={styles.statIcon} style={{background:s.bg}}>{s.icon}</div>
            <div className={styles.statValue} style={{color:s.color}}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.twoCol}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h3>Recent Orders</h3><Link to="/admin/orders" className={styles.viewAll}>View All →</Link></div>
          {orders.map(o => (
            <div key={o._id} className={styles.row}>
              <div>
                <div className={styles.rowTitle}>#{o._id.slice(-8).toUpperCase()}</div>
                <div className={styles.rowSub}>{o.user?.name || 'Customer'} · {new Date(o.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span className={styles.badge} style={{color:STATUS_COLORS[o.status],borderColor:STATUS_COLORS[o.status]+'44',background:STATUS_COLORS[o.status]+'14'}}>{o.status}</span>
                <span className={styles.rowValue}>${o.totalPrice?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}><h3>Low Stock Alert</h3><Link to="/admin/products" className={styles.viewAll}>Manage →</Link></div>
          {products.filter(p=>p.stock<15).slice(0,6).map(p => (
            <div key={p._id} className={styles.row}>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <span style={{fontSize:24}}>{p.image}</span>
                <div>
                  <div className={styles.rowTitle}>{p.name}</div>
                  <div className={styles.rowSub}>{p.category}</div>
                </div>
              </div>
              <span className={styles.badge} style={{color:p.stock<5?'var(--red)':'var(--amber)',borderColor:(p.stock<5?'var(--red)':'var(--amber)')+'44',background:(p.stock<5?'var(--red)':'var(--amber)')+'14'}}>{p.stock} left</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
