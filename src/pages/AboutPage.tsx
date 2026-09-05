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
              About QueensLuxea
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="eyebrow mb-4 text-gold">Our Philosophy</p>
        <h2 className="font-display text-3xl leading-snug text-ink sm:text-4xl">
          We believe luxury is a decision, not a price tag.
        </h2>
        <div className="mt-8 flex flex-col gap-6 text-base leading-relaxed text-espresso-light">
          <p>
            QueensLuxea began with a simple frustration: most of what calls itself luxury today is
            engineered for a photograph, not a life. We wanted to build the opposite — pieces that
            earn their place in a wardrobe by how they perform on a Tuesday, not just how they look
            in a single, well-lit frame.
          </p>
          <p>
            Every piece in our collection passes through the hands of small workshops and independent
            ateliers who still measure quality in decades, not seasons. We work in limited runs,
            sourcing natural fibers and full-grain leathers, and we say no far more often than we say
            yes.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="order-2 flex flex-col justify-center bg-cream px-5 py-16 sm:px-12 sm:py-20 lg:order-1">
          <p className="eyebrow mb-4 text-gold">Craftsmanship</p>
          <h2 className="font-display text-3xl text-ink">Made slowly, on purpose.</h2>
          <p className="mt-6 text-sm leading-relaxed text-espresso-light">
            Our silk is woven in small mills that have supplied ateliers for generations. Our leather
            goods are cut and stitched by hand, often by the same craftspeople from one season to the
            next. We'd rather ship a collection three weeks later than compromise on either.
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
          <p className="eyebrow mb-4 text-gold">Confidence</p>
          <h2 className="font-display text-3xl text-ink">Dressing for the room you're already in.</h2>
          <p className="mt-6 text-sm leading-relaxed text-espresso-light">
            We don't design for an imagined version of you. We design for the woman who has already
            arrived — at her career, her taste, her sense of self — and simply wants pieces that keep
            pace with her. That's the only brief we work from.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8 sm:py-28">
        <p className="eyebrow mb-4 text-gold">Intentional Luxury</p>
        <h2 className="font-display text-3xl leading-snug text-ink sm:text-4xl">
          Fewer pieces. Chosen with more care. Worn for much longer.
        </h2>
        <p className="mt-6 text-sm leading-relaxed text-espresso-light">
          That's the entire QueensLuxea proposition, distilled. Everything else — the fittings, the
          fabric sourcing, the seasons we skip entirely — exists in service of that one idea.
        </p>
      </section>
    </div>
  );
}
