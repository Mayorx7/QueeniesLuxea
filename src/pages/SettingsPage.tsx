import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Lock, Shield, Trash2, Eye, EyeOff, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useLocalStorage } from "../hooks/useLocalStorage";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  newArrivals: boolean;
  wishlistAlerts: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  orderUpdates: true,
  promotions: false,
  newArrivals: true,
  wishlistAlerts: true,
};

type NotifKey = keyof NotificationPreferences;

const NOTIF_LABELS: { key: NotifKey; label: string; desc: string }[] = [
  {
    key: "orderUpdates",
    label: "Order Updates",
    desc: "Shipping & delivery notifications for your orders",
  },
  {
    key: "promotions",
    label: "Promotions & Offers",
    desc: "Exclusive sales, discounts, and member perks",
  },
  {
    key: "newArrivals",
    label: "New Arrivals",
    desc: "Be the first to know about new collections",
  },
  {
    key: "wishlistAlerts",
    label: "Wishlist Alerts",
    desc: "Price drops and low-stock alerts for saved items",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // ── Notification preferences ───────────────────────────────────────────────
  // Keyed by user ID so each account has its own persisted prefs.
  const storageKey = user ? `notif-prefs-${user.id}` : "notif-prefs-guest";
  const [notifications, setNotifications] = useLocalStorage<NotificationPreferences>(
    storageKey,
    DEFAULT_PREFS
  );
  const [notifSaved, setNotifSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleNotif = (key: NotifKey) => {
    setNotifSaved(false);
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Show brief "Saved" confirmation 300 ms after toggle settles
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        setNotifSaved(true);
        setTimeout(() => setNotifSaved(false), 2000);
      }, 300);
      return next;
    });
  };

  // ── Change Password ────────────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const DELETE_PHRASE = "DELETE";

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordSaved(false);
    setPasswordError("");
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.next.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setSavingPassword(true);
    setPasswordError("");
    setPasswordSaved(false);

    const { error } = await supabase.auth.updateUser({ password: passwordForm.next });

    setSavingPassword(false);

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSaved(true);
      setPasswordForm({ current: "", next: "", confirm: "" });
    }
  };

  const toggleShow = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // ── Delete account ─────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (!supabase || !user || !profile) return;
    if (deleteConfirmText !== DELETE_PHRASE) return;

    setDeleting(true);
    setDeleteError("");

    try {
      // 1. Anonymise profile name via the existing RPC (no new SQL needed)
      await supabase.rpc("update_my_profile", {
        first_name_input: "",
        last_name_input: "",
      });

      // 2. Delete wishlist rows
      await supabase.from("wishlists").delete().eq("user_id", user.id);

      // 3. Wipe all user-scoped localStorage keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.includes(user.id)) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      localStorage.removeItem("ql_wishlist_guest");

      // 4. Sign out and redirect
      await signOut();
      navigate("/", { replace: true });
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setDeleting(false);
    }
  };

  // ── Download my data ───────────────────────────────────────────────────────
  const handleDownloadData = async () => {
    if (!supabase || !profile) return;
    try {
      const [ordersRes, addressesRes] = await Promise.all([
        supabase.from("orders").select("*").eq("customer_id", profile.id),
        supabase.from("addresses").select("*").eq("user_id", profile.id),
      ]);
      const payload = {
        exported_at: new Date().toISOString(),
        profile: {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: profile.role,
          created_at: profile.created_at,
        },
        notification_preferences: notifications,
        orders: ordersRes.data ?? [],
        addresses: addressesRes.data ?? [],
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `queeniesluxea-data-${profile.id.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export data", err);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fade-in space-y-8">

      {/* ── Notifications ─────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-line bg-ivory p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream">
              <Bell size={16} className="text-gold" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-xl text-ink">Notification Preferences</h2>
          </div>
          {notifSaved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-700 transition-opacity">
              <CheckCircle size={13} />
              Saved
            </span>
          )}
        </div>

        <ul className="divide-y divide-line">
          {NOTIF_LABELS.map(({ key, label, desc }) => (
            <li key={key} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-sm font-semibold text-ink">{label}</p>
                <p className="mt-0.5 text-xs text-espresso-light">{desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifications[key]}
                aria-label={`Toggle ${label}`}
                onClick={() => toggleNotif(key)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                  notifications[key]
                    ? "border-gold bg-gold"
                    : "border-line bg-cream"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-ivory shadow-sm transition-transform duration-200 ${
                    notifications[key] ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Change Password ────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-line bg-ivory p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream">
            <Lock size={16} className="text-gold" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-xl text-ink">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          {(
            [
              { name: "current", label: "Current Password",    field: "current" as const },
              { name: "next",    label: "New Password",         field: "next"    as const },
              { name: "confirm", label: "Confirm New Password", field: "confirm" as const },
            ] as const
          ).map(({ name, label, field }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label htmlFor={`pw-${name}`} className="eyebrow text-espresso-light">
                {label}
              </label>
              <div className="relative">
                <input
                  id={`pw-${name}`}
                  name={name}
                  type={showPasswords[field] ? "text" : "password"}
                  value={passwordForm[name]}
                  onChange={handlePasswordChange}
                  required
                  autoComplete={name === "current" ? "current-password" : "new-password"}
                  className="w-full rounded-lg border border-line bg-cream/40 px-4 py-3 pr-10 text-sm text-ink outline-none transition-colors focus:border-champagne focus:bg-ivory"
                />
                <button
                  type="button"
                  onClick={() => toggleShow(field)}
                  aria-label={showPasswords[field] ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso-light hover:text-ink"
                >
                  {showPasswords[field] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}

          {passwordError && (
            <p className="text-sm text-red-600">{passwordError}</p>
          )}

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-all hover:bg-espresso hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            >
              {savingPassword ? (
                <><Loader2 size={14} className="animate-spin" />Updating…</>
              ) : (
                "Update Password"
              )}
            </button>
            {passwordSaved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-700">
                <CheckCircle size={15} />
                Password updated
              </span>
            )}
          </div>
        </form>
      </section>

      {/* ── Privacy ───────────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-line bg-ivory p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream">
            <Shield size={16} className="text-gold" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-xl text-ink">Privacy</h2>
        </div>
        <p className="mb-5 text-sm text-espresso-light leading-relaxed max-w-xl">
          You can download a copy of your data or delete your account at any time.
          Account deletion is permanent and cannot be reversed.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownloadData}
            disabled={!profile}
            className="eyebrow rounded-full border border-line bg-cream px-5 py-2.5 text-espresso-light transition-colors hover:border-champagne hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Download My Data
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="eyebrow inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-red-700 transition-colors hover:bg-red-100"
          >
            <Trash2 size={13} />
            Delete Account
          </button>
        </div>
      </section>

      {/* ── Delete Confirm Modal ──────────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
          onClick={() => { if (!deleting) { setShowDeleteConfirm(false); setDeleteConfirmText(""); setDeleteError(""); } }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-line bg-ivory p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle size={20} className="text-red-600" />
            </div>

            <h3 className="mt-4 font-display text-xl text-ink">Delete Account?</h3>
            <p className="mt-2 text-sm text-espresso-light leading-relaxed">
              This will permanently erase your profile data, wishlist, and local preferences.
              Your order history will be anonymised. This action{" "}
              <span className="font-semibold text-ink">cannot be undone.</span>
            </p>

            {/* Typed confirmation */}
            <div className="mt-5">
              <label className="eyebrow text-espresso-light">
                Type <span className="font-bold text-red-600">{DELETE_PHRASE}</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => { setDeleteConfirmText(e.target.value.toUpperCase()); setDeleteError(""); }}
                placeholder={DELETE_PHRASE}
                disabled={deleting}
                className="mt-2 w-full rounded-lg border border-line bg-cream/40 px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-red-400 placeholder:text-espresso-light/40 disabled:opacity-50"
              />
            </div>

            {deleteError && (
              <p className="mt-3 text-xs text-red-600">{deleteError}</p>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); setDeleteError(""); }}
                disabled={deleting}
                className="flex-1 rounded-full border border-line bg-cream py-3 text-sm font-medium text-ink transition-colors hover:bg-cream/70 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== DELETE_PHRASE || deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-red-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <><Loader2 size={14} className="animate-spin" />Deleting…</>
                ) : (
                  <><Trash2 size={14} />Yes, Delete My Account</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
