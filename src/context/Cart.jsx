import { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext();
export const useCart = () => useContext(Ctx);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => { try { const x = JSON.parse(localStorage.getItem('shifa_cart') || '[]'); return Array.isArray(x) ? x : []; } catch { return []; } });
  useEffect(() => localStorage.setItem('shifa_cart', JSON.stringify(items)), [items]);

  const add = (p, qty = 1) =>
    setItems((cur) => {
      const old = cur.find((x) => x.id === p.id);
      const q = Math.min((old?.qty || 0) + qty, p.stock);
      if (old) return cur.map((x) => (x.id === p.id ? { ...x, qty: q, stock: p.stock } : x));
      const { id, name, nameAr, price, image, rx, stock } = p;
      return [...cur, { id, name, nameAr, price, image, rx, stock, qty: q }];
    });
  const setQty = (id, q) =>
    setItems((cur) => cur.map((x) => (x.id === id ? { ...x, qty: Math.max(1, Math.min(q, x.stock)) } : x)));
  const remove = (id) => setItems((cur) => cur.filter((x) => x.id !== id));
  const clear = () => setItems([]);
  const total = items.reduce((s, x) => s + x.price * x.qty, 0);
  const count = items.reduce((s, x) => s + x.qty, 0);
  return <Ctx.Provider value={{ items, add, setQty, remove, clear, total, count }}>{children}</Ctx.Provider>;
}
