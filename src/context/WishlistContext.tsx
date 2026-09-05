import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Product } from "../types";
import { PRODUCTS } from "../data/products";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useToast } from "./ToastContext";

interface WishlistContextValue {
  productIds: string[];
  products: Product[];
  count: number;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [productIds, setProductIds] = useLocalStorage<string[]>("ql_wishlist", []);
  const { showToast } = useToast();

  const isWishlisted = (productId: string) => productIds.includes(productId);

  const toggleWishlist = (product: Product) => {
    setProductIds((prev) => {
      if (prev.includes(product.id)) {
        showToast(`Removed ${product.name} from wishlist`);
        return prev.filter((id) => id !== product.id);
      }
      showToast(`Saved ${product.name} to wishlist`);
      return [...prev, product.id];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setProductIds((prev) => prev.filter((id) => id !== productId));
  };

  const products = useMemo(
    () => productIds.map((id) => PRODUCTS.find((p) => p.id === id)).filter((p): p is Product => !!p),
    [productIds]
  );

  return (
    <WishlistContext.Provider
      value={{ productIds, products, count: productIds.length, isWishlisted, toggleWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
