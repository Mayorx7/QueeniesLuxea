import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { CartItem, Product } from "../types";
import { PRODUCTS } from "../data/products";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useToast } from "./ToastContext";

const FREE_SHIPPING_THRESHOLD = 150;
const STANDARD_SHIPPING = 14;

interface CartLine extends CartItem {
  product: Product;
}

interface CartContextValue {
  items: CartItem[];
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  addItem: (product: Product, color: string, size: string, quantity?: number) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function sameLine(a: CartItem, productId: string, color: string, size: string) {
  return a.productId === productId && a.color === color && a.size === size;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>("ql_cart", []);
  const { showToast } = useToast();

  const addItem = (product: Product, color: string, size: string, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, product.id, color, size));
      if (existing) {
        return prev.map((i) =>
          sameLine(i, product.id, color, size)
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { productId: product.id, quantity, color, size }];
    });
    showToast(`Added ${product.name} to your bag`);
  };

  const removeItem = (productId: string, color: string, size: string) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, productId, color, size)));
  };

  const updateQuantity = (productId: string, color: string, size: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId, color, size);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (sameLine(i, productId, color, size) ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const lines: CartLine[] = useMemo(
    () =>
      items
        .map((item) => {
          const product = PRODUCTS.find((p) => p.id === item.productId);
          return product ? { ...item, product } : null;
        })
        .filter((l): l is CartLine => l !== null),
    [items]
  );

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0),
    [lines]
  );

  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const total = subtotal + shipping;

  return (
    <CartContext.Provider
      value={{ items, lines, itemCount, subtotal, shipping, total, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export { FREE_SHIPPING_THRESHOLD };
