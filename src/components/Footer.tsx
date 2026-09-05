import { Link } from "react-router-dom";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-ink)] text-[var(--color-ivory)]">
      <div className="mx-auto max-w-7xl px-5 py-12 pb-20 sm:px-8 sm:py-16 md:pb-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column — full width on mobile */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block">
              <img
                src="/log.png"
                alt="QueenLuxea"
                className="h-10 w-auto object-contain brightness-0 invert sm:h-12"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--color-ivory)]/70">
              Considered essentials for the woman who moves through her life with quiet intention.
            </p>
            <div className="mt-5 flex items-center gap-5">
              <a href="#" className="eyebrow text-[0.65rem] text-[var(--color-ivory)]/70 hover:text-[var(--color-gold-light)] link-underline">
                Instagram
              </a>
              <a href="#" className="eyebrow text-[0.65rem] text-[var(--color-ivory)]/70 hover:text-[var(--color-gold-light)] link-underline">
                Pinterest
              </a>
              <a href="#" className="eyebrow text-[0.65rem] text-[var(--color-ivory)]/70 hover:text-[var(--color-gold-light)] link-underline">
                Facebook
              </a>
            </div>
          </div>

          <div>
            <h3 className="eyebrow text-[var(--color-ivory)]/50">Shop</h3>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              <li><Link to="/shop/Dresses" className="text-[var(--color-ivory)]/80 hover:text-[var(--color-gold-light)] transition-colors">Dresses</Link></li>
              <li><Link to="/shop/Handbags" className="text-[var(--color-ivory)]/80 hover:text-[var(--color-gold-light)] transition-colors">Handbags</Link></li>
              <li><Link to="/shop/Jewelry" className="text-[var(--color-ivory)]/80 hover:text-[var(--color-gold-light)] transition-colors">Jewelry</Link></li>
              <li><Link to="/shop" className="text-[var(--color-ivory)]/80 hover:text-[var(--color-gold-light)] transition-colors">All Products</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-[var(--color-ivory)]/50">Customer Care</h3>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              <li><Link to="/shipping" className="text-[var(--color-ivory)]/80 hover:text-[var(--color-gold-light)] transition-colors">Shipping &amp; Returns</Link></li>
              <li><Link to="/faq" className="text-[var(--color-ivory)]/80 hover:text-[var(--color-gold-light)] transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="text-[var(--color-ivory)]/80 hover:text-[var(--color-gold-light)] transition-colors">Contact Us</Link></li>
              <li><Link to="/about" className="text-[var(--color-ivory)]/80 hover:text-[var(--color-gold-light)] transition-colors">Our Story</Link></li>
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h3 className="eyebrow text-[var(--color-ivory)]/50">Stay in Touch</h3>
            <p className="mt-4 text-sm text-[var(--color-ivory)]/70">First word on new arrivals and private previews.</p>
            <div className="mt-4">
              <NewsletterForm variant="dark" />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-[var(--color-ivory)]/15 pt-6 text-xs text-[var(--color-ivory)]/50 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} QueenLuxea. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy" className="hover:text-[var(--color-ivory)] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[var(--color-ivory)] transition-colors">Terms of Service</Link>
            <Link to="/cookie-policy" className="hover:text-[var(--color-ivory)] transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
