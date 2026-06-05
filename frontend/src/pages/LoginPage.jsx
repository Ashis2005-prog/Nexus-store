import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) navigate(from, { replace: true });
    else setError(result.message);
  };

  const fillDemo = (role) => {
    if (role === 'admin') { setEmail('admin@nexus.dev'); setPassword('admin123'); }
    else                  { setEmail('user@nexus.dev');  setPassword('user123'); }
    setError('');
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} animate-fade-up`}>
        <div className={styles.header}>
          <div className={styles.icon}>⚡</div>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to your Nexus Store account</p>
        </div>
        <div className={styles.demoBtns}>
          <button className={styles.demoUser}  onClick={() => fillDemo('user')}>👤 Demo User</button>
          <button className={styles.demoAdmin} onClick={() => fillDemo('admin')}>🔑 Demo Admin</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
        <p className={styles.switchLink}>
          No account? <Link to="/register">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
