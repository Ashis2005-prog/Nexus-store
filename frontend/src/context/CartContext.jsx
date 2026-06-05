import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const exists = state.find(i => i._id === action.item._id);
      if (exists) {
        return state.map(i =>
          i._id === action.item._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...state, { ...action.item, qty: 1 }];
    }
    case 'REMOVE':
      return state.filter(i => i._id !== action.id);
    case 'UPDATE_QTY':
      return state.map(i =>
        i._id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i
      );
    case 'CLEAR':
      return [];
    case 'LOAD':
      return action.items;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], () => {
    try {
      const saved = localStorage.getItem('nexus_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart     = (item)        => dispatch({ type: 'ADD', item });
  const removeFromCart = (id)         => dispatch({ type: 'REMOVE', id });
  const updateQty     = (id, qty)     => dispatch({ type: 'UPDATE_QTY', id, qty });
  const clearCart     = ()            => dispatch({ type: 'CLEAR' });

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax       = parseFloat((cartTotal * 0.08).toFixed(2));
  const shipping  = cartTotal > 100 ? 0 : 9.99;
  const grandTotal = parseFloat((cartTotal + tax + shipping).toFixed(2));

  return (
    <CartContext.Provider value={{
      cart, cartCount, cartTotal, tax, shipping, grandTotal,
      addToCart, removeFromCart, updateQty, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
