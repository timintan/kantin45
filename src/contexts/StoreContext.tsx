import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { apiGet, type Product, type Member, type CartItem } from '@/lib/api';

interface StoreContextType {
  products: Product[];
  members: Member[];
  cart: CartItem[];
  loading: boolean;
  loadingText: string;
  loadProducts: () => Promise<void>;
  loadMembers: () => Promise<void>;
  addToCart: (id: number) => void;
  changeQty: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      const data = await apiGet<Product[]>('getProduk');
      setProducts(Array.isArray(data) ? data.filter(p => p.id !== null && p.id !== undefined) : []);
    } catch {
      setProducts([]);
    }
  }, []);

  const loadMembers = useCallback(async () => {
    try {
      const data = await apiGet<Member[]>('getAnggota');
      setMembers(Array.isArray(data) ? data.filter(m => m.id !== null && m.id !== undefined) : []);
    } catch {
      setMembers([]);
    }
  }, []);

  useEffect(() => {
    Promise.all([loadProducts(), loadMembers()]);
  }, [loadProducts, loadMembers]);

  const addToCart = useCallback((id: number) => {
    const p = products.find(x => x.id === id);
    if (!p || p.stok <= 0) return;
    setCart(prev => {
      const existing = prev.find(c => c.id === id);
      if (existing) {
        if (existing.qty >= p.stok) return prev;
        return prev.map(c => c.id === id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...p, qty: 1 }];
    });
  }, [products]);

  const changeQty = useCallback((id: number, delta: number) => {
    setCart(prev => {
      const item = prev.find(c => c.id === id);
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) return prev.filter(c => c.id !== id);
      return prev.map(c => c.id === id ? { ...c, qty: newQty } : c);
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart(prev => prev.filter(c => c.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  return (
    <StoreContext.Provider value={{
      products, members, cart, loading, loadingText,
      loadProducts, loadMembers, addToCart, changeQty, removeFromCart, clearCart, setProducts,
    }}>
      {children}
    </StoreContext.Provider>
  );
}
