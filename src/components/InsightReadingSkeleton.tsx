import {
  INSIGHT_PAPER_BOX_SHADOW,
  insightPaper as paper,
} from '../lib/insightPaperTheme';

const sk = 'rounded-sm bg-[#b0a090]/45 animate-pulse';

/** Paragraph-line widths (fraction of row) — mimics ragged text blocks. */
const BODY_LINE_WIDTHS = [
  'w-full',
  'w-[96%]',
  'w-full',
  'w-[88%]',
  'w-full',
  'w-[72%]',
  'w-full',
  'w-[94%]',
  'w-[65%]',
  'w-full',
  'w-[82%]',
  'w-[58%]',
];

type InsightReadingSkeletonProps = {
  narrow: boolean;
  /** Extra classes on the paper root (e.g. fullscreen margins). */
  paperClassName?: string;
};

/**
 * Skeleton for the insight “book page” layout: ruled paper, header strip,
 * body lines (~26px rhythm), footer bar. Matches loaded PublicInsightPage / BookView.
 */
export function InsightReadingSkeleton({
  narrow,
  paperClassName = 'flex-1 mx-0 min-h-0 rounded-sm',
}: InsightReadingSkeletonProps) {
  const headerRowClass = narrow
    ? `relative flex min-w-0 items-center justify-between gap-2 border-b ${paper.border} px-4 pt-5 pb-3 sm:px-8`
    : `relative flex min-w-0 items-center justify-between border-b ${paper.border} px-4 pt-5 pb-3 sm:px-8`;

  return (
    <div
      className={`relative ${paper.bg} bg-gradient-to-b ${paper.bgGrad} shadow-2xl flex flex-col overflow-hidden min-h-0 ${paperClassName}`}
      style={{ boxShadow: INSIGHT_PAPER_BOX_SHADOW }}
      aria-hidden
    >
      <div className="absolute right-0 top-2 bottom-2 w-3 bg-gradient-to-l from-black/[0.08] to-transparent rounded-r-sm" />
      <div className="absolute right-1 top-4 bottom-4 w-px bg-[#d9ceb8]/60" />
      <div className="absolute right-2 top-6 bottom-6 w-px bg-[#d9ceb8]/30" />
      <div className="absolute left-12 top-0 bottom-0 w-px bg-red-300/30 hidden sm:block" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px"
            style={{ top: `${72 + i * 26}px`, backgroundColor: `${paper.line}66` }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className={`relative z-20 shrink-0 ${paper.bg} shadow-[0_4px_12px_rgba(0,0,0,0.06)]`}>
          <div className={headerRowClass}>
            {narrow ? (
              <>
                <div className={`h-2.5 w-14 ${sk}`} />
                <div className={`h-2.5 min-w-0 flex-1 max-w-[58%] ${sk} ml-2`} />
              </>
            ) : (
              <>
                <div className={`h-2.5 w-14 ${sk}`} />
                <div className={`flex max-w-[55%] min-w-0 flex-1 justify-end sm:max-w-none`}>
                  <div className={`h-2.5 w-full max-w-[12rem] ${sk}`} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="relative px-4 py-6 sm:px-8 sm:pl-16">
            <div className="flex flex-col gap-[10px] pt-1">
              {BODY_LINE_WIDTHS.map((w, i) => (
                <div key={i} className={`h-[13px] ${sk} ${w}`} />
              ))}
            </div>
          </div>
        </div>

        <div
          className={`relative z-10 flex shrink-0 items-center justify-between border-t ${paper.border} ${paper.bg} px-6 py-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]`}
        >
          <div className={`h-9 w-[4.5rem] rounded-lg ${sk} opacity-60`} />
          <div className={`h-4 w-10 ${sk}`} />
          <div className={`h-9 w-[4.5rem] rounded-lg ${sk} opacity-60`} />
        </div>
      </div>
    </div>
  );
}

/** Gray chrome row: book title area + fullscreen control placeholder. */
export function InsightTopChromeSkeleton({ pickerStyle }: { pickerStyle?: boolean }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 py-3 shrink-0 px-0 sm:px-2">
      <div
        className={`rounded-md bg-white/10 animate-pulse min-w-0 ${
          pickerStyle ? 'h-10 flex-1' : 'h-4 flex-1 max-w-[min(100%,22rem)]'
        }`}
      />
      <div className="h-8 w-8 shrink-0 rounded-md bg-white/10 animate-pulse" />
    </div>
  );
}
