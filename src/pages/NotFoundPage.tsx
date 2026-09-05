import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import EmptyState from "../components/EmptyState";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 sm:px-8">
      <EmptyState
        icon={Compass}
        title="This page has wandered off"
        message="The page you're looking for doesn't exist, or may have moved."
        action={
          <Link to="/" className="eyebrow bg-ink px-6 py-3 text-ivory transition-colors hover:bg-espresso">
            Return Home
          </Link>
        }
      />
    </div>
  );
}
