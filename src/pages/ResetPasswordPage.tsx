import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeading from "../components/SectionHeading";
import { supabase } from "../lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 12) return setError("Use at least 12 characters for your new password.");
    if (!supabase) return setError("Authentication is not configured yet.");
    setSaving(true); setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) return setError(updateError.message);
    navigate("/account", { replace: true });
  };
  return <div className="mx-auto max-w-sm px-5 py-16 sm:px-8 sm:py-24">
    <SectionHeading eyebrow="Account" title="Choose a new password" align="center" className="mb-10" />
    <form onSubmit={submit} className="flex flex-col gap-5">
      <label className="eyebrow text-espresso-light" htmlFor="new-password">New password
        <input id="new-password" className="mt-2 w-full border border-espresso/25 bg-ivory px-4 py-3 text-sm text-ink focus:border-espresso focus:outline-none" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={saving} className="bg-ink py-4 text-xs font-semibold uppercase tracking-widest text-ivory disabled:opacity-60">{saving ? "Updating…" : "Update password"}</button>
    </form>
  </div>;
}
