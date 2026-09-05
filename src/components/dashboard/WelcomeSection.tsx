import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface WelcomeSectionProps {
  customerName: string;
}

export default function WelcomeSection({ customerName }: WelcomeSectionProps) {
  return (
    <div className="mb-8 rounded-2xl bg-gradient-to-r from-ivory to-cream border border-line p-6 sm:p-8 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-champagne-light/30 blur-3xl"></div>
      
      <div className="relative z-10">
        <h2 className="font-display text-2xl text-ink sm:text-3xl">
          Welcome back, {customerName}
        </h2>
        <p className="mt-2 text-espresso-light max-w-xl">
          Here's what's happening with your account today. View your latest orders, 
          manage your wishlist, and update your preferences.
        </p>
        
        <div className="mt-6">
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition-transform hover:scale-105"
          >
            Continue Shopping
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
