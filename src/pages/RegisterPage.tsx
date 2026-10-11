import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Eye, EyeOff, Mail } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { destinationFor } from "../auth/redirects";

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return setError("Account creation is not configured yet. Add the public Supabase environment values first.");
    if (form.password.length < 12) return setError("Use a password with at least 12 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    setSubmitting(true); setError("");
    const { data, error: signUpError } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: { first_name: form.firstName, last_name: form.lastName } } });
    setSubmitting(false);
    if (signUpError) return setError(signUpError.message);
    if (data.session) {
      const { data: profileData } = await supabase.from("profiles").select("role").eq("id", data.user?.id).maybeSingle();
      navigate(destinationFor(profileData?.role), { replace: true });
      return;
    }
    setConfirmationEmail(form.email);
    setMessage("We sent you a confirmation email.");
  };

  const resendConfirmation = async () => {
    if (!supabase || !confirmationEmail) return;
    setResending(true); setError("");
    const { error: resendError } = await supabase.auth.resend({ type: "signup", email: confirmationEmail, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    setResending(false);
    if (resendError) return setError(resendError.message);
    setMessage("A new confirmation email has been sent.");
  };

  const inputCls =
    "w-full border border-espresso/25 bg-ivory px-4 py-3 text-sm text-ink focus:border-espresso focus:outline-none transition-colors";

  if (confirmationEmail) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-16 text-center sm:px-8 sm:py-24">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream text-gold"><Mail size={30} strokeWidth={1.5} aria-hidden="true" /></div>
        <h1 className="mt-6 font-display text-3xl text-ink">Confirm your email</h1>
        <p className="mt-4 text-sm leading-relaxed text-espresso-light">We sent a confirmation link to <span className="font-semibold text-ink">{confirmationEmail}</span>. Open it to activate your account, then you’ll be taken to your dashboard.</p>
        <div className="mt-8 w-full rounded-xl border border-line bg-cream/40 p-4 text-left text-sm text-espresso-light">
          <p className="flex items-center gap-2 font-medium text-ink"><CheckCircle size={16} className="text-gold" /> What to do next</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5"><li>Check your inbox and spam folder.</li><li>Open the QueensLuxea confirmation email.</li><li>Use the link inside it to finish creating your account.</li></ol>
        </div>
        <button type="button" disabled={resending} onClick={() => void resendConfirmation()} className="mt-7 text-sm font-semibold text-espresso underline underline-offset-4 disabled:opacity-60">{resending ? "Sending confirmation…" : "Resend confirmation email"}</button>
        {message && <p role="status" className="mt-3 text-sm text-emerald-700">{message}</p>}
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <Link to="/login" state={{ email: confirmationEmail, authMessage: "Once you’ve confirmed your email, sign in to continue." }} className="eyebrow mt-8 bg-ink px-7 py-3 text-ivory transition-colors hover:bg-espresso">Continue to sign in</Link>
      </div>
    );
  }

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
              minLength={12}
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
          <p className="mt-1.5 text-xs text-espresso-light">Minimum 12 characters</p>
        </div>

        <div>
          <label htmlFor="reg-confirm-password" className="eyebrow mb-2 block text-espresso-light">Confirm password</label>
          <div className="relative">
            <input
              id="reg-confirm-password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={12}
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
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
        </div>

        <p className="text-xs text-espresso-light">
          By creating an account you agree to our{" "}
          <Link to="/terms" className="link-underline text-espresso hover:text-gold">Terms of Service</Link>{" "}
          and{" "}
          <Link to="/privacy" className="link-underline text-espresso hover:text-gold">Privacy Policy</Link>.
        </p>

        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !isSupabaseConfigured}
          className="mt-2 w-full bg-ink py-4 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-espresso"
        >
          {submitting ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-espresso-light">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-ink link-underline hover:text-gold">Sign in</Link>
      </p>
    </div>
  );
}
