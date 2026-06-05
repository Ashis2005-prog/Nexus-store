import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import styles from './HomePage.module.css';

const CATEGORIES = ['All', 'Electronics', 'Audio', 'Wearables', 'Photography', 'Peripherals'];

export default function HomePage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [sort,     setSort]     = useState('default');
  const [total,    setTotal]    = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api.get('/products', {
      params: { search, category: category !== 'All' ? category : undefined, sort },
      signal: controller.signal,
    })
      .then(({ data }) => { setProducts(data.products); setTotal(data.total); })
      .catch(err => { if (err.name !== 'CanceledError') setError('Failed to load products'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [search, category, sort]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>✦ New Season 2025</span>
          <h1 className={styles.heroTitle}>
            Future-Grade<br />
            <span className={styles.heroAccent}>Tech Essentials</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Curated electronics, audio gear, and wearables for the modern workspace.
          </p>
          {!user && (
            <button className={styles.heroBtn} onClick={() => navigate('/register')}>
              Create Free Account →
            </button>
          )}
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}><span className={styles.statNum}>{total}</span><span className={styles.statLabel}>Products</span></div>
          <div className={styles.statDivider} />
          <div className={styles.stat}><span className={styles.statNum}>5★</span><span className={styles.statLabel}>Avg Rating</span></div>
          <div className={styles.statDivider} />
          <div className={styles.stat}><span className={styles.statNum}>Free</span><span className={styles.statLabel}>Shipping $100+</span></div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.toolbar}>
        <div className={styles.categories}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`${styles.catBtn} ${category === c ? styles.catActive : ''}`}
              onClick={() => setCategory(c)}
            >{c}</button>
          ))}
        </div>
        <div className={styles.controls}>
          <input
            className={styles.searchInput}
            placeholder="🔍  Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="default">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className={styles.resultCount}>{total} product{total !== 1 ? 's' : ''} found</div>

      {/* Grid */}
      {loading ? (
        <div className={`${styles.grid} stagger`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 380 }} />
          ))}
        </div>
      ) : error ? (
        <div className={styles.error}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <p>{error}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Make sure the backend server is running on port 5000.</p>
        </div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <div style={{ fontSize: 48 }}>🔍</div>
          <p>No products match your search.</p>
        </div>
      ) : (
        <div className={`${styles.grid} stagger`}>
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
