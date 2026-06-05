import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', top: 80, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const colors = { success: 'var(--green)', error: 'var(--red)', info: 'var(--blue)', warning: 'var(--amber)' };
  const icons  = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const color  = colors[toast.type] || colors.success;

  return (
    <div className="animate-slide-in" style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--surface-high)',
      border: `1px solid ${color}44`,
      borderLeft: `3px solid ${color}`,
      padding: '12px 16px', borderRadius: 10,
      color: 'var(--text)', fontSize: 14, maxWidth: 340,
      boxShadow: 'var(--shadow)', cursor: 'pointer',
    }} onClick={onClose}>
      <span style={{ color, fontWeight: 700, fontSize: 16 }}>{icons[toast.type]}</span>
      <span>{toast.msg}</span>
    </div>
  );
}

export const useToast = () => useContext(ToastContext);

// Standalone Toast renderer (used in App.jsx via ToastProvider wrapping)
export default function Toast() { return null; }
