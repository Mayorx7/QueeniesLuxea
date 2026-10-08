import { createContext, useContext, useMemo, useEffect, useRef, useState, type ReactNode } from "react";
import type { Product } from "../types";
import { PRODUCTS } from "../data/products";
import { useProductListing } from "../hooks/useProductListing";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";

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
  const { user } = useAuth();
  const { showToast } = useToast();
  // We use useProductListing instead of just static PRODUCTS so it includes live products
  const { products: allProducts } = useProductListing();

  // Local storage fallback for guests
  const [localIds, setLocalIds] = useLocalStorage<string[]>("ql_wishlist_guest", []);
  
  // State for authenticated users
  const [dbIds, setDbIds] = useState<string[]>([]);
  
  const productIds = user ? dbIds : localIds;

  // Keep a ref of localIds so we can read the latest value inside the sync effect
  // without adding it to the dependency array (which would cause an infinite loop)
  const localIdsRef = useRef(localIds);
  useEffect(() => { localIdsRef.current = localIds; }, [localIds]);

  // 1. On login, sync guest wishlist to DB, then fetch all from DB
  useEffect(() => {
    if (!user || !supabase) {
      setDbIds([]);
      return;
    }

    const syncAndFetch = async () => {
      try {
        // If they had items in local guest cart, push them to DB, then clear local
        const currentLocalIds = localIdsRef.current;
        if (currentLocalIds.length > 0) {
          const insertPayload = currentLocalIds.map((id) => ({
            user_id: user.id,
            product_id: id,
          }));
          // We use upsert or just ignore duplicates
          await supabase.from("wishlists").upsert(insertPayload, { onConflict: "user_id, product_id" }).select();
          setLocalIds([]); // clear guest cart
        }

        // Fetch user's wishlist from DB
        const { data, error } = await supabase
          .from("wishlists")
          .select("product_id")
          .eq("user_id", user.id);

        if (!error && data) {
          setDbIds(data.map((row) => row.product_id));
        }
      } catch (err) {
        console.error("Error syncing wishlist:", err);
      }
    };

    syncAndFetch();
  }, [user, setLocalIds]); // ✅ localIds removed — read via ref to prevent infinite loop

  const isWishlisted = (productId: string) => productIds.includes(productId);

  const toggleWishlist = async (product: Product) => {
    const isSaved = isWishlisted(product.id);
    const newIds = isSaved ? productIds.filter(id => id !== product.id) : [...productIds, product.id];

    // Optimistic UI Update
    if (user) {
      setDbIds(newIds);
    } else {
      setLocalIds(newIds);
    }

    showToast(isSaved ? `Removed ${product.name} from wishlist` : `Saved ${product.name} to wishlist`);

    // Persist to DB if logged in
    if (user && supabase) {
      try {
        if (isSaved) {
          await supabase.from("wishlists").delete().match({ user_id: user.id, product_id: product.id });
        } else {
          await supabase.from("wishlists").insert({ user_id: user.id, product_id: product.id });
        }
      } catch (err) {
        console.error("Wishlist DB update failed:", err);
        // Rollback on fail
        setDbIds(productIds);
        showToast("Failed to update wishlist");
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const newIds = productIds.filter((id) => id !== productId);
    
    // Optimistic update
    if (user) {
      setDbIds(newIds);
    } else {
      setLocalIds(newIds);
    }

    if (user && supabase) {
      try {
        await supabase.from("wishlists").delete().match({ user_id: user.id, product_id: productId });
      } catch (err) {
        console.error("Wishlist DB delete failed:", err);
        setDbIds(productIds);
      }
    }
  };

  const products = useMemo(() => {
    return productIds
      .map((id) => allProducts.find((p) => p.id === id))
      .filter((p): p is Product => !!p);
  }, [productIds, allProducts]);

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
