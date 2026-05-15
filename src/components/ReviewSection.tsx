import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star,
  Trash2,
  MessageSquare,
  Loader2,
  LogIn,
  ChevronDown,
  StarHalf,
} from 'lucide-react';
import { toast } from 'sonner';
import { reviewsApi, Review, ReviewsResponse } from '@/api/reviews';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import axios from 'axios';

/* ────────────────────────────────────────────
   Helper — build API base from env (same as apiClient)
──────────────────────────────────────────── */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

/* ────────────────────────────────────────────
   StarDisplay — read-only, supports half stars
──────────────────────────────────────────── */
interface StarDisplayProps {
  value: number; // e.g. 4.2
  size?: number;
}

const StarDisplay = ({ value, size = 16 }: StarDisplayProps) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((pos) => {
        const filled = value >= pos;
        const half = !filled && value >= pos - 0.5;
        return (
          <span key={pos} className="relative inline-block" style={{ width: size, height: size }}>
            {/* Grey base */}
            <Star
              size={size}
              className="fill-gray-200 text-gray-200 absolute inset-0"
            />
            {filled ? (
              <Star size={size} className="fill-amber-400 text-amber-400 absolute inset-0" />
            ) : half ? (
              <StarHalf size={size} className="fill-amber-400 text-amber-400 absolute inset-0" />
            ) : null}
          </span>
        );
      })}
    </div>
  );
};

/* ────────────────────────────────────────────
   StarPicker — interactive 5-star selector
──────────────────────────────────────────── */
interface StarPickerProps {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}

const StarPicker = ({ value, onChange, size = 24 }: StarPickerProps) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 focus:outline-none"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= display
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

/* ────────────────────────────────────────────
   RatingBars — 5★ to 1★ distribution bars
   Uses ratingDistribution from full data (all reviews),
   not just current page.
──────────────────────────────────────────── */
interface RatingBarsProps {
  distribution: Record<number, number>; // { 5: count, 4: count, … }
  total: number;
}

const RatingBars = ({ distribution, total }: RatingBarsProps) => {
  return (
    <div className="space-y-1.5 w-full">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[star] ?? 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-3 text-right font-medium text-gray-700">{star}</span>
            <Star size={10} className="fill-amber-400 text-amber-400 flex-shrink-0" />
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-7 text-right tabular-nums">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
};

/* ────────────────────────────────────────────
   ReviewCard — single review row
──────────────────────────────────────────── */
interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  onDelete: () => void;
  isDeleting: boolean;
}

const ReviewCard = ({ review, currentUserId, onDelete, isDeleting }: ReviewCardProps) => {
  const isOwn = !!currentUserId && review.userId._id === currentUserId;
  const initials = review.userId.name
    ? review.userId.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        {/* Left: avatar + name + date */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-none">
              {review.userId.name}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {new Date(review.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Right: stars + delete */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <StarDisplay value={review.rating} size={13} />
          {isOwn && (
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Delete my review"
              aria-label="Delete review"
            >
              {isDeleting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
            </button>
          )}
        </div>
      </div>

      {review.comment && (
        <p className="text-sm text-gray-600 leading-relaxed pl-12">{review.comment}</p>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────
   WriteReviewForm
──────────────────────────────────────────── */
const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

interface WriteReviewFormProps {
  productId: string;
  existingReview?: Review | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const WriteReviewForm = ({
  productId,
  existingReview,
  onSuccess,
  onCancel,
}: WriteReviewFormProps) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? '');

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment ?? '');
    }
  }, [existingReview]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      reviewsApi.submitReview(productId, { rating, comment: comment.trim() || undefined }),
    onSuccess: () => {
      toast.success(existingReview ? '✅ Review updated!' : '✅ Review submitted! Thank you.');
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      onSuccess();
    },
    onError: (err: Error) => toast.error(`❌ ${err.message}`),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Please select a star rating first');
      return;
    }
    mutate();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">
          {existingReview ? 'Update your review' : 'Write a review'}
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Star picker + label */}
      <div className="flex items-center gap-3">
        <StarPicker value={rating} onChange={setRating} size={26} />
        {rating > 0 && (
          <span className="text-sm font-medium text-amber-600">{RATING_LABELS[rating]}</span>
        )}
      </div>

      {/* Comment textarea */}
      <textarea
        id={`review-comment-${productId}`}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your thoughts… (optional)"
        maxLength={1000}
        rows={3}
        className="w-full text-sm rounded-lg border border-gray-200 bg-white px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent placeholder-gray-400 transition"
      />

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-400">{comment.length}/1000</span>
        <Button
          type="submit"
          id={`submit-review-btn-${productId}`}
          disabled={isPending || rating < 1}
          size="sm"
          className="bg-[#0C8A00] hover:bg-[#0a7700] text-white text-sm font-semibold rounded-lg px-5 disabled:opacity-60"
        >
          {isPending ? (
            <span className="flex items-center gap-1.5">
              <Loader2 size={14} className="animate-spin" />
              Saving…
            </span>
          ) : existingReview ? (
            'Update Review'
          ) : (
            'Submit Review'
          )}
        </Button>
      </div>
    </form>
  );
};

/* ────────────────────────────────────────────
   Main ProductReviews component
──────────────────────────────────────────── */
interface ProductReviewsProps {
  productId: string;
  productName?: string;
}

interface ReviewState {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
  pagination: ReviewsResponse['pagination'] | null;
}

