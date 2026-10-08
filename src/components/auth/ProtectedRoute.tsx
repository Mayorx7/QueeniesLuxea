import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "../../context/AuthContext";
import { roleHome } from "../../auth/redirects";

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-espresso-light">Loading your account…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!user.email_confirmed_at) return <Navigate to="/login" replace state={{ from: location.pathname, authMessage: "Confirm your email before accessing your account." }} />;
  if (roles && !profile) return <div className="grid min-h-screen place-items-center text-sm text-espresso-light">Preparing your account…</div>;
  if (roles && profile && !roles.includes(profile.role)) return <Navigate to={roleHome(profile.role)} replace />;
  return <Outlet />;
}
