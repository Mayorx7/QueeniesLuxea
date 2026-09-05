import ProductCard from "../../components/ProductCard";
import type { Product } from "../../types";

interface RecommendedProductsProps {
  products: Product[];
}

export default function RecommendedProducts({ products }: RecommendedProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="mb-6 font-display text-xl text-ink">You May Also Like</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
        {products.map((product) => (
          <div key={product.id} className="w-[240px] shrink-0 sm:w-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
