import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import { supabase } from "../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!supabase) return;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, { 
      redirectTo: `${window.location.origin}/reset-password` 
    });
    
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  const inputCls =
    "w-full border border-espresso/25 bg-ivory px-4 py-3 text-sm text-ink focus:border-espresso focus:outline-none transition-colors";

  return (
    <div className="mx-auto max-w-sm px-5 py-16 sm:px-8 sm:py-24">
      {sent ? (
        <div className="flex flex-col items-center text-center">
          <CheckCircle size={40} className="text-gold" strokeWidth={1.25} aria-hidden="true" />
          <p className="mt-6 font-display text-2xl text-ink">Check your inbox</p>
          <p className="mt-3 text-sm text-espresso-light">
            If an account exists for <span className="font-semibold">{email}</span>, we've sent a password reset link.
          </p>
          <Link
            to="/login"
            className="eyebrow mt-8 bg-ink px-8 py-3.5 text-ivory transition-colors hover:bg-espresso"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <>
          <SectionHeading
            eyebrow="Account"
            title="Reset Password"
            align="center"
            className="mb-4"
          />
          <p className="mb-10 text-center text-sm text-espresso-light">
            Enter the email address associated with your account and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} aria-label="Password reset form" className="flex flex-col gap-5">
            <div>
              <label htmlFor="forgot-email" className="eyebrow mb-2 block text-espresso-light">Email</label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-ink py-4 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-espresso"
            >
              Send Reset Link
            </button>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          </form>

          <p className="mt-8 text-center text-sm text-espresso-light">
            Remember your password?{" "}
            <Link to="/login" className="font-semibold text-ink link-underline hover:text-gold">Sign in</Link>
          </p>
        </>
      )}
    </div>
  );
}
