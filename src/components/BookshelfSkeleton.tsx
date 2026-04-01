const pulse = 'animate-pulse rounded bg-gray-800/70';

/** Spine placeholder — matches BookSpine 180×120 */
function SpineSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex-shrink-0 rounded bg-gradient-to-br from-gray-700/60 to-gray-900/80 shadow-[inset_-3px_0_6px_rgba(0,0,0,0.25)] ${className}`}
      style={{ height: '180px', width: '120px' }}
      aria-hidden
    >
      <div className="h-full w-full rounded opacity-40 bg-gray-600/30 animate-pulse" />
    </div>
  );
}

function AddBookSpineSkeleton() {
  return (
    <div
      className="flex-shrink-0 rounded border border-dashed border-gray-700/60 bg-gray-900/30"
      style={{ height: '180px', width: '120px' }}
      aria-hidden
    >
      <div className="h-full w-full rounded animate-pulse bg-gray-800/20" />
    </div>
  );
}

/** One shelf row: label strip + spines + wooden plank (main /books list). */
function ShelfRowSkeleton({ spines = 4 }: { spines?: number }) {
  return (
    <div className="relative">
      <div className="relative z-10 flex flex-wrap items-center gap-x-3 gap-y-2 px-5 pt-2 pb-2">
        <div className={`h-7 w-36 ${pulse}`} />
        <div className={`h-4 w-14 ${pulse}`} />
        <div className={`ml-auto h-4 w-12 ${pulse} max-sm:ml-0`} />
      </div>
      <div className="flex items-end gap-4 px-5 pb-0 min-h-[200px] flex-wrap">
        {Array.from({ length: spines }, (_, i) => (
          <SpineSkeleton key={i} />
        ))}
        <AddBookSpineSkeleton />
      </div>
      <div className="h-3 rounded-b-lg bg-gradient-to-b from-amber-900/40 to-amber-950/60 border-t border-amber-800/25 shadow-[0_4px_12px_rgba(0,0,0,0.35)]" />
      <div className="h-1.5 mx-4 bg-gradient-to-b from-black/25 to-transparent rounded-b" />
    </div>
  );
}

/**
 * Loading placeholder for the bookshelf list (`/books`).
 * Header (+ menu) stays live in `BooksSection`; this replaces the shelf list only.
 */
export function BookshelfListSkeleton() {
  return (
    <div className="mt-4 space-y-0" aria-hidden>
      <ShelfRowSkeleton spines={5} />
      <ShelfRowSkeleton spines={3} />
      <ShelfRowSkeleton spines={4} />
    </div>
  );
}

/**
 * Loading placeholder for a single shelf detail page (`/books/:shelfId`).
 */
export function ShelfViewSkeleton() {
  return (
    <div className="mt-4" aria-hidden>
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className={`h-8 w-48 max-w-full ${pulse}`} />
          <div className={`h-4 w-24 ${pulse}`} />
          <div className={`h-10 w-full max-w-md ${pulse}`} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className={`h-8 w-24 rounded-lg ${pulse}`} />
          <div className={`h-8 w-24 rounded-lg ${pulse}`} />
        </div>
      </div>
      <div className="mt-8 relative">
        <div className="flex items-end gap-4 px-5 pb-0 min-h-[200px] flex-wrap">
          <SpineSkeleton />
          <SpineSkeleton />
          <SpineSkeleton />
          <AddBookSpineSkeleton />
        </div>
        <div className="h-3 rounded-b-lg bg-gradient-to-b from-amber-800/50 to-amber-950/50 border-t border-amber-700/30 shadow-[0_4px_12px_rgba(0,0,0,0.4)]" />
        <div className="h-1.5 mx-4 bg-gradient-to-b from-black/20 to-transparent rounded-b" />
      </div>
    </div>
  );
}
