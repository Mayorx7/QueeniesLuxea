import Breadcrumbs from "../components/Breadcrumbs";
import Accordion from "../components/Accordion";
import SectionHeading from "../components/SectionHeading";
import { Link } from "react-router-dom";

const FAQ_SECTIONS = [
  {
    heading: "Orders & Payment",
    items: [
      {
        title: "What payment methods do you accept?",
        content: "We accept all major credit and debit cards (Visa, Mastercard, American Express), as well as Apple Pay and PayPal. All transactions are processed securely via SSL encryption.",
      },
      {
        title: "Can I modify or cancel my order after placing it?",
        content: "We begin processing orders immediately upon confirmation. Please contact us within one hour of placing your order if you need to make changes. We cannot guarantee modifications after this window.",
      },
      {
        title: "Do you offer gift wrapping?",
        content: "Yes. Every QueensLuxea order is packaged with care in our signature tissue and ribbon. Complimentary gift messaging is available at checkout.",
      },
      {
        title: "Will I receive an order confirmation?",
        content: "Yes. A confirmation email is sent immediately after your order is placed. If you do not receive it within a few minutes, please check your spam folder or contact us.",
      },
    ],
  },
  {
    heading: "Shipping & Delivery",
    items: [
      {
        title: "How long will my order take to arrive?",
        content: "Standard shipping takes 5–8 business days. Express shipping arrives in 2–3 business days. Overnight delivery is available for next business day arrival on eligible orders placed before 12 pm EST.",
      },
      {
        title: "Do you ship internationally?",
        content: "Yes, we ship to over 40 countries. International delivery typically takes 8–14 business days. Import duties and taxes are the responsibility of the recipient.",
      },
      {
        title: "Is complimentary shipping available?",
        content: "Complimentary standard shipping is offered on all orders over $150 within the United States.",
      },
      {
        title: "Can I track my order?",
        content: "A tracking link will be emailed once your order has been dispatched. You can also view your order status in your account dashboard.",
      },
    ],
  },
  {
    heading: "Returns & Exchanges",
    items: [
      {
        title: "What is your return policy?",
        content: "We accept returns within 30 days of delivery for most items in their original, unworn condition with all tags attached. Items marked as final sale are not eligible for return.",
      },
      {
        title: "How do I initiate a return?",
        content: "Contact our team at hello@queensluxea.com with your order number and reason for return. We will provide a prepaid return label for domestic orders.",
      },
      {
        title: "When will I receive my refund?",
        content: "Refunds are processed within 5 business days of receiving the returned item. Please allow an additional 3–5 business days for the amount to appear in your account.",
      },
      {
        title: "Can I exchange an item for a different size or colour?",
        content: "Yes. Exchanges are handled as a return and a new order. Contact us and we will reserve your preferred size while processing your return.",
      },
    ],
  },
  {
    heading: "Products & Sizing",
    items: [
      {
        title: "How do I find the right size?",
        content: "Each product page includes a detailed size guide. We recommend measuring your bust, waist, and hips and comparing against our size chart. If you are between sizes, we generally recommend sizing up for a more relaxed fit.",
      },
      {
        title: "Are all products available in all sizes?",
        content: "We strive to offer inclusive sizing. Availability varies by style. Use the filters on the Shop page to browse products in your size.",
      },
      {
        title: "How should I care for my QueensLuxea pieces?",
        content: "Care instructions are printed on the garment label and listed on each product page. Most of our garments are dry-clean only or require gentle hand washing in cold water.",
      },
    ],
  },
  {
    heading: "Account & Privacy",
    items: [
      {
        title: "Do I need an account to place an order?",
        content: "No, you can check out as a guest. However, creating an account lets you track orders, save your wishlist, and enjoy a faster checkout experience.",
      },
      {
        title: "How is my personal information handled?",
        content: (
          <span>
            We take your privacy seriously. Please review our{" "}
            <Link to="/privacy" className="link-underline text-gold">Privacy Policy</Link>{" "}
            for full details on data collection and use.
          </span>
        ),
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "FAQ" }]} />

      <div className="mb-12">
        <SectionHeading eyebrow="Help" title="Frequently Asked Questions" />
        <p className="mt-4 text-sm leading-relaxed text-espresso-light">
          Find answers to our most common questions below. If you need further assistance, our team is available via{" "}
          <Link to="/contact" className="link-underline text-espresso hover:text-gold">Contact Us</Link>.
        </p>
      </div>

      <div className="flex flex-col gap-14">
        {FAQ_SECTIONS.map((section) => (
          <section key={section.heading} aria-labelledby={`faq-${section.heading.replace(/\s+/g, '-')}`}>
            <h2 id={`faq-${section.heading.replace(/\s+/g, '-')}`} className="eyebrow mb-6 text-gold">
              {section.heading}
            </h2>
            <Accordion
              items={section.items.map((item) => ({
                title: item.title,
                content: typeof item.content === "string" ? (
                  <p className="leading-relaxed">{item.content}</p>
                ) : item.content,
              }))}
            />
          </section>
        ))}
      </div>

      <div className="mt-16 border border-line bg-cream px-6 py-8 text-center">
        <p className="font-display text-xl text-ink">Still have a question?</p>
        <p className="mt-2 text-sm text-espresso-light">Our team is happy to help.</p>
        <Link
          to="/contact"
          className="eyebrow mt-5 inline-block bg-ink px-8 py-3.5 text-ivory transition-colors hover:bg-espresso"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
