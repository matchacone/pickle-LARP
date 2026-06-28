// ─── Loading skeleton for /courts ─────────────────────────────────────────────
// Shows while the RSC page.tsx is streaming. Matches the CourtGrid layout.

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      {/* Image area */}
      <div className="skeleton h-44 rounded-none" />
      {/* Body */}
      <div className="p-4 flex flex-col gap-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-1/3 mt-1" />
        <div className="flex gap-1 mt-1">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-20 rounded-full" />
        </div>
        <div className="skeleton h-10 w-full mt-1 rounded-lg" />
      </div>
    </div>
  )
}

export default function CourtsLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header placeholder */}
      <div className="h-16 border-b border-outline" />

      <div className="container-page py-10">
        {/* Page title skeleton */}
        <div className="mb-8">
          <div className="skeleton h-8 w-48 mb-2" />
          <div className="skeleton h-4 w-72" />
        </div>

        {/* Filter bar skeleton */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-9 w-24 rounded-lg" />
          ))}
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
