import { Truck, Globe, Clock, Package } from "lucide-react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import SectionHeading from "../components/SectionHeading";

const SHIPPING_OPTIONS = [
  {
    name: "Standard",
    domestic: "5–8 business days",
    international: "8–14 business days",
    cost: "Complimentary on orders over $150. $14 otherwise.",
  },
  {
    name: "Express",
    domestic: "2–3 business days",
    international: "4–6 business days",
    cost: "$18 domestic · from $32 international",
  },
  {
    name: "Overnight",
    domestic: "Next business day",
    international: "Not available",
    cost: "$38 domestic (orders placed before 12 pm EST)",
  },
];

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Shipping" }]} />

      <div className="mb-12">
        <SectionHeading eyebrow="Delivery" title="Shipping Information" />
        <p className="mt-4 text-sm leading-relaxed text-espresso-light">
          Every order is carefully packaged in our signature tissue and dispatched from our warehouse in New York.
          We ship to over 40 countries worldwide.
        </p>
      </div>

      {/* Shipping options table */}
      <section aria-labelledby="shipping-options-heading">
        <h2 id="shipping-options-heading" className="eyebrow mb-6 text-gold">Delivery Options</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="eyebrow pb-3 text-espresso-light">Method</th>
                <th className="eyebrow pb-3 text-espresso-light">Domestic</th>
                <th className="eyebrow pb-3 text-espresso-light">International</th>
                <th className="eyebrow pb-3 text-espresso-light">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {SHIPPING_OPTIONS.map((opt) => (
                <tr key={opt.name}>
                  <td className="py-4 pr-6 font-semibold text-ink">{opt.name}</td>
                  <td className="py-4 pr-6 text-espresso">{opt.domestic}</td>
                  <td className="py-4 pr-6 text-espresso">{opt.international}</td>
                  <td className="py-4 text-espresso">{opt.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="hairline my-12" />

      {/* Feature cards */}
      <section aria-labelledby="shipping-features-heading" className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <h2 id="shipping-features-heading" className="sr-only">Shipping Features</h2>
        {[
          {
            icon: Package,
            title: "Signature Packaging",
            body: "Each order is wrapped in our signature ivory tissue paper, sealed with a QueensLuxea wax sticker, and placed in a recycled kraft gift box.",
          },
          {
            icon: Globe,
            title: "International Shipping",
            body: "We deliver to over 40 countries. International customers are responsible for any applicable import duties and taxes at point of entry.",
          },
          {
            icon: Clock,
            title: "Cut-off Times",
            body: "Orders placed before 2 pm EST on business days are dispatched the same day. Orders placed Friday after 2 pm ship on Monday.",
          },
          {
            icon: Truck,
            title: "Order Tracking",
            body: "Once your order has been dispatched, you will receive a tracking link by email. Track directly through your account dashboard.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="border border-line p-6">
            <Icon size={20} className="mb-4 text-gold" strokeWidth={1.5} aria-hidden="true" />
            <p className="font-semibold text-ink">{title}</p>
            <p className="mt-2 text-sm leading-relaxed text-espresso-light">{body}</p>
          </div>
        ))}
      </section>

      <div className="hairline my-12" />

      <section aria-labelledby="returns-link-heading">
        <h2 id="returns-link-heading" className="eyebrow mb-4 text-gold">Returns</h2>
        <p className="text-sm leading-relaxed text-espresso-light">
          We offer a 30-day return window on most items. Please visit our{" "}
          <Link to="/returns" className="link-underline text-espresso hover:text-gold">Returns page</Link>{" "}
          for full details on eligibility, the return process, and refund timelines.
        </p>
      </section>

      <div className="mt-12 border border-line bg-cream px-6 py-6 text-center">
        <p className="text-sm text-espresso-light">
          Questions about your delivery?{" "}
          <Link to="/contact" className="link-underline font-semibold text-espresso hover:text-gold">
            Contact our team
          </Link>
        </p>
      </div>
    </div>
  );
}
