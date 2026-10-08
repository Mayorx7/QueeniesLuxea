import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { destinationFor } from "../auth/redirects";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { from?: string; authMessage?: string } | null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return setError("Sign in is not configured yet. Add the public Supabase environment values first.");
    setSubmitting(true); setError("");
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError) return setError(signInError.message.toLowerCase().includes("confirm") ? "Confirm your email before signing in." : "Unable to sign in with those details.");
    const { data: profileData } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    navigate(destinationFor(profileData?.role, locationState?.from), { replace: true });
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
            onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
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

        <button
          type="submit"
          disabled={submitting || !isSupabaseConfigured}
          className="mt-2 w-full bg-ink py-4 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-espresso"
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
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
