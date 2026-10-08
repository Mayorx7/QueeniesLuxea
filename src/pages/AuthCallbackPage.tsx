import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { destinationFor } from "../auth/redirects";

function friendlyError(code: string | null, description: string | null) {
  if (code === "otp_expired" || code === "access_denied") return "This verification link has expired or is invalid. Request a new confirmation email and try again.";
  return description || "We could not complete that secure link. Please try signing in again.";
}

export default function AuthCallbackPage() {
  const { user, profile, loading } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const error = params.get("error");
  const next = params.get("next") || undefined;

  useEffect(() => {
    if (!error && !loading && user?.email_confirmed_at) {
      navigate(destinationFor(profile?.role, next), { replace: true });
    }
  }, [error, loading, navigate, next, profile?.role, user?.email_confirmed_at]);

  if (error) return <Status title="Unable to verify email" message={friendlyError(params.get("error_code"), params.get("error_description"))} />;
  if (!loading && !user) return <Status title="Verification incomplete" message="Please sign in to continue. If your confirmation link has expired, request a new one from the sign-in page." />;
  return <div className="grid min-h-[55vh] place-items-center px-5 text-center text-sm text-espresso-light">Finishing your sign-in…</div>;
}

function Status({ title, message }: { title: string; message: string }) {
  return <div className="mx-auto max-w-md px-5 py-20 text-center">
    <h1 className="font-display text-3xl text-ink">{title}</h1>
    <p className="mt-4 text-sm leading-relaxed text-espresso-light">{message}</p>
    <Link to="/login" className="eyebrow mt-8 inline-block bg-ink px-7 py-3 text-ivory">Go to sign in</Link>
  </div>;
}
