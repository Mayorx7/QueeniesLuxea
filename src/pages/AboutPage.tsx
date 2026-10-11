import SmartImage from "../components/SmartImage";
import Breadcrumbs from "../components/Breadcrumbs";
import { img } from "../utils/image";

export default function AboutPage() {
  return (
    <div>
      <section className="relative flex h-[60vh] min-h-[380px] items-end overflow-hidden bg-ink">
        <SmartImage
          src={img("photo-1470309864661-68328b2cd0a5", 1800)}
          alt="Portrait study for the QueensLuxea about page"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
        <div className="relative w-full px-5 pb-14 sm:px-8 sm:pb-20">
          <div className="mx-auto max-w-7xl">
            <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "About" }]} />
            <h1 className="mt-2 max-w-lg font-display text-4xl text-ivory sm:text-5xl">
              About Queenie's Luxea
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="eyebrow mb-4 text-gold">Queenie's Luxea Online Store</p>
        <h2 className="font-display text-3xl leading-snug text-ink sm:text-4xl">
          Nigerian-made fashion for every occasion.
        </h2>
        <div className="mt-8 flex flex-col gap-6 text-base leading-relaxed text-espresso-light">
          <p>
            Queenie's Luxea offers Nigerian-made clothing, luxury dresses, tote bags, gowns, and
            crop tops made with quality materials.
          </p>
          <p>
            We keep our prices fixed and non-negotiable so every customer gets clear, consistent
            pricing when shopping with us.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="order-2 flex flex-col justify-center bg-cream px-5 py-16 sm:px-12 sm:py-20 lg:order-1">
          <p className="eyebrow mb-4 text-gold">What We Offer</p>
          <h2 className="font-display text-3xl text-ink">Quality pieces you will love to wear.</h2>
          <p className="mt-6 text-sm leading-relaxed text-espresso-light">
            Explore gowns, crop tops, luxury dresses, tote bags, and more Nigerian-made clothing.
            Every item is selected with quality materials in mind.
          </p>
        </div>
        <div className="order-1 aspect-[4/3] overflow-hidden bg-ink lg:order-2 lg:aspect-auto">
          <SmartImage
            src={img("photo-1509631179647-0177331693ae", 1200)}
            alt="Detail of hand-finished garment construction"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="aspect-[4/3] overflow-hidden bg-ink lg:aspect-auto">
          <SmartImage
            src={img("photo-1584917865442-de89df76afd3", 1200)}
            alt="A QueensLuxea handbag resting on a studio surface"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center px-5 py-16 sm:px-12 sm:py-20">
          <p className="eyebrow mb-4 text-gold">Delivery & Pickup</p>
          <h2 className="font-display text-3xl text-ink">Available on Sundays only.</h2>
          <p className="mt-6 text-sm leading-relaxed text-espresso-light">
            Delivery and pickup are available on Sundays only. Immediate pickup or delivery is not
            available. We serve customers from Abraka, Delta State and Lagos State.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8 sm:py-28">
        <p className="eyebrow mb-4 text-gold">Shop With Confidence</p>
        <h2 className="font-display text-3xl leading-snug text-ink sm:text-4xl">
          Fixed prices. No refunds. No scams.
        </h2>
        <p className="mt-6 text-sm leading-relaxed text-espresso-light">
          Please review your order carefully before making payment. We are here to help with any
          product or delivery questions before you place your order.
        </p>
      </section>
    </div>
  );
}
