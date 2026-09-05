import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import SectionHeading from "../components/SectionHeading";

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: connect to auth provider
  };

  const inputCls =
    "w-full border border-espresso/25 bg-ivory px-4 py-3 text-sm text-ink focus:border-espresso focus:outline-none transition-colors";

  return (
    <div className="mx-auto max-w-sm px-5 py-16 sm:px-8 sm:py-24">
      <SectionHeading eyebrow="Join QueensLuxea" title="Create Account" align="center" className="mb-10" />

      <form onSubmit={handleSubmit} aria-label="Create account form" className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="reg-first" className="eyebrow mb-2 block text-espresso-light">First name</label>
            <input id="reg-first" required value={form.firstName} onChange={set("firstName")} className={inputCls} />
          </div>
          <div>
            <label htmlFor="reg-last" className="eyebrow mb-2 block text-espresso-light">Last name</label>
            <input id="reg-last" required value={form.lastName} onChange={set("lastName")} className={inputCls} />
          </div>
        </div>

        <div>
          <label htmlFor="reg-email" className="eyebrow mb-2 block text-espresso-light">Email</label>
          <input id="reg-email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} className={inputCls} />
        </div>

        <div>
          <label htmlFor="reg-password" className="eyebrow mb-2 block text-espresso-light">Password</label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={form.password}
              onChange={set("password")}
              className={inputCls + " pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso-light hover:text-espresso"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-espresso-light">Minimum 8 characters</p>
        </div>

        <p className="text-xs text-espresso-light">
          By creating an account you agree to our{" "}
          <Link to="/terms" className="link-underline text-espresso hover:text-gold">Terms of Service</Link>{" "}
          and{" "}
          <Link to="/privacy" className="link-underline text-espresso hover:text-gold">Privacy Policy</Link>.
        </p>

        <button
          type="submit"
          className="mt-2 w-full bg-ink py-4 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-espresso"
        >
          Create Account
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-espresso-light">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-ink link-underline hover:text-gold">Sign in</Link>
      </p>
    </div>
  );
}
