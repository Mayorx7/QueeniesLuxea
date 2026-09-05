import { useState, type FormEvent } from "react";

interface NewsletterFormProps {
  variant?: "light" | "dark";
}

export default function NewsletterForm({ variant = "light" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isDark = variant === "dark";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className={`fade-in text-sm ${isDark ? "text-ivory" : "text-espresso"}`}>
        You're on the list. Watch your inbox for the first word on new arrivals.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-sm">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div
        className={`flex items-stretch border-b ${isDark ? "border-ivory/40" : "border-espresso/30"}`}
      >
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-invalid={!!error}
          aria-describedby={error ? "newsletter-error" : undefined}
          className={`w-full bg-transparent py-2.5 text-sm placeholder:opacity-60 focus:outline-none ${
            isDark ? "text-ivory placeholder:text-ivory" : "text-espresso placeholder:text-espresso"
          }`}
        />
        <button
          type="submit"
          className={`eyebrow shrink-0 whitespace-nowrap px-1 text-xs ${
            isDark ? "text-gold-light" : "text-gold"
          } link-underline`}
        >
          Subscribe
        </button>
      </div>
      {error && (
        <p id="newsletter-error" className="mt-2 text-xs text-red-800">
          {error}
        </p>
      )}
    </form>
  );
}
