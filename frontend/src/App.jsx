import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar           from './components/Navbar';
import { ToastProvider } from './components/Toast';
import HomePage         from './pages/HomePage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import CartPage         from './pages/CartPage';
import OrdersPage       from './pages/OrdersPage';
import OrderDetailPage  from './pages/OrderDetailPage';
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminProducts    from './pages/admin/AdminProducts';
import AdminOrders      from './pages/admin/AdminOrders';
import ProtectedRoute   from './components/ProtectedRoute';

export default function App() {
  const { user } = useAuth();
  return (
    <ToastProvider>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navbar />
        <main>
          <Routes>
            <Route path="/"         element={<HomePage />} />
            <Route path="/login"    element={user ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/cart"       element={<CartPage />} />
              <Route path="/orders"     element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
            </Route>
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/admin"          element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders"   element={<AdminOrders />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}
