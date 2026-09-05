import { type FormEvent, useState } from "react";
import { Mail, Phone, Share2, MessageSquare } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import SectionHeading from "../components/SectionHeading";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Ready for backend/form service integration
    setSent(true);
  };

  const inputCls = "w-full border border-espresso/25 bg-ivory px-4 py-3 text-sm text-ink focus:border-espresso focus:outline-none transition-colors";

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Contact" }]} />

      <div className="mb-12 max-w-xl">
        <SectionHeading eyebrow="Get in Touch" title="Contact Us" />
        <p className="mt-4 text-sm leading-relaxed text-espresso-light">
          We'd love to hear from you. Whether you have a question about an order, need styling advice,
          or simply want to say hello — our team is here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-5">
        {/* Contact info */}
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-8">
            <div className="flex items-start gap-4">
              <Mail size={18} className="mt-0.5 shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <p className="eyebrow mb-1 text-espresso-light">Email</p>
                <a href="mailto:hello@queensluxea.com" className="text-sm text-ink link-underline hover:text-gold">
                  hello@queensluxea.com
                </a>
                <p className="mt-1 text-xs text-espresso-light">Response within 24 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone size={18} className="mt-0.5 shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <p className="eyebrow mb-1 text-espresso-light">Phone</p>
                <a href="tel:+12125550193" className="text-sm text-ink link-underline hover:text-gold">
                  +1 (212) 555-0193
                </a>
                <p className="mt-1 text-xs text-espresso-light">Mon – Fri, 9 am – 6 pm EST</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Share2 size={18} className="mt-0.5 shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <p className="eyebrow mb-1 text-espresso-light">Social</p>
                <div className="flex flex-col gap-1.5 text-sm">
                  <a href="#" className="text-ink link-underline hover:text-gold">@queensluxea</a>
                  <a href="#" className="text-ink link-underline hover:text-gold">Pinterest</a>
                  <a href="#" className="text-ink link-underline hover:text-gold">Facebook</a>
                </div>
              </div>
            </div>

            <div className="border-t border-line pt-8">
              <p className="eyebrow mb-3 text-espresso-light">Our Address</p>
              <address className="not-italic text-sm leading-relaxed text-espresso">
                QueensLuxea<br />
                14 West 57th Street<br />
                New York, NY 10019<br />
                United States
              </address>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="lg:col-span-3">
          {sent ? (
            <div className="flex flex-col items-center gap-5 border border-line py-20 text-center">
              <MessageSquare size={32} className="text-gold" strokeWidth={1.25} aria-hidden="true" />
              <p className="font-display text-2xl text-ink">Message Received</p>
              <p className="max-w-sm text-sm text-espresso-light">
                Thank you for reaching out. A member of our team will be in touch within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                className="eyebrow link-underline text-espresso"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} aria-label="Contact form" className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="contact-name" className="eyebrow mb-2 block text-espresso-light">Name</label>
                  <input id="contact-name" required value={form.name} onChange={set("name")} className={inputCls} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="contact-email" className="eyebrow mb-2 block text-espresso-light">Email</label>
                  <input id="contact-email" type="email" required value={form.email} onChange={set("email")} className={inputCls} />
                </div>
              </div>
              <div>
                <label htmlFor="contact-subject" className="eyebrow mb-2 block text-espresso-light">Subject</label>
                <select id="contact-subject" value={form.subject} onChange={set("subject")} className={inputCls}>
                  <option value="">Select a topic…</option>
                  <option>Order enquiry</option>
                  <option>Returns & exchanges</option>
                  <option>Product question</option>
                  <option>Press & partnerships</option>
                  <option>General</option>
                </select>
              </div>
              <div>
                <label htmlFor="contact-message" className="eyebrow mb-2 block text-espresso-light">Message</label>
                <textarea
                  id="contact-message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={set("message")}
                  className={inputCls + " resize-none"}
                />
              </div>
              <button
                type="submit"
                className="self-start bg-ink px-10 py-4 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-espresso"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
