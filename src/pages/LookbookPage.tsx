import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SmartImage from "../components/SmartImage";
import { getProductBySlug } from "../data/products";
import { img } from "../utils/image";
import { formatPrice } from "../utils/format";

function ShopTheLook({ slug }: { slug: string }) {
  const product = getProductBySlug(slug);
  if (!product) return null;
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group inline-flex items-center gap-3 border border-espresso/25 bg-ivory/90 px-4 py-3 backdrop-blur transition-colors hover:border-espresso"
    >
      <div className="h-12 w-10 shrink-0 overflow-hidden bg-cream">
        <SmartImage src={product.images[0]} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="text-left">
        <p className="text-xs font-semibold text-ink">{product.name}</p>
        <p className="text-xs text-espresso-light">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

export default function LookbookPage() {
  return (
    <div>
      {/* Opening editorial spread */}
      <section className="relative flex h-[85vh] min-h-[520px] items-end overflow-hidden bg-ink">
        <SmartImage
          src={img("photo-1490481651871-ab68de25d43d", 1800)}
          alt="A woman in a silk gown, captured mid-stride for the QueensLuxea Fall lookbook"
          className="absolute inset-0 h-full w-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
        <div className="relative px-5 pb-16 sm:px-8 sm:pb-24">
          <p className="eyebrow mb-3 text-gold-light">Fall Collection, 2026</p>
          <h1 className="max-w-lg font-display text-5xl leading-[1.05] text-ivory sm:text-6xl">
            The Quiet Room
          </h1>
          <p className="mt-5 max-w-md text-sm text-ivory/80">
            A collection built around stillness — silhouettes that hold their shape whether you're
            crossing a room or standing at the edge of one.
          </p>
        </div>
      </section>

      {/* Asymmetric spread 1 */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/5] overflow-hidden bg-cream">
              <SmartImage
                src={img("photo-1445205170230-053b83016050", 1400)}
                alt="Model wearing the Amara Silk Column Gown in the Fall lookbook"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-5 left-5">
                <ShopTheLook slug="amara-silk-column-gown" />
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center lg:col-span-5 lg:pl-8">
            <p className="eyebrow mb-4 text-gold">01 — Evening</p>
            <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
              A room changes shape around a woman who isn't rushing to fill it.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-espresso-light">
              The column gown is cut for exactly one purpose: to disappear into movement. No structure
              fighting the body, no seam announcing itself. Just silk, falling the way it was always
              going to fall.
            </p>
          </div>
        </div>
      </section>

      {/* Asymmetric spread 2 — reversed, two-image */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="order-2 flex flex-col justify-center lg:order-1 lg:col-span-5 lg:pr-8">
            <p className="eyebrow mb-4 text-gold">02 — Daylight</p>
            <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
              Confidence, worn loosely.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-espresso-light">
              Daytime pieces built from the same conviction as the evening edit — merino that holds
              its shape through a full day, leather that softens instead of wearing out.
            </p>
          </div>
          <div className="order-1 grid grid-cols-2 gap-4 lg:order-2 lg:col-span-7">
            <div className="relative aspect-[3/4] overflow-hidden bg-cream">
              <SmartImage
                src={img("photo-1434389677669-e08b4cac3105", 1000)}
                alt="Model in the Odette Merino Turtleneck"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative mt-8 aspect-[3/4] overflow-hidden bg-cream">
              <SmartImage
                src={img("photo-1584917865442-de89df76afd3", 1000)}
                alt="Detail shot of the Belmont Structured Tote"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4">
                <ShopTheLook slug="belmont-structured-tote" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width statement image */}
      <section className="relative h-[75vh] min-h-[460px] overflow-hidden bg-ink">
        <SmartImage
          src={img("photo-1566174053879-31528523f8ae", 1800)}
          alt="Wide editorial shot from the QueensLuxea Fall lookbook"
          className="h-full w-full object-cover opacity-85"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-ink/30 px-5 text-center">
          <p className="max-w-xl font-display text-3xl italic text-ivory sm:text-4xl">
            "Every piece is chosen for the woman who already knows who she is."
          </p>
        </div>
      </section>

      {/* Asymmetric spread 3 */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden bg-cream">
              <SmartImage
                src={img("photo-1543163521-1bf539c55dd2", 1000)}
                alt="Detail of the Camille Satin Pumps"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-5 left-5">
                <ShopTheLook slug="camille-satin-pumps" />
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center lg:col-span-7 lg:pl-10">
            <p className="eyebrow mb-4 text-gold">03 — Finishing</p>
            <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
              The last decision is often the one that's remembered.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-espresso-light">
              A pump low enough to walk in, satin soft enough to catch light without demanding it.
              Finished by hand in a workshop that has made little else for three generations.
            </p>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-line bg-cream py-20 text-center sm:py-28">
        <p className="eyebrow mb-4 text-gold">Shop the Edit</p>
        <h2 className="font-display text-3xl text-ink sm:text-4xl">Bring the Collection Home</h2>
        <Link
          to="/shop"
          className="eyebrow mt-8 inline-flex items-center gap-2 bg-ink px-8 py-4 text-ivory transition-colors hover:bg-espresso"
        >
          Shop the Collection <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}