const ProductReviews = ({ productId, productName = 'this product' }: ProductReviewsProps) => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [state, setState] = useState<ReviewState>({
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
    distribution: {},
    pagination: null,
  });

  /* ── Fetch reviews (page 1 = fresh, page > 1 = append) ── */
  const fetchReviews = useCallback(
    async (targetPage: number, append = false) => {
      if (append) setIsLoadingMore(true);
      else setIsFetching(true);

      try {
        const data = await reviewsApi.getProductReviews(productId, targetPage);

        /* Build distribution from all reviews fetched so far + new page */
        setState((prev) => {
          const allReviews = append ? [...prev.reviews, ...data.reviews] : data.reviews;

          // Distribution across the full product (use product totals from backend)
          // We recalculate from accumulated reviews (best effort — not necessarily all reviews)
          const dist: Record<number, number> = {};
          allReviews.forEach((r) => {
            dist[r.rating] = (dist[r.rating] ?? 0) + 1;
          });

          return {
            reviews: allReviews,
            averageRating: data.product.averageRating,
            totalReviews: data.product.totalReviews,
            distribution: dist,
            pagination: data.pagination,
          };
        });
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to load reviews');
      } finally {
        setIsFetching(false);
        setIsLoadingMore(false);
      }
    },
    [productId]
  );

  /* Initial load */
  useEffect(() => {
    setPage(1);
    setState({ reviews: [], averageRating: 0, totalReviews: 0, distribution: {}, pagination: null });
    fetchReviews(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  /* Load more handler */
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, true);
  };

  /* Refresh after submit / delete */
  const refreshReviews = () => {
    setPage(1);
    setState({ reviews: [], averageRating: 0, totalReviews: 0, distribution: {}, pagination: null });
    fetchReviews(1, false);
    queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
  };

  /* Delete mutation */
  const { mutate: deleteReview, isPending: isDeleting } = useMutation({
    mutationFn: () => reviewsApi.deleteReview(productId),
    onSuccess: () => {
      toast.success('Review deleted');
      refreshReviews();
    },
    onError: (err: Error) => toast.error(`❌ ${err.message}`),
  });

  /* Current user's own review */
  const myReview = user
    ? state.reviews.find((r) => r.userId._id === user.id) ?? null
    : null;

  const avg = state.averageRating;
  const total = state.totalReviews;
  const hasMore = state.pagination ? state.pagination.hasNextPage : false;

  return (
    <section id={`reviews-${productId}`} className="mt-8 space-y-5">
      {/* ── Section header ── */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-[#0C8A00]" />
        <h2 className="text-lg font-bold text-gray-900">Ratings &amp; Reviews</h2>
      </div>

      {/* ══════════════════════════════════════════
          RATING SUMMARY CARD
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row gap-6 items-center">
        {/* Big score + stars + "X out of 5" */}
        <div className="flex flex-col items-center gap-1.5 sm:pr-6 sm:border-r sm:border-gray-100 flex-shrink-0">
          <span className="text-5xl font-extrabold text-gray-900 leading-none tabular-nums">
            {avg > 0 ? avg.toFixed(1) : '—'}
          </span>
          <StarDisplay value={avg} size={20} />
          <span className="text-xs text-gray-500 font-medium">
            {avg > 0 ? `${avg.toFixed(1)} out of 5` : 'No ratings yet'}
          </span>
          <span className="text-[11px] text-gray-400">
            ({total} {total === 1 ? 'rating' : 'ratings'})
          </span>
        </div>

        {/* % distribution bars */}
        {total > 0 ? (
          <RatingBars distribution={state.distribution} total={total} />
        ) : (
          <p className="text-sm text-gray-400 flex-1 text-center italic">
            No reviews yet — be the first!
          </p>
        )}
      </div>

      {/* ══════════════════════════════════════════
          WRITE A REVIEW / LOGIN PROMPT
      ══════════════════════════════════════════ */}
      {isAuthenticated ? (
        showForm ? (
          <WriteReviewForm
            productId={productId}
            existingReview={myReview}
            onSuccess={() => {
              setShowForm(false);
              refreshReviews();
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <button
            id={`open-review-form-${productId}`}
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-green-200 text-sm font-semibold text-[#0C8A00] hover:bg-green-50 transition-colors"
          >
            <Star size={15} className="fill-amber-400 text-amber-400" />
            {myReview ? 'Edit your review' : `Rate ${productName}`}
          </button>
        )
      ) : (
        /* Not logged in */
        <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 gap-3">
          <div className="flex items-center gap-2 text-sm text-amber-700 font-medium">
            <LogIn size={15} className="text-amber-500" />
            Login to write a review
          </div>
          <a
            href="/auth"
            id="login-to-review-link"
            className="text-xs font-bold text-[#0C8A00] hover:underline whitespace-nowrap"
          >
            Login →
          </a>
        </div>
      )}

      {/* ══════════════════════════════════════════
          REVIEWS LIST
      ══════════════════════════════════════════ */}
      {isFetching ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : state.reviews.length === 0 ? (
        <div className="text-center py-10 space-y-2">
          <Star size={36} className="fill-gray-200 text-gray-200 mx-auto" />
          <p className="text-sm font-semibold text-gray-500">No reviews yet</p>
          <p className="text-xs text-gray-400">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {state.reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              currentUserId={user?.id}
              onDelete={() => deleteReview()}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}

      {/* ── Load More button ── */}
      {hasMore && !isFetching && (
        <div className="flex justify-center pt-2">
          <button
            id={`load-more-reviews-${productId}`}
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoadingMore ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Loading…
              </>
            ) : (
              <>
                <ChevronDown size={15} />
                Load More Reviews
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
};

/* ────────────────────────────────────────────
   Re-export as ReviewSection for backward compat
   (ProductDetail.tsx imports ReviewSection)
──────────────────────────────────────────── */
export { ProductReviews };
export default ProductReviews;
