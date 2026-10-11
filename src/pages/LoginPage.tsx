import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { destinationFor } from "../auth/redirects";

type LoginState = { from?: string; authMessage?: string; email?: string } | null;

function signInErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("confirm") || normalized.includes("not confirmed")) return "Confirm your email before signing in.";
  if (normalized.includes("invalid login credentials") || normalized.includes("invalid credentials")) return "Email or password is incorrect. Please check your details and try again.";
  if (normalized.includes("email not confirmed")) return "Confirm your email before signing in.";
  if (normalized.includes("rate limit") || normalized.includes("too many requests")) return "Too many sign-in attempts. Please wait a few minutes and try again.";
  if (normalized.includes("network") || normalized.includes("fetch") || normalized.includes("failed to load")) return "We could not reach the sign-in service. Check your internet connection and try again.";
  return "We could not sign you in right now. Please try again.";
}

export default function LoginPage() {
  const location = useLocation();
  const locationState = location.state as LoginState;
  const [email, setEmail] = useState(locationState?.email ?? "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return setError("Sign in is not configured yet. Add the public Supabase environment values first.");
    setSubmitting(true); setError(""); setNeedsConfirmation(false); setConfirmationMessage("");
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError) {
      const friendlyMessage = signInErrorMessage(signInError.message);
      if (friendlyMessage === "Confirm your email before signing in.") {
        setNeedsConfirmation(true);
        return setError(friendlyMessage);
      }
      return setError(friendlyMessage);
    }
    const { data: profileData } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    navigate(destinationFor(profileData?.role, locationState?.from), { replace: true });
  };

  const resendConfirmation = async () => {
    if (!supabase || !email) return;
    setResending(true); setError("");
    const { error: resendError } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    setResending(false);
    if (resendError) return setError(resendError.message);
    setConfirmationMessage("A new confirmation email has been sent. Check your inbox and spam folder.");
  };

  const signInWithProvider = async (provider: "google" | "apple") => {
    if (!supabase) return setError("Sign in is not configured yet.");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/auth/callback` } });
    if (oauthError) setError(oauthError.message);
  };

  const inputCls =
    "w-full border border-espresso/25 bg-ivory px-4 py-3 text-sm text-ink focus:border-espresso focus:outline-none transition-colors";

  return (
    <div className="mx-auto max-w-sm px-5 py-16 sm:px-8 sm:py-24">
      <SectionHeading eyebrow="Welcome Back" title="Sign In" align="center" className="mb-10" />
      {locationState?.authMessage && <p role="status" className="mb-5 text-center text-sm text-espresso-light">{locationState.authMessage}</p>}

      <form onSubmit={handleSubmit} aria-label="Sign in form" className="flex flex-col gap-5">
        <div>
          <label htmlFor="login-email" className="eyebrow mb-2 block text-espresso-light">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); setNeedsConfirmation(false); }}
            className={inputCls}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="login-password" className="eyebrow text-espresso-light">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs text-espresso-light link-underline hover:text-gold">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className={inputCls + " pr-12"}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-0 top-0 flex h-full min-h-[44px] w-11 items-center justify-center text-espresso-light hover:text-espresso"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !isSupabaseConfigured}
          className="mt-2 w-full bg-ink py-4 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-espresso"
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {needsConfirmation && <button type="button" disabled={resending} onClick={() => void resendConfirmation()} className="-mt-2 self-start text-sm font-semibold text-espresso underline underline-offset-4 disabled:opacity-60">{resending ? "Sending confirmation…" : "Resend confirmation email"}</button>}
        {confirmationMessage && <p role="status" className="text-sm text-emerald-700">{confirmationMessage}</p>}
      </form>

      <p className="mt-8 text-center text-sm text-espresso-light">
        New to QueensLuxea?{" "}
        <Link to="/register" className="font-semibold text-ink link-underline hover:text-gold">
          Create an account
        </Link>
      </p>

      <div className="mt-10 border-t border-line pt-8 text-center">
        <p className="mb-4 text-xs text-espresso-light uppercase tracking-widest">Or continue with</p>
        <div className="flex flex-col gap-3">
          {["Google", "Apple"].map((provider) => (
            <button
              key={provider}
              type="button"
              onClick={() => void signInWithProvider(provider.toLowerCase() as "google" | "apple")}
              className="w-full border border-espresso/25 py-3 text-xs font-semibold uppercase tracking-wider text-espresso transition-colors hover:border-espresso hover:bg-cream"
            >
              Continue with {provider}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
