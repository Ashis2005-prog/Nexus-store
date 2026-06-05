import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();

  const inCart   = cart.find(i => i._id === product._id);
  const lowStock = product.stock > 0 && product.stock < 10;
  const outOfStock = product.stock === 0;

  const handleAdd = () => {
    if (!user) { navigate('/login'); return; }
    addToCart(product);
  };

  const stars = (rating) => {
    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  };

  return (
    <div className={`${styles.card} animate-fade-up`}>
      <div className={styles.imageArea}>
        <span className={styles.emoji}>{product.image}</span>
        {product.isFeatured && <span className={styles.featuredBadge}>Featured</span>}
        {lowStock && !outOfStock && <span className={styles.stockBadge}>Low Stock</span>}
      </div>

      <div className={styles.body}>
        <div className={styles.category}>{product.category}</div>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.desc}>{product.description}</p>

        <div className={styles.rating}>
          <span className={styles.stars}>{stars(product.rating)}</span>
          <span className={styles.ratingNum}>{product.rating.toFixed(1)}</span>
          <span className={styles.reviews}>({product.numReviews?.toLocaleString()})</span>
        </div>

        <div className={styles.footer}>
          <span className={styles.price}>${product.price.toLocaleString()}</span>
          <span className={`${styles.stock} ${outOfStock ? styles.stockOut : lowStock ? styles.stockLow : styles.stockOk}`}>
            {outOfStock ? '✕ Out of stock' : lowStock ? `⚠ ${product.stock} left` : `✓ ${product.stock} in stock`}
          </span>
        </div>

        <button
          className={`${styles.addBtn} ${inCart ? styles.inCart : ''} ${outOfStock ? styles.disabled : ''}`}
          onClick={handleAdd}
          disabled={outOfStock}
        >
          {outOfStock ? 'Out of Stock' : inCart ? `✓ In Cart (${inCart.qty})` : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
