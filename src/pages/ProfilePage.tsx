import { useState } from "react";
import { User, Camera, Save, CheckCircle } from "lucide-react";

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
}

const INITIAL: ProfileForm = {
  firstName: "Alexandra",
  lastName: "Whitmore",
  email: "a.whitmore@example.com",
  phone: "+1 212 555 0198",
  dob: "1990-04-12",
};

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>(INITIAL);
  const [saved, setSaved] = useState(false);

  const initials = `${form.firstName[0] ?? ""}${form.lastName[0] ?? ""}`.toUpperCase();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    // In production: fire API call here
  };

  return (
    <div className="fade-in space-y-8">
      {/* Avatar card */}
      <div className="rounded-2xl border border-line bg-ivory p-6 sm:p-8">
        <h2 className="mb-6 font-display text-xl text-ink">Profile Photo</h2>
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-champagne bg-cream">
              <span className="font-display text-3xl text-gold">{initials}</span>
            </div>
            <button
              type="button"
              aria-label="Change profile photo"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-ivory text-espresso-light shadow-sm transition-colors hover:text-ink"
            >
              <Camera size={14} />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <p className="font-display text-lg text-ink">
              {form.firstName} {form.lastName}
            </p>
            <p className="mt-0.5 text-sm text-espresso-light">{form.email}</p>
            <p className="mt-3 text-xs text-espresso-light">
              Member since March 2024
            </p>
          </div>
        </div>
      </div>

      {/* Personal details form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-line bg-ivory p-6 sm:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream">
            <User size={16} className="text-gold" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-xl text-ink">Personal Information</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* First name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="firstName" className="eyebrow text-espresso-light">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={form.firstName}
              onChange={handleChange}
              required
              className="rounded-lg border border-line bg-cream/40 px-4 py-3 text-sm text-ink placeholder-espresso-light/60 outline-none transition-colors focus:border-champagne focus:bg-ivory"
            />
          </div>

          {/* Last name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lastName" className="eyebrow text-espresso-light">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={handleChange}
              required
              className="rounded-lg border border-line bg-cream/40 px-4 py-3 text-sm text-ink placeholder-espresso-light/60 outline-none transition-colors focus:border-champagne focus:bg-ivory"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="email" className="eyebrow text-espresso-light">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="rounded-lg border border-line bg-cream/40 px-4 py-3 text-sm text-ink placeholder-espresso-light/60 outline-none transition-colors focus:border-champagne focus:bg-ivory"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="eyebrow text-espresso-light">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className="rounded-lg border border-line bg-cream/40 px-4 py-3 text-sm text-ink placeholder-espresso-light/60 outline-none transition-colors focus:border-champagne focus:bg-ivory"
            />
          </div>

          {/* Date of birth */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dob" className="eyebrow text-espresso-light">
              Date of Birth
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              className="rounded-lg border border-line bg-cream/40 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-champagne focus:bg-ivory"
            />
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-all hover:bg-espresso hover:scale-[1.02]"
          >
            <Save size={15} />
            Save Changes
          </button>

          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-700 animate-[fadeIn_0.4s_ease_both]">
              <CheckCircle size={15} />
              Saved successfully
            </span>
          )}
        </div>

        <p className="mt-5 text-xs text-espresso-light">
          This page is a frontend preview — changes are not persisted until a backend is connected.
        </p>
      </form>
    </div>
  );
}
