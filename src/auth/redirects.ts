import type { UserRole } from "../context/AuthContext";

export function roleHome(role?: UserRole | null) {
  if (role === "admin") return "/admin";
  if (role === "vendor") return "/vendor";
  return "/account";
}

/** Never send a user to a dashboard their role cannot access. */
export function destinationFor(role: UserRole | null | undefined, requested?: string) {
  if (!requested || !requested.startsWith("/")) return roleHome(role);
  if (role === "admin" && requested.startsWith("/admin")) return requested;
  if (role === "vendor" && requested.startsWith("/vendor")) return requested;
  if (role === "customer" && requested.startsWith("/account")) return requested;
  return roleHome(role);
}
