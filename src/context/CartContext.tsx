import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import type { CartItem, Product } from "../types";
import { PRODUCTS } from "../data/products";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import { mapDbRow } from "../hooks/useProductListing";

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
  addItem: (product: Product, color: string, size: string, quantity?: number, variantId?: string) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function sameLine(a: CartItem, productId: string, color: string, size: string) {
  return a.productId === productId && a.color === color && a.size === size;
}

/** Static product IDs begin with "p0" — demo data. Anything else is a UUID from Supabase. */
function isStaticId(id: string) {
  return id.startsWith("p0") || id.startsWith("p1");
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useLocalStorage<CartItem[]>(`ql_cart_${user?.id ?? "guest"}`, []);
  const { showToast } = useToast();

  // ── Product cache: maps productId → Product (covers both static and DB products)
  const [productCache, setProductCache] = useLocalStorage<Record<string, Product>>(
    `ql_product_cache_${user?.id ?? "guest"}`,
    {}
  );

  // Track which DB IDs we've already fetched so we don't re-fetch on every render
  const fetchedIdsRef = useRef<Set<string>>(new Set());

  // ── Fetch any DB product IDs that aren't in the cache yet
  useEffect(() => {
    const dbIds = items
      .map((i) => i.productId)
      .filter((id) => !isStaticId(id) && !(id in productCache) && !fetchedIdsRef.current.has(id));

    if (dbIds.length === 0 || !supabase) return;

    dbIds.forEach((id) => fetchedIdsRef.current.add(id));

    void (async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            id, vendor_id, name, slug, description, category, price, compare_at_price,
            sale_enabled, tags, sizes, colors, status, is_featured, created_at, sku,
            product_images ( url, display_order ),
            product_variants ( id, stock )
          `)
          .in("id", dbIds);

        if (error || !data) return;

        const mapped: Record<string, Product> = {};
        for (const row of data as Record<string, unknown>[]) {
          const product = mapDbRow(row);
          mapped[product.id] = product;
        }

        setProductCache((prev) => ({ ...prev, ...mapped }));
      } catch {
        // Silently fail — the line will just not render
      }
    })();
    // Only re-run when item IDs change; productCache intentionally excluded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items.map((i) => i.productId).sort())]);

  const addItem = (product: Product, color: string, size: string, quantity = 1, variantId?: string) => {
    // Ensure the product is always in the cache when added
    if (!isStaticId(product.id)) {
      setProductCache((prev) => ({ ...prev, [product.id]: product }));
      fetchedIdsRef.current.add(product.id);
    }

    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, product.id, color, size));
      if (existing) {
        return prev.map((i) =>
          sameLine(i, product.id, color, size)
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { productId: product.id, quantity, color, size, variantId }];
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
          // Resolve product: static data first, then DB cache
          const product =
            PRODUCTS.find((p) => p.id === item.productId) ??
            productCache[item.productId] ??
            null;
          return product ? { ...item, product } : null;
        })
        .filter((l): l is CartLine => l !== null),
    [items, productCache]
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
