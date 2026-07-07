'use client'

import { useState, useTransition } from 'react'
import { Star, ChevronLeft, ChevronRight, Trash2, Send, AlertCircle } from 'lucide-react'
import type { ReviewData } from '@/components/features/CourtCard'

interface Props {
  reviews: ReviewData[]
  avgRating: number
  reviewCount: number
  courtId: string
  currentUserId: string | null
}

const INITIAL_REVIEWS_COUNT = 2
const REVIEWS_PER_PAGE = 5

/**
 * Formats a Date into a readable "Month Year" string in Asia/Manila timezone.
 */
function formatReviewDate(date: Date): string {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export default function CourtReviews({ reviews: initialReviews, avgRating, reviewCount, courtId, currentUserId }: Props) {
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Review form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState(false)
  const [isSubmitting, startSubmitTransition] = useTransition()

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Check if the current user already has a review
  const userHasReview = currentUserId
    ? reviews.some((r) => r.userId === currentUserId)
    : false

  const ratingDisplay = avgRating > 0 ? avgRating.toFixed(1) : 'New'

  // ── Submit review ────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(false)

    const trimmedDescription = description.trim()
    if (!trimmedDescription) {
      setFormError('Please write your review before submitting.')
      return
    }

    startSubmitTransition(async () => {
      try {
        const res = await fetch(`/api/courts/${courtId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim() || undefined,
            description: trimmedDescription,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          if (res.status === 409) {
            setFormError('You have already reviewed this court.')
          } else {
            setFormError(data.error || 'Failed to submit review.')
          }
          return
        }

        // Add new review to the top of the list
        const newReview: ReviewData = {
          id: data.review.id,
          userId: data.review.userId,
          author: data.review.author,
          title: data.review.title,
          description: data.review.description,
          createdAt: new Date(data.review.createdAt),
        }
        setReviews((prev) => [newReview, ...prev])
        setTitle('')
        setDescription('')
        setFormSuccess(true)
        setTimeout(() => setFormSuccess(false), 3000)
      } catch {
        setFormError('Network error. Please try again.')
      }
    })
  }

  // ── Delete review ────────────────────────────────────────────────────────────
  function handleDelete(reviewId: string) {
    setDeletingId(reviewId)

    fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json()
          console.error('Delete failed:', data.error)
          return
        }
        setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      })
      .catch((err) => {
        console.error('Delete error:', err)
      })
      .finally(() => {
        setDeletingId(null)
      })
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (reviews.length === 0 && !currentUserId) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-asphalt">Player Reviews</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-asphalt flex items-center gap-1 bg-primary/20 text-primary-fixed-variant px-3 py-1 rounded-full">
              <Star size={14} className="fill-current" />
              {ratingDisplay}
            </span>
            <span className="text-sm text-on-surface-variant">({reviewCount})</span>
          </div>
        </div>
        <div className="p-8 border border-dashed border-outline-variant rounded-2xl bg-mist text-center">
          <p className="text-sm text-on-surface-variant font-medium">No reviews yet. Be the first to book and review!</p>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE)

  // Calculate which reviews to show based on state
  let visibleReviews = reviews
  if (!isExpanded) {
    visibleReviews = reviews.slice(0, INITIAL_REVIEWS_COUNT)
  } else {
    const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE
    visibleReviews = reviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-asphalt">Player Reviews</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-asphalt flex items-center gap-1 bg-primary/20 text-primary-fixed-variant px-3 py-1 rounded-full">
            <Star size={14} className="fill-current" />
            {ratingDisplay}
          </span>
          <span className="text-sm text-on-surface-variant">({reviews.length})</span>
        </div>
      </div>

      {/* ── Write a Review Form ───────────────────────────────────────────── */}
      {currentUserId && !userHasReview && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 border border-outline rounded-2xl bg-surface-low">
          <h3 className="text-sm font-bold text-asphalt uppercase tracking-widest mb-4">Write a Review</h3>

          {/* Title (optional) */}
          <input
            id="review-title"
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="input mb-3"
          />

          {/* Description */}
          <textarea
            id="review-description"
            placeholder="Share your experience playing at this court…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={1000}
            required
            className="input resize-none"
          />

          {/* Error / Success messages */}
          {formError && (
            <div className="flex items-center gap-2 mt-3 text-sm text-error font-semibold">
              <AlertCircle size={16} />
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="mt-3 text-sm text-primary font-semibold">
              ✓ Review submitted successfully!
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-cta mt-4 text-sm"
          >
            {isSubmitting ? (
              <>
                <span className="spinner" />
                Submitting…
              </>
            ) : (
              <>
                <Send size={14} />
                Submit Review
              </>
            )}
          </button>
        </form>
      )}

      {/* Already reviewed message */}
      {currentUserId && userHasReview && (
        <div className="mb-6 px-4 py-3 bg-mist rounded-xl border border-outline text-sm text-on-surface-variant font-medium">
          ✓ You&apos;ve already reviewed this court.
        </div>
      )}

      {/* ── Review List ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {visibleReviews.map((review) => (
          <div key={review.id} className="p-5 border border-outline-variant rounded-2xl bg-surface shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col">
                <span className="font-bold text-asphalt">{review.author}</span>
                <span className="text-xs text-on-surface-variant mt-0.5">{formatReviewDate(review.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                {review.title && (
                  <span className="text-xs font-semibold text-on-surface-variant bg-mist px-2 py-1 rounded-md">
                    {review.title}
                  </span>
                )}
                {/* Delete button — visible for the review owner */}
                {currentUserId && review.userId === currentUserId && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container transition-colors disabled:opacity-50"
                    aria-label="Delete your review"
                    title="Delete your review"
                  >
                    {deletingId === review.id ? (
                      <span className="spinner" style={{ width: 14, height: 14 }} />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              &ldquo;{review.description}&rdquo;
            </p>
          </div>
        ))}
      </div>

      {/* Footer controls: View all / Pagination */}
      <div className="mt-6">
        {!isExpanded && reviews.length > INITIAL_REVIEWS_COUNT && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="btn btn-outline w-full"
          >
            View All {reviews.length} Reviews
          </button>
        )}

        {isExpanded && totalPages > 1 && (
          <div className="flex items-center justify-between bg-mist rounded-xl p-2 border border-outline-variant">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-asphalt hover:bg-surface hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all flex items-center gap-1 text-sm font-bold"
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <span className="text-sm font-semibold text-on-surface-variant">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-asphalt hover:bg-surface hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all flex items-center gap-1 text-sm font-bold"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        
        {isExpanded && (
           <button 
             onClick={() => {
               setIsExpanded(false)
               setCurrentPage(1)
             }}
             className="text-xs text-center w-full mt-4 text-on-surface-variant hover:text-asphalt font-medium underline underline-offset-2"
           >
             Show less
           </button>
        )}
      </div>
    </div>
  )
}
