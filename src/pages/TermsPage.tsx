import Breadcrumbs from "../components/Breadcrumbs";
import SectionHeading from "../components/SectionHeading";

const LAST_UPDATED = "September 2026";

const SECTIONS = [
  {
    heading: "Acceptance of Terms",
    body: "By accessing or using the QueensLuxea website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our site.",
  },
  {
    heading: "Products and Pricing",
    body: "All prices are displayed in US Dollars and are subject to change without notice. We reserve the right to modify or discontinue any product at any time. Prices for products in your cart are confirmed at the time of checkout.",
  },
  {
    heading: "Orders and Payment",
    body: "By placing an order, you represent that you are at least 18 years of age and authorised to use the payment method provided. We reserve the right to refuse or cancel any order at our discretion, including orders that appear fraudulent or that contain pricing errors.",
  },
  {
    heading: "Shipping and Delivery",
    body: "Delivery times are estimates and not guaranteed. QueensLuxea is not liable for delays caused by the shipping carrier, customs, weather, or other events beyond our control. Risk of loss passes to the customer upon handoff to the carrier.",
  },
  {
    heading: "Returns and Refunds",
    body: "Our returns and refunds process is governed by our Returns Policy, which forms part of these Terms. Please review the Returns page before purchasing.",
  },
  {
    heading: "Intellectual Property",
    body: "All content on this website — including photographs, text, graphics, logos, and design — is the property of QueensLuxea or its content suppliers and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent.",
  },
  {
    heading: "User Accounts",
    body: "If you create an account, you are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. Notify us immediately of any unauthorised use.",
  },
  {
    heading: "Limitation of Liability",
    body: "To the fullest extent permitted by law, QueensLuxea shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the site or products purchased.",
  },
  {
    heading: "Governing Law",
    body: "These Terms shall be governed by and construed in accordance with the laws of the State of New York, United States, without regard to its conflict of law provisions.",
  },
  {
    heading: "Changes to Terms",
    body: "We may update these Terms from time to time. Continued use of the site following any changes constitutes acceptance of the revised Terms.",
  },
  {
    heading: "Contact",
    body: "Questions about these Terms should be directed to legal@queensluxea.com.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Terms of Service" }]} />

      <div className="mb-10">
        <SectionHeading eyebrow="Legal" title="Terms of Service" />
        <p className="mt-3 text-xs text-espresso-light">Last updated: {LAST_UPDATED}</p>
      </div>

      <p className="mb-10 border-l-2 border-champagne pl-5 text-sm leading-relaxed text-espresso-light italic">
        This page contains placeholder legal information. Before launching, replace this content with
        your actual Terms of Service drafted by a qualified legal professional in your jurisdiction.
      </p>

      <div className="flex flex-col gap-10">
        {SECTIONS.map((section) => (
          <section key={section.heading} aria-labelledby={`terms-${section.heading.replace(/\s+/g, '-')}`}>
            <h2 id={`terms-${section.heading.replace(/\s+/g, '-')}`} className="mb-3 font-display text-xl text-ink">
              {section.heading}
            </h2>
            <p className="text-sm leading-relaxed text-espresso-light">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
