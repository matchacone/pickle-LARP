'use client'

import { useState } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import type { MockReview } from '@/components/features/CourtCard'

interface Props {
  reviews: MockReview[]
  rating: number
  reviewCount: number
}

const INITIAL_REVIEWS_COUNT = 2
const REVIEWS_PER_PAGE = 5

export default function CourtReviews({ reviews, rating, reviewCount }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  if (!reviews || reviews.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-asphalt">Player Reviews</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-asphalt flex items-center gap-1 bg-primary/20 text-primary-fixed-variant px-3 py-1 rounded-full">
              <Star size={14} className="fill-current" />
              {rating.toFixed(1)}
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
            {rating.toFixed(1)}
          </span>
          <span className="text-sm text-on-surface-variant">({reviewCount})</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {visibleReviews.map((review) => (
          <div key={review.id} className="p-5 border border-outline-variant rounded-2xl bg-white shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col">
                <span className="font-bold text-asphalt">{review.author}</span>
                <span className="text-xs text-on-surface-variant mt-0.5">{review.date}</span>
              </div>
              <div className="flex gap-0.5 text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-mist fill-current"} />
                ))}
              </div>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              "{review.text}"
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
              className="p-2 rounded-lg text-asphalt hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all flex items-center gap-1 text-sm font-bold"
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
              className="p-2 rounded-lg text-asphalt hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all flex items-center gap-1 text-sm font-bold"
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
