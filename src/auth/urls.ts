const DEFAULT_APP_URL = "https://queeniesluxea.vercel.app";

/**
 * Authentication emails must always return to a public URL. Falling back to
 * window.location.origin would put localhost links into real users' inboxes
 * whenever an admin requests a reset from a local development copy.
 */
export const appUrl = (import.meta.env.VITE_APP_URL ?? DEFAULT_APP_URL).replace(/\/$/, "");

export function authRedirect(path: "/auth/callback" | "/reset-password") {
  return `${appUrl}${path}`;
}
