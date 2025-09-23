export default function Loading() {
  return (
    <div className="lg:px-32 px-4 animate-pulse">
      <div className="md:flex justify-between items-start lg:gap-10 gap-5 mb-0">
        <div className="md:w-1/2 md:sticky md:top-0">
          <div className="aspect-square w-full border rounded bg-muted/30" />
          <div className="flex gap-2 mt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-16 h-16 border rounded bg-muted/30" />
            ))}
          </div>
        </div>
        <div className="md:w-1/2">
          <div className="h-8 w-3/4 bg-muted/30 rounded mb-3" />
          <div className="h-6 w-1/2 bg-muted/30 rounded mb-4" />
          <div className="space-y-2 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 w-full bg-muted/30 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="h-12 bg-muted/30 rounded-full" />
            <div className="h-12 bg-muted/30 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-8">
        <div className="h-8 w-56 bg-muted/30 rounded mb-3" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-full bg-muted/30 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}


