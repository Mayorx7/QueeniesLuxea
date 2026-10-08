import { useState, useEffect } from "react";
import { MapPin, Plus, Pencil, Trash2, CheckCircle, X, Loader2 } from "lucide-react";
import EmptyState from "../components/EmptyState";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

interface DbAddress {
  id: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
}

export default function AddressesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<DbAddress[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [phone, setPhone] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const fetchAddresses = async () => {
    if (!user || !supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .order("is_default_shipping", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAddresses(data as DbAddress[]);
    } catch (err) {
      console.error(err);
      showToast("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const openModal = (addr?: DbAddress) => {
    if (addr) {
      setEditingId(addr.id);
      setFirstName(addr.first_name);
      setLastName(addr.last_name);
      setAddressLine(addr.address);
      setCity(addr.city);
      setState(addr.state || "");
      setPostcode(addr.postcode || "");
      setCountry(addr.country);
      setPhone(addr.phone || "");
      setIsDefault(addr.is_default_shipping);
    } else {
      setEditingId(null);
      setFirstName("");
      setLastName("");
      setAddressLine("");
      setCity("");
      setState("");
      setPostcode("");
      setCountry("Nigeria");
      setPhone("");
      setIsDefault(addresses.length === 0); // Make default if it's the first one
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setIsSaving(true);
    try {
      const payload = {
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        address: addressLine,
        city,
        state,
        postcode,
        country,
        phone,
      };

      let newId = editingId;

      if (editingId) {
        const { error } = await supabase.from("addresses").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("addresses").insert(payload).select("id").single();
        if (error) throw error;
        newId = data.id;
      }

      // If they checked "Set as Default", call the RPC
      if (isDefault && newId) {
        await supabase.rpc("set_default_address", {
          address_id_input: newId,
          is_shipping_input: true,
          is_billing_input: true,
        });
      }

      showToast(`Address ${editingId ? "updated" : "added"} successfully`);
      closeModal();
      fetchAddresses();
    } catch (err) {
      console.error(err);
      showToast("Failed to save address");
    } finally {
      setIsSaving(false);
    }
  };

  const removeAddress = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw error;
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      showToast("Address deleted");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete address");
    }
  };

  const setDefault = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.rpc("set_default_address", {
        address_id_input: id,
        is_shipping_input: true,
        is_billing_input: true,
      });
      if (error) throw error;
      fetchAddresses();
      showToast("Default address updated");
    } catch (err) {
      console.error(err);
      showToast("Failed to set default address");
    }
  };

  return (
    <div className="fade-in space-y-6">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-ink">Saved Addresses</h2>
        <button
          type="button"
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ivory transition-all hover:bg-espresso hover:scale-[1.02]"
        >
          <Plus size={15} />
          Add Address
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-gold" size={24} />
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          message="Add a delivery address to speed up your checkout experience."
          action={
            <button
              type="button"
              onClick={() => openModal()}
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
                addr.is_default_shipping ? "border-champagne shadow-sm" : "border-line"
              }`}
            >
              {addr.is_default_shipping && (
                <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-cream px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-gold">
                  <CheckCircle size={10} />
                  Default
                </span>
              )}

              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cream">
                  <MapPin size={14} className="text-gold" strokeWidth={1.5} />
                </div>
                <p className="font-display text-base text-ink">
                  {addr.first_name} {addr.last_name}
                </p>
              </div>

              <address className="not-italic text-sm text-espresso leading-relaxed">
                <p className="mt-1">{addr.address}</p>
                <p>
                  {addr.city}, {addr.state} {addr.postcode}
                </p>
                <p>{addr.country}</p>
                {addr.phone && <p className="mt-1 text-espresso-light">{addr.phone}</p>}
              </address>

              <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                {!addr.is_default_shipping && (
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
                    onClick={() => openModal(addr)}
                    aria-label="Edit address"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-espresso-light transition-colors hover:border-champagne hover:text-ink"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete address"
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

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity" 
            onClick={closeModal} 
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-ivory shadow-2xl p-6 md:p-8" style={{ animation: "dialogIn 0.2s cubic-bezier(0.22,1,0.36,1) both" }}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">
                {editingId ? "Edit Address" : "Add Address"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-espresso-light hover:bg-cream hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-espresso-light">First Name *</label>
                  <input
                    required
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm outline-none transition-colors focus:border-champagne"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-espresso-light">Last Name *</label>
                  <input
                    required
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm outline-none transition-colors focus:border-champagne"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-espresso-light">Address *</label>
                <input
                  required
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm outline-none transition-colors focus:border-champagne"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-espresso-light">City *</label>
                  <input
                    required
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm outline-none transition-colors focus:border-champagne"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-espresso-light">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm outline-none transition-colors focus:border-champagne"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-espresso-light">Postcode</label>
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm outline-none transition-colors focus:border-champagne"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-espresso-light">Country *</label>
                  <input
                    required
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm outline-none transition-colors focus:border-champagne"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-espresso-light">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm outline-none transition-colors focus:border-champagne"
                />
              </div>

              <label className="mt-2 flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-line text-ink focus:ring-ink accent-ink"
                />
                <span className="text-sm font-medium text-ink">Set as default address</span>
              </label>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-full border border-line py-3 text-sm font-semibold text-espresso transition-colors hover:bg-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-full bg-ink py-3 text-sm font-semibold text-ivory transition-colors hover:bg-espresso disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
