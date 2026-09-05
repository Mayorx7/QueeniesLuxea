export default function VendorPlaceholder() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center fade-in">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream">
        <span className="font-display text-2xl text-gold">🚧</span>
      </div>
      <h2 className="font-display text-2xl text-ink mb-2">Under Construction</h2>
      <p className="text-espresso-light max-w-md">
        This section of the vendor dashboard is currently being built. Please check back later.
      </p>
    </div>
  );
}
