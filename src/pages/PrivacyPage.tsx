import Breadcrumbs from "../components/Breadcrumbs";
import SectionHeading from "../components/SectionHeading";

/*
 * IMPORTANT: This page contains placeholder legal copy.
 * Replace all content below with your actual, jurisdiction-appropriate
 * Privacy Policy before going live. Consult a qualified legal professional.
 */

const LAST_UPDATED = "September 2026";

interface Section {
  heading: string;
  body: string[];
}

const SECTIONS: Section[] = [
  {
    heading: "Information We Collect",
    body: [
      "When you place an order, we collect your name, email address, postal address, telephone number, and payment information.",
      "When you browse our website, we may collect data about your device, browser type, IP address, pages visited, and time spent on those pages through cookies and similar tracking technologies.",
      "We may also collect information you voluntarily provide, such as when you sign up for our newsletter, contact us, or create an account.",
    ],
  },
  {
    heading: "How We Use Your Information",
    body: [
      "To process and fulfil your orders, including sending confirmation and shipping notifications.",
      "To communicate with you about your orders, returns, and enquiries.",
      "To send you marketing communications, where you have opted in to receive them.",
      "To improve our website, products, and services through analytics and user feedback.",
      "To comply with our legal obligations.",
    ],
  },
  {
    heading: "Sharing Your Information",
    body: [
      "We do not sell your personal information to third parties.",
      "We may share your information with carefully selected service providers who assist us in operating our business, including payment processors, shipping carriers, and email service providers. These parties are contractually obligated to keep your information confidential.",
      "We may disclose your information where required by law, court order, or governmental authority.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "We use cookies and similar technologies to enhance your browsing experience, analyse website traffic, and personalise content.",
      "You can manage your cookie preferences through your browser settings. Note that disabling certain cookies may affect the functionality of this website.",
      "For full details on our cookie practices, please review our Cookie Policy.",
    ],
  },
  {
    heading: "Your Rights",
    body: [
      "Depending on your location, you may have the right to access, correct, delete, or restrict the processing of your personal data.",
      "You may also have the right to object to processing and the right to data portability.",
      "To exercise any of these rights, please contact us at privacy@queensluxea.com.",
    ],
  },
  {
    heading: "Data Retention",
    body: [
      "We retain personal data for as long as necessary to fulfil the purposes for which it was collected, including to satisfy legal, accounting, or reporting obligations.",
      "Order records are generally retained for seven years to comply with tax and accounting requirements.",
    ],
  },
  {
    heading: "Security",
    body: [
      "We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction.",
      "However, no method of transmission over the internet or method of electronic storage is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    heading: "Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. The date at the top of this page indicates when it was last revised.",
      "We encourage you to review this policy periodically to stay informed about how we protect your information.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "If you have any questions, concerns, or requests relating to this Privacy Policy, please contact us at privacy@queensluxea.com or by writing to QueensLuxea, 14 West 57th Street, New York, NY 10019, United States.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Privacy Policy" }]} />

      <div className="mb-10">
        <SectionHeading eyebrow="Legal" title="Privacy Policy" />
        <p className="mt-3 text-xs text-espresso-light">Last updated: {LAST_UPDATED}</p>
      </div>

      <p className="mb-10 border-l-2 border-champagne pl-5 text-sm leading-relaxed text-espresso-light italic">
        This page contains placeholder legal information. Before launching, replace this content with
        your actual Privacy Policy drafted by a qualified legal professional in your jurisdiction.
      </p>

      <div className="flex flex-col gap-10">
        {SECTIONS.map((section) => (
          <section key={section.heading} aria-labelledby={`privacy-${section.heading.replace(/\s+/g, '-')}`}>
            <h2 id={`privacy-${section.heading.replace(/\s+/g, '-')}`} className="mb-4 font-display text-xl text-ink">
              {section.heading}
            </h2>
            <div className="flex flex-col gap-3">
              {section.body.map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed text-espresso-light">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
