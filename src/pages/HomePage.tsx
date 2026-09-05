import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SmartImage from "../components/SmartImage";
import SectionHeading from "../components/SectionHeading";
import ProductGrid from "../components/ProductGrid";
import HorizontalProductScroll from "../components/HorizontalProductScroll";
import MobileSearchBar from "../components/MobileSearchBar";
import MobilePromoBanner from "../components/MobilePromoBanner";
import MobileCategoryScroll from "../components/MobileCategoryScroll";
import NewsletterForm from "../components/NewsletterForm";
import { CATEGORIES, PRODUCTS } from "../data/products";
import { img } from "../utils/image";

export default function HomePage() {
  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 8);
  const featured = PRODUCTS.filter((p) => p.isFeatured).slice(0, 8);
  const bestSellers = PRODUCTS.filter((p) => p.rating >= 4.7).slice(0, 6);

  return (
    <div>
      {/* ── MOBILE SEARCH BAR ─────────────────────────────────────── */}
      <MobileSearchBar />

      {/* ── MOBILE PROMO BANNER ───────────────────────────────────── */}
      <MobilePromoBanner />

      {/* ── MOBILE CATEGORY SCROLL ────────────────────────────────── */}
      <MobileCategoryScroll />

      {/* ── HERO (desktop-primary, reduced on mobile) ─────────────── */}
      <section className="relative flex h-[48vh] min-h-[340px] items-end overflow-hidden bg-[var(--color-ink)] md:h-[92vh] md:min-h-[560px]">
        <video
          src="/scene-h.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/85 via-[var(--color-ink)]/20 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8 sm:pb-24">
          <p className="eyebrow fade-in mb-3 text-[var(--color-gold-light)] md:mb-4">
            Fall Collection, 2026
          </p>
          <h1 className="fade-in font-display leading-[1.05] text-[var(--color-ivory)] text-3xl max-w-xs sm:text-5xl sm:max-w-lg md:text-6xl lg:text-7xl md:max-w-xl">
            Made for Her Moment
          </h1>
          <p
            className="fade-in mt-4 max-w-xs text-sm leading-relaxed text-[var(--color-ivory)]/85 md:mt-6 md:max-w-md md:text-base"
            style={{ animationDelay: "0.1s" }}
          >
            Curated essentials for the woman who enters every room with intention.
          </p>
          <div className="fade-in mt-6 flex flex-wrap gap-3 md:mt-9 md:gap-4" style={{ animationDelay: "0.2s" }}>
            <Link
              to="/shop?filter=new"
              className="bg-[var(--color-ivory)] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-ivory)] md:px-7 md:py-4"
            >
              Shop New Arrivals
            </Link>
            <Link
              to="/lookbook"
              className="hidden border border-[var(--color-ivory)]/60 px-7 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-ivory)] transition-colors hover:border-[var(--color-ivory)] hover:bg-[var(--color-ivory)]/10 md:inline-flex"
            >
              Explore the Collection
            </Link>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ──────────────────────────────────────────── */}
      {/*  Mobile: horizontal scroll strip | Desktop: 4-col grid     */}
      <section className="py-8 md:mx-auto md:max-w-7xl md:px-8 md:py-16">
        <HorizontalProductScroll
          products={newArrivals}
          eyebrow="Just In"
          title="New Arrivals"
          viewAllHref="/shop?filter=new"
          desktopColumns={4}
        />
      </section>

      {/* ── FEATURED CATEGORIES ───────────────────────────────────── */}
      {/*  Mobile: hidden — category scroll handles this on mobile    */}
      {/*  Desktop: 4-col image grid                                  */}
      <section
        id="collections"
        className="hidden mx-auto max-w-7xl px-8 py-20 md:block md:py-28"
      >
        <SectionHeading eyebrow="Shop by Category" title="Where to Begin" align="center" />
        <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link key={cat.name} to={`/shop/${cat.name}`} className="group relative block overflow-hidden">
              <div className="aspect-[3/4] overflow-hidden bg-[var(--color-cream)]">
                <SmartImage
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-[var(--color-ivory)]">
                <h3 className="font-display text-xl">{cat.name}</h3>
                <p className="mt-1 text-xs text-[var(--color-ivory)]/80">{cat.blurb}</p>
                <span className="eyebrow link-underline mt-3 inline-flex items-center gap-1.5 text-[0.68rem] text-[var(--color-gold-light)]">
                  Shop now <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── MOBILE CATEGORY TILES ─────────────────────────────────── */}
      {/*  Visible only on mobile — compact scrollable category tiles */}
      <section className="px-4 pb-6 md:hidden">
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/shop/${cat.name}`}
              className="group relative block overflow-hidden rounded-xl"
            >
              <div className="aspect-[3/2] overflow-hidden bg-[var(--color-cream)]">
                <SmartImage
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-[var(--color-ink)]/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-3">
                <h3 className="font-display text-sm text-[var(--color-ivory)]">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── BEST SELLERS ──────────────────────────────────────────── */}
      <section className="py-8 md:mx-auto md:max-w-7xl md:px-8 md:py-16">
        <HorizontalProductScroll
          products={bestSellers}
          eyebrow="Most Loved"
          title="Best Sellers"
          viewAllHref="/shop"
          desktopColumns={3}
        />
      </section>

      {/* ── BRAND STATEMENT ───────────────────────────────────────── */}
      <section className="bg-[var(--color-cream)] py-16 sm:py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
          <h2 className="font-display text-2xl leading-snug text-[var(--color-ink)] sm:text-3xl md:text-4xl">
            "Luxury is not what you wear. It is how you feel when you do."
          </h2>
          <p className="mt-5 text-sm text-[var(--color-espresso-light)]">— The QueenLuxea Atelier</p>
        </div>
      </section>

      {/* ── LOOKBOOK BANNER ───────────────────────────────────────── */}
      <section className="relative flex h-[50vh] min-h-[280px] items-center overflow-hidden bg-[var(--color-ink)] md:h-[70vh] md:min-h-[420px]">
        <SmartImage
          src={img("photo-1566174053879-31528523f8ae", 1800)}
          alt="Editorial fashion photograph from the QueenLuxea seasonal lookbook"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-[var(--color-ink)]/40" />
        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
          <p className="eyebrow mb-3 text-[var(--color-gold-light)]">Seasonal Edit</p>
          <h2 className="max-w-xs font-display text-3xl text-[var(--color-ivory)] sm:max-w-md sm:text-4xl md:text-5xl">
            The QueenLuxea Edit
          </h2>
          <Link
            to="/lookbook"
            className="eyebrow link-underline mt-6 inline-flex items-center gap-2 text-[var(--color-ivory)] md:mt-8"
          >
            View the Lookbook <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS (desktop full grid) ─────────────────── */}
      <section className="hidden md:mx-auto md:block md:max-w-7xl md:px-8 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <SectionHeading eyebrow="Curated For You" title="Featured Picks" />
          <Link to="/shop" className="eyebrow link-underline text-[var(--color-espresso)]">
            View all
          </Link>
        </div>
        <ProductGrid products={featured} columns={4} />
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────────── */}
      <section className="mx-auto flex max-w-2xl flex-col items-center px-5 py-16 text-center sm:px-8 sm:py-24">
        <p className="eyebrow mb-3 text-[var(--color-gold)]">Join the List</p>
        <h2 className="font-display text-2xl text-[var(--color-ink)] sm:text-3xl">
          First word on new arrivals
        </h2>
        <p className="mt-4 max-w-sm text-sm text-[var(--color-espresso-light)]">
          Private previews, early access, and the occasional note from the atelier. No noise.
        </p>
        <div className="mt-8 flex justify-center">
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
