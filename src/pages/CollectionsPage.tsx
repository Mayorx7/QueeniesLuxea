import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import SectionHeading from "../components/SectionHeading";
import ProductCard from "../components/ProductCard";
import { PRODUCTS } from "../data/products";

interface Collection {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  shopLink: string;
  accent: string;
}

const COLLECTIONS: Collection[] = [
  {
    id: "new-season",
    name: "New Season",
    tagline: "Autumn / Winter",
    description:
      "The new season arrives quietly — deep wools, burnished silks, and the colours of turned earth. Pieces built for a wardrobe that ages well.",
    tags: ["new"],
    shopLink: "/shop?filter=new",
    accent: "Champagne",
  },
  {
    id: "signature",
    name: "Signature",
    tagline: "The Permanent Collection",
    description:
      "Timeless silhouettes that return each season without apology. The column gown, the structured blazer, the wrap dress — refined and reissued.",
    tags: ["silk", "gown"],
    shopLink: "/shop",
    accent: "Ivory",
  },
  {
    id: "evening",
    name: "Evening",
    tagline: "Dressed for the Occasion",
    description:
      "For dinners that extend past midnight and occasions that warrant something extraordinary. Every piece considered for both presence and movement.",
    tags: ["evening"],
    shopLink: "/shop/Dresses",
    accent: "Espresso",
  },
  {
    id: "essentials",
    name: "Essentials",
    tagline: "The Foundation Wardrobe",
    description:
      "The pieces you reach for every week. Refined basics in elevated fabrics — structured, quiet, considered.",
    tags: ["daywear"],
    shopLink: "/shop/Tops",
    accent: "Cream",
  },
  {
    id: "accessories",
    name: "Accessories",
    tagline: "The Finishing Touch",
    description:
      "Jewellery, handbags, and accessories that complete rather than compete. Each piece selected for longevity over trend.",
    tags: ["accessories"],
    shopLink: "/shop/Accessories",
    accent: "Gold",
  },
];

function getCollectionProducts(tags: string[], limit: number = 3) {
  const scored = PRODUCTS.filter(
    (p) => p.inStock && (tags.includes("new") ? p.isNew : p.tags.some((t) => tags.includes(t)))
  );
  // Fallback to featured if not enough
  const result = scored.length >= limit
    ? scored
    : [...scored, ...PRODUCTS.filter((p) => p.isFeatured && !scored.includes(p))];
  return result.slice(0, limit);
}

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Collections" }]} />

      <div className="mb-16 max-w-2xl">
        <SectionHeading
          eyebrow="QueensLuxea Collections"
          title="Curated with Intention"
        />
        <p className="mt-4 text-sm leading-relaxed text-espresso-light">
          Each collection is assembled around a mood, a moment, or a way of dressing —
          not a season. Browse by what speaks to you.
        </p>
      </div>

      <div className="flex flex-col gap-24">
        {COLLECTIONS.map((col, i) => {
          const products = getCollectionProducts(col.tags);
          const isReversed = i % 2 !== 0;

          return (
            <section
              key={col.id}
              id={col.id}
              aria-labelledby={`col-heading-${col.id}`}
              className={`flex flex-col gap-10 lg:flex-row lg:items-start ${isReversed ? "lg:flex-row-reverse" : ""}`}
            >
              {/* Editorial text block */}
              <div className="flex-shrink-0 lg:w-72 xl:w-80">
                <p className="eyebrow mb-2 text-gold">{col.tagline}</p>
                <h2
                  id={`col-heading-${col.id}`}
                  className="font-display text-4xl text-ink sm:text-5xl"
                >
                  {col.name}
                </h2>
                <p className="mt-5 text-sm leading-relaxed text-espresso-light">
                  {col.description}
                </p>
                <Link
                  to={col.shopLink}
                  className="eyebrow mt-8 inline-flex items-center gap-2 link-underline text-espresso hover:text-gold"
                >
                  Shop {col.name}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>

              {/* Product cards */}
              <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Newsletter strip */}
      <div className="mt-24 border border-line bg-cream px-6 py-10 text-center sm:px-12">
        <p className="eyebrow mb-3 text-gold">Private Previews</p>
        <p className="font-display text-3xl text-ink">
          Be first to see new collections
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-espresso-light">
          Join the QueensLuxea list for early access, curated edits, and invitations to exclusive events.
        </p>
        <Link
          to="/shop"
          className="eyebrow mt-8 inline-block bg-ink px-10 py-4 text-ivory transition-colors hover:bg-espresso"
        >
          Shop All Collections
        </Link>
      </div>
    </div>
  );
}
