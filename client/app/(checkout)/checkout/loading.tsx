export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header skeleton */}
      <header className="border-b border-outline bg-white">
        <div className="container-page flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="skeleton w-16 h-5" />
            <div className="w-px h-6 bg-outline" />
            <div className="flex items-center gap-1.5">
              <div className="skeleton w-8 h-8 rounded-lg" />
              <div className="skeleton w-20 h-5" />
            </div>
          </div>
          <div className="skeleton w-28 h-4" />
        </div>
      </header>

      <div className="container-page py-8 md:py-12">
        {/* Step indicator skeleton */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <div className="skeleton w-8 h-8 rounded-full" />
                <div className="skeleton w-12 h-3" />
              </div>
              {i < 3 && <div className="skeleton w-16 md:w-24 h-0.5 mb-5" />}
            </div>
          ))}
        </div>

        {/* Title skeleton */}
        <div className="flex flex-col items-center mb-10 md:mb-14">
          <div className="skeleton w-72 h-9 mb-3" />
          <div className="skeleton w-80 h-4" />
        </div>

        {/* Content skeleton */}
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left column */}
          <div className="w-full lg:w-7/12 flex flex-col gap-6">
            {/* Court card */}
            <div className="card overflow-hidden">
              <div className="skeleton h-1.5 rounded-none" />
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="skeleton w-20 h-20 rounded-xl flex-shrink-0" />
                  <div className="flex-1">
                    <div className="skeleton w-16 h-5 rounded-full mb-2" />
                    <div className="skeleton w-48 h-5 mb-2" />
                    <div className="skeleton w-36 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Details card */}
            <div className="card p-6">
              <div className="skeleton w-32 h-4 mb-5" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-mist rounded-xl p-4">
                    <div className="skeleton w-16 h-3 mb-3" />
                    <div className="skeleton w-full h-5" />
                  </div>
                ))}
              </div>
            </div>

            {/* Policy */}
            <div className="skeleton w-full h-16 rounded-xl" />
          </div>

          {/* Right column */}
          <div className="w-full lg:w-5/12 flex flex-col gap-6">
            {/* Payment card */}
            <div className="card p-6">
              <div className="skeleton w-36 h-4 mb-5" />
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton w-full h-[72px] rounded-xl" />
                ))}
              </div>
            </div>

            {/* Summary card */}
            <div className="card p-6">
              <div className="skeleton w-28 h-4 mb-5" />
              <div className="space-y-3 mb-5">
                <div className="flex justify-between">
                  <div className="skeleton w-40 h-4" />
                  <div className="skeleton w-16 h-4" />
                </div>
                <div className="flex justify-between">
                  <div className="skeleton w-24 h-4" />
                  <div className="skeleton w-10 h-4" />
                </div>
              </div>
              <div className="border-t border-outline pt-4 flex justify-between mb-6">
                <div className="skeleton w-12 h-5" />
                <div className="skeleton w-24 h-7" />
              </div>
              <div className="skeleton w-full h-12 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
