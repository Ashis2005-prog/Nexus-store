import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        <span className={styles.logoIcon}>⚡</span>
        <span className={styles.logoText}>NEXUS</span>
        <span className={styles.logoAccent}>STORE</span>
      </Link>

      <div className={styles.links}>
        <Link to="/" className={`${styles.link} ${isActive('/') ? styles.active : ''}`}>
          Store
        </Link>
        {isAdmin && (
          <Link to="/admin" className={`${styles.link} ${location.pathname.startsWith('/admin') ? styles.active : ''}`}>
            Admin
          </Link>
        )}
        {user && !isAdmin && (
          <Link to="/orders" className={`${styles.link} ${isActive('/orders') ? styles.active : ''}`}>
            My Orders
          </Link>
        )}
      </div>

      <div className={styles.actions}>
        {user && (
          <Link to="/cart" className={`${styles.cartBtn} ${cartCount > 0 ? styles.cartActive : ''}`}>
            <span>🛒</span>
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>
        )}

        {user ? (
          <div className={styles.userMenu}>
            <div className={`${styles.avatar} ${isAdmin ? styles.adminAvatar : ''}`}>
              {user.name[0]}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={`${styles.userRole} ${isAdmin ? styles.roleAdmin : styles.roleUser}`}>
                {user.role}
              </span>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
          </div>
        ) : (
          <div className={styles.authButtons}>
            <Link to="/login"    className={styles.signInBtn}>Sign In</Link>
            <Link to="/register" className={styles.registerBtn}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
