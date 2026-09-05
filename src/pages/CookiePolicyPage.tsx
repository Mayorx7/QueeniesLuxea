import Breadcrumbs from "../components/Breadcrumbs";
import SectionHeading from "../components/SectionHeading";
import Accordion from "../components/Accordion";

/*
 * IMPORTANT: Placeholder cookie policy. Replace before launch.
 */

const LAST_UPDATED = "September 2026";

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Cookie Policy" }]} />

      <div className="mb-10">
        <SectionHeading eyebrow="Legal" title="Cookie Policy" />
        <p className="mt-3 text-xs text-espresso-light">Last updated: {LAST_UPDATED}</p>
      </div>

      <p className="mb-10 border-l-2 border-champagne pl-5 text-sm leading-relaxed text-espresso-light italic">
        This page contains placeholder legal information. Before launching, replace this content with
        your actual Cookie Policy drafted by a qualified legal professional in your jurisdiction.
      </p>

      <div className="mb-10 text-sm leading-relaxed text-espresso-light">
        <p>
          This Cookie Policy explains how QueensLuxea ("we", "us", "our") uses cookies and similar
          tracking technologies when you visit our website. By using our site, you consent to the use
          of cookies as described in this policy.
        </p>
      </div>

      <Accordion
        items={[
          {
            title: "What Are Cookies?",
            content: (
              <p className="leading-relaxed">
                Cookies are small text files placed on your device when you visit a website. They are
                widely used to make websites work more efficiently and to provide information to the
                site owner. Cookies cannot harm your device and do not contain viruses.
              </p>
            ),
          },
          {
            title: "Essential Cookies",
            content: (
              <p className="leading-relaxed">
                These cookies are strictly necessary for the website to function and cannot be
                switched off in our systems. They are usually set in response to actions you take
                such as setting your privacy preferences, logging in, or filling in forms. Examples
                include your shopping cart session and authentication tokens.
              </p>
            ),
          },
          {
            title: "Analytics Cookies",
            content: (
              <p className="leading-relaxed">
                We use analytics cookies to understand how visitors interact with our website. This
                helps us improve our site's performance and user experience. All analytics data is
                aggregated and anonymised. We use tools such as Google Analytics for this purpose.
              </p>
            ),
          },
          {
            title: "Marketing and Personalisation Cookies",
            content: (
              <p className="leading-relaxed">
                These cookies may be set through our site by our advertising partners to build a
                profile of your interests and show you relevant content on other sites. They do not
                directly store personal information but uniquely identify your browser and device.
              </p>
            ),
          },
          {
            title: "Managing Your Cookie Preferences",
            content: (
              <p className="leading-relaxed">
                You can control and manage cookies in your browser settings. Please note that removing
                or blocking cookies may impact your user experience and some features may no longer
                function correctly. Most browsers allow you to see which cookies are stored and delete
                them on a per-cookie or per-domain basis.
              </p>
            ),
          },
          {
            title: "Third-Party Cookies",
            content: (
              <p className="leading-relaxed">
                Some cookies are placed by third parties such as payment processors, social media
                platforms, and analytics providers. We have no direct control over these cookies. Please
                refer to the relevant third-party privacy policies for more information.
              </p>
            ),
          },
          {
            title: "Changes to This Policy",
            content: (
              <p className="leading-relaxed">
                We may update this Cookie Policy from time to time. The date at the top of this page
                indicates when it was last revised. Continued use of our website after any changes
                constitutes acceptance of the revised policy.
              </p>
            ),
          },
        ]}
      />

      <div className="mt-12 text-sm text-espresso-light">
        <p>
          For more information about how we handle your personal data, please review our{" "}
          <a href="/privacy" className="link-underline text-espresso hover:text-gold">Privacy Policy</a>.
          Questions about this Cookie Policy may be directed to{" "}
          <a href="mailto:privacy@queensluxea.com" className="link-underline text-espresso hover:text-gold">
            privacy@queensluxea.com
          </a>.
        </p>
      </div>
    </div>
  );
}
