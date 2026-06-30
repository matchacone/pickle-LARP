import Navbar from '@/components/layout/Navbar'

export default function CourtDetailLoading() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-asphalt pt-24 pb-12 overflow-hidden">
          <div className="container-page relative z-10">
            <div className="max-w-4xl mx-auto flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="h-6 w-24 rounded-full bg-white/10 animate-pulse" />
                <div className="h-6 w-32 rounded-full bg-white/10 animate-pulse" />
              </div>
              <div className="h-12 w-3/4 rounded-xl bg-white/10 animate-pulse" />
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="h-4 w-40 rounded bg-white/10 animate-pulse" />
                <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
                <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container-page py-12 md:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Left Column - Details */}
              <div className="w-full lg:w-7/12 flex flex-col gap-10">
                <div>
                  <div className="h-8 w-40 rounded bg-mist skeleton mb-4" />
                  <div className="h-4 w-full rounded bg-mist skeleton mb-2" />
                  <div className="h-4 w-full rounded bg-mist skeleton mb-2" />
                  <div className="h-4 w-3/4 rounded bg-mist skeleton" />
                </div>
                
                <div>
                  <div className="h-8 w-48 rounded bg-mist skeleton mb-4" />
                  <div className="flex flex-wrap gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 w-32 rounded-lg bg-mist skeleton" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Booking Widget */}
              <div className="w-full lg:w-5/12">
                <div className="sticky top-24">
                  <div className="h-[500px] w-full rounded-2xl bg-mist skeleton" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
