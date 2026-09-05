import { useEffect, type ReactNode } from "react";
import { useLocation, Outlet } from "react-router-dom";
import AnnouncementBar from "./AnnouncementBar";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";

export default function Layout({ children }: { children?: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0 });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-ivory)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[var(--color-ink)] focus:px-4 focus:py-2 focus:text-[var(--color-ivory)]"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="flex-1 mobile-nav-safe">
        {children || <Outlet />}
      </main>
      <Footer />
      {/* Fixed bottom nav — mobile only (md:hidden inside BottomNav) */}
      <BottomNav />
    </div>
  );
}
