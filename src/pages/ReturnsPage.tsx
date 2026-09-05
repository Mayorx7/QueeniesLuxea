import { RotateCcw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import SectionHeading from "../components/SectionHeading";

const RETURN_STEPS = [
  {
    step: "01",
    title: "Contact Us",
    body: "Email hello@queensluxea.com within 30 days of receiving your order. Include your order number and reason for return.",
  },
  {
    step: "02",
    title: "Receive Return Label",
    body: "We will email you a prepaid return label within one business day. International customers receive instructions for organising a return shipment.",
  },
  {
    step: "03",
    title: "Package Carefully",
    body: "Return items in their original packaging where possible, with all tags attached and in an unworn, unaltered condition.",
  },
  {
    step: "04",
    title: "Refund Processed",
    body: "Once we receive and inspect the item, your refund is processed within 5 business days to your original payment method.",
  },
];

const ELIGIBLE = [
  "Full-price items within 30 days of delivery",
  "Unworn, unaltered garments with original tags",
  "Items in their original packaging",
  "Shoes returned in the original shoe box",
];

const INELIGIBLE = [
  "Final sale items",
  "Intimates and swimwear",
  "Jewellery (for hygiene reasons)",
  "Items without original tags",
  "Items showing signs of wear, alteration, or damage",
  "Gift cards",
];

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Returns" }]} />

      <div className="mb-12">
        <SectionHeading eyebrow="Returns & Exchanges" title="Our Return Policy" />
        <p className="mt-4 text-sm leading-relaxed text-espresso-light">
          We stand behind the quality of everything we create. If something isn't right, we're
          here to make it so — simply and without fuss.
        </p>
      </div>

      {/* Return window highlight */}
      <div className="mb-12 flex items-center gap-5 border border-line bg-cream px-6 py-6">
        <Clock size={28} className="shrink-0 text-gold" strokeWidth={1.25} aria-hidden="true" />
        <div>
          <p className="font-display text-2xl text-ink">30-Day Return Window</p>
          <p className="mt-1 text-sm text-espresso-light">
            Returns are accepted within 30 days of the delivery date.
          </p>
        </div>
      </div>

      {/* Eligibility */}
      <section aria-labelledby="eligibility-heading" className="mb-12">
        <h2 id="eligibility-heading" className="eyebrow mb-6 text-gold">Eligible Items</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-4 flex items-center gap-2 font-semibold text-ink">
              <CheckCircle2 size={16} className="text-gold" aria-hidden="true" />
              Accepted
            </p>
            <ul className="flex flex-col gap-2 text-sm text-espresso">
              {ELIGIBLE.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 flex items-center gap-2 font-semibold text-ink">
              <XCircle size={16} className="text-espresso-light" aria-hidden="true" />
              Not accepted
            </p>
            <ul className="flex flex-col gap-2 text-sm text-espresso">
              {INELIGIBLE.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-espresso/40" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="hairline mb-12" />

      {/* Return process */}
      <section aria-labelledby="process-heading" className="mb-12">
        <h2 id="process-heading" className="eyebrow mb-8 text-gold">The Return Process</h2>
        <div className="flex flex-col gap-6">
          {RETURN_STEPS.map((s) => (
            <div key={s.step} className="flex items-start gap-6 border-b border-line pb-6 last:border-0 last:pb-0">
              <span className="font-display text-3xl text-champagne">{s.step}</span>
              <div>
                <p className="font-semibold text-ink">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-espresso-light">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="hairline mb-12" />

      {/* Refunds */}
      <section aria-labelledby="refunds-heading" className="mb-12">
        <h2 id="refunds-heading" className="eyebrow mb-4 text-gold">Refunds</h2>
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-espresso-light">
          <p>
            Approved refunds are credited to your original payment method. Processing takes up to 5 business
            days after we receive the return. Allow a further 3–5 business days for funds to appear in your account.
          </p>
          <p>
            Original shipping charges are non-refundable unless the return is the result of our error.
          </p>
          <p>
            For exchanges, we recommend initiating a return for the original item and placing a new order
            immediately to ensure availability.
          </p>
        </div>
      </section>

      <div className="flex items-center gap-4 border border-line bg-cream px-6 py-6">
        <RotateCcw size={20} className="shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
        <p className="text-sm text-espresso-light">
          Ready to return something?{" "}
          <Link to="/contact" className="link-underline font-semibold text-espresso hover:text-gold">
            Contact our team
          </Link>{" "}
          and we will guide you through the process.
        </p>
      </div>
    </div>
  );
}
