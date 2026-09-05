import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, CheckCircle } from "lucide-react";
import EmptyState from "../components/EmptyState";

interface Address {
  id: string;
  label: string;
  name: string;
  line1: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  isDefault: boolean;
}

const DEMO_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    label: "Home",
    name: "Alexandra Whitmore",
    line1: "14 West 57th Street",
    city: "New York",
    state: "NY",
    postcode: "10019",
    country: "United States",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Office",
    name: "Alexandra Whitmore",
    line1: "30 Rockefeller Plaza, Suite 4200",
    city: "New York",
    state: "NY",
    postcode: "10112",
    country: "United States",
    isDefault: false,
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(DEMO_ADDRESSES);

  const removeAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const setDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  return (
    <div className="fade-in space-y-6">
      {/* Action bar */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ivory transition-all hover:bg-espresso hover:scale-[1.02]"
        >
          <Plus size={15} />
          Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          message="Add a delivery address to speed up your checkout experience."
          action={
            <button
              type="button"
              className="eyebrow bg-ink px-6 py-3 text-ivory hover:bg-espresso"
            >
              Add Address
            </button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <li
              key={addr.id}
              className={`group relative rounded-2xl border bg-ivory p-6 transition-shadow hover:shadow-md ${
                addr.isDefault ? "border-champagne" : "border-line"
              }`}
            >
              {addr.isDefault && (
                <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-cream px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-gold">
                  <CheckCircle size={10} />
                  Default
                </span>
              )}

              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cream">
                  <MapPin size={14} className="text-gold" strokeWidth={1.5} />
                </div>
                <p className="font-display text-base text-ink">{addr.label}</p>
              </div>

              <address className="not-italic text-sm text-espresso leading-relaxed">
                <p className="font-medium text-ink">{addr.name}</p>
                <p className="mt-1">{addr.line1}</p>
                <p>
                  {addr.city}, {addr.state} {addr.postcode}
                </p>
                <p>{addr.country}</p>
              </address>

              <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => setDefault(addr.id)}
                    className="eyebrow text-espresso-light transition-colors hover:text-ink link-underline"
                  >
                    Set as Default
                  </button>
                )}
                <div className="ml-auto flex items-center gap-3">
                  <button
                    type="button"
                    aria-label={`Edit ${addr.label} address`}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-espresso-light transition-colors hover:border-champagne hover:text-ink"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${addr.label} address`}
                    onClick={() => removeAddress(addr.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-espresso-light transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-espresso-light">
        Address management is a frontend preview — connect to your backend to persist changes.
      </p>
    </div>
  );
}
