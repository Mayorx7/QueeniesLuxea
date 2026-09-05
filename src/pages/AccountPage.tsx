import { Link } from "react-router-dom";
import { Package, MapPin, Heart, Settings, ChevronRight } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";

/*
 * Frontend UI only. Wire up to auth context when authentication is added.
 */

const DEMO_USER = {
  name: "Alexandra Whitmore",
  email: "a.whitmore@example.com",
  since: "March 2024",
};

const ACCOUNT_LINKS = [
  {
    icon: Package,
    label: "Orders",
    description: "View and track your order history",
    to: "/account/orders",
  },
  {
    icon: MapPin,
    label: "Addresses",
    description: "Manage your saved delivery addresses",
    to: "/account/addresses",
  },
  {
    icon: Heart,
    label: "Wishlist",
    description: "Your saved pieces",
    to: "/wishlist",
  },
  {
    icon: Settings,
    label: "Account Settings",
    description: "Update your email, password, and preferences",
    to: "#",
  },
];

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Account" }]} />

      {/* Profile header */}
      <div className="mb-10 flex items-center gap-6 border-b border-line pb-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-champagne bg-cream">
          <span className="font-display text-2xl text-ink">
            {DEMO_USER.name.split(" ").map((n) => n[0]).join("")}
          </span>
        </div>
        <div>
          <p className="font-display text-2xl text-ink">{DEMO_USER.name}</p>
          <p className="mt-0.5 text-sm text-espresso-light">{DEMO_USER.email}</p>
          <p className="mt-1 text-xs text-espresso-light">Member since {DEMO_USER.since}</p>
        </div>
      </div>

      <nav aria-label="Account sections">
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {ACCOUNT_LINKS.map(({ icon: Icon, label, description, to }) => (
            <li key={label}>
              <Link
                to={to}
                className="flex items-center gap-5 py-5 transition-colors hover:bg-cream/50"
              >
                <Icon size={20} className="shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-semibold text-ink">{label}</p>
                  <p className="mt-0.5 text-xs text-espresso-light">{description}</p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-espresso-light" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <button
        type="button"
        className="mt-10 eyebrow text-espresso-light link-underline hover:text-ink"
      >
        Sign Out
      </button>

      <p className="mt-3 text-xs text-espresso-light">
        Authentication is not yet connected — this page previews the account UI.
      </p>
    </div>
  );
}
