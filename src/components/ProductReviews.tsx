import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useToast } from "../context/ToastContext";

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  
  // We use localStorage to mock the database since we can't run the SQL migration here.
  // In a real environment, this would be a Supabase fetch to the `reviews` table.
  const [allReviews, setAllReviews] = useLocalStorage<Review[]>("ql_product_reviews", []);
  
  const productReviews = allReviews
    .filter((r) => r.productId === productId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const averageRating = productReviews.length > 0 
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length 
    : 0;

  const userHasReviewed = user ? productReviews.some((r) => r.userId === user.id) : false;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (rating === 0) {
      showToast("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const newReview: Review = {
      id: crypto.randomUUID(),
      productId,
      userId: user.id,
      userName: [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Verified Buyer",
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    setAllReviews([...allReviews, newReview]);
    setIsSubmitting(false);
    setShowForm(false);
    setComment("");
    setRating(5);
    showToast("Review submitted successfully");
  };

  return (
    <div className="border-t border-line pt-16 mt-16">
      <div className="flex flex-col md:flex-row gap-10 md:gap-16">
        
        {/* Left Side: Summary */}
        <div className="w-full md:w-1/3 shrink-0">
          <h2 className="font-display text-2xl text-ink">Customer Reviews</h2>
          
          <div className="mt-6 flex items-center gap-4">
            <div className="font-display text-5xl text-ink">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </div>
            <div>
              <div className="flex gap-1 text-gold mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={16} 
                    className={star <= Math.round(averageRating) ? "fill-gold" : "text-line"} 
                  />
                ))}
              </div>
              <p className="text-sm text-espresso-light">
                Based on {productReviews.length} {productReviews.length === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = productReviews.filter(r => r.rating === stars).length;
              const percentage = productReviews.length > 0 ? (count / productReviews.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-sm">
                  <div className="w-12 text-espresso-light flex items-center gap-1">
                    {stars} <Star size={12} className="fill-gold text-gold" />
                  </div>
                  <div className="flex-1 h-2 bg-cream rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gold rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-espresso-light">{count}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-line">
            <h3 className="font-display text-lg text-ink mb-2">Share your thoughts</h3>
            <p className="text-sm text-espresso-light mb-5">
              If you’ve used this product, share your thoughts with other customers.
            </p>
            {!user ? (
              <Link 
                to="/login"
                className="flex items-center justify-center w-full rounded-full border border-ink/40 bg-transparent px-5 py-3 text-sm font-semibold text-ink hover:bg-ink hover:text-ivory transition-colors text-center"
              >
                Sign in to write a review
              </Link>
            ) : userHasReviewed ? (
              <p className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-100 text-center">
                You've already reviewed this product.
              </p>
            ) : !showForm ? (
              <button 
                onClick={() => setShowForm(true)}
                className="w-full rounded-full border border-ink bg-transparent px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-ivory"
              >
                Write a Review
              </button>
            ) : null}
          </div>
        </div>

        {/* Right Side: Reviews List & Form */}
        <div className="flex-1">
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-10 bg-ivory border border-line rounded-2xl p-6 sm:p-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <h3 className="font-display text-xl text-ink mb-6">Write a review for {productName}</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-ink mb-2">Overall Rating *</label>
                <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        size={24} 
                        className={`transition-colors ${
                          star <= (hoverRating || rating) ? "fill-gold text-gold" : "text-line"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-semibold text-ink mb-2">
                  Your Review *
                </label>
                <textarea
                  id="comment"
                  required
                  rows={4}
                  placeholder="What did you like or dislike? What should other shoppers know?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-xl border border-line bg-cream/40 p-4 text-sm text-ink outline-none transition-colors focus:border-champagne focus:bg-ivory resize-y"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                  className="rounded-full border border-line bg-cream px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-cream/70 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !comment.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-espresso disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><Loader2 size={14} className="animate-spin" /> Submitting…</>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-8">
            {productReviews.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-line rounded-2xl bg-cream/30">
                <Star size={32} className="mx-auto text-gold mb-3 opacity-50" />
                <h4 className="font-display text-lg text-ink mb-1">No reviews yet</h4>
                <p className="text-sm text-espresso-light">Be the first to review this product.</p>
              </div>
            ) : (
              productReviews.map((review) => (
                <div key={review.id} className="border-b border-line pb-8 last:border-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-espresso font-semibold shrink-0">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">{review.userName}</p>
                        <p className="text-xs text-espresso-light mt-0.5">
                          {new Date(review.createdAt).toLocaleDateString('en-GB', { 
                            day: 'numeric', month: 'long', year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={14} 
                          className={star <= review.rating ? "fill-gold text-gold" : "text-line"} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-espresso leading-relaxed mt-4 pl-[52px]">
                    {review.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
