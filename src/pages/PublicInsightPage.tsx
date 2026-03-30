import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  InsightReadingSkeleton,
  InsightTopChromeSkeleton,
} from '../components/InsightReadingSkeleton';
import { useIsNarrowScreen } from '../hooks/useIsNarrowScreen';
import { apiFetch } from '../lib/api';
import {
  INSIGHT_BODY_TEXT_CLASS,
  INSIGHT_PAPER_BOX_SHADOW,
  insightPaper as paper,
} from '../lib/insightPaperTheme';
import type { PublicSharedInsight } from '../lib/types';

export default function PublicInsightPage() {
  const narrow = useIsNarrowScreen();
  const [fullscreen, setFullscreen] = useState(false);
  const immersiveMobile = narrow && fullscreen;

  const { owner, book, page: pageParam } = useParams<{
    owner: string;
    book: string;
    page: string;
  }>();
  const [data, setData] = useState<PublicSharedInsight | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!owner || !book || !pageParam) return;
    const pageNum = Number.parseInt(pageParam, 10);
    if (!Number.isFinite(pageNum) || pageNum < 1) {
      setError('This shared page could not be found.');
      return;
    }
    const path = `/insights/public/page/${encodeURIComponent(owner)}/${encodeURIComponent(book)}/${pageNum}`;
    apiFetch<PublicSharedInsight>(path, null)
      .then(setData)
      .catch(() => setError('This shared page could not be found.'));
  }, [owner, book, pageParam]);

  if (error) {
    return (
      <div className="h-dvh max-h-dvh bg-gray-950 text-gray-100 flex flex-col items-center justify-center px-6">
        <p className="text-gray-400">{error}</p>
        <Link to="/" className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm">
          Page2Action
        </Link>
      </div>
    );
  }

  const wrapperClass = fullscreen
    ? immersiveMobile
      ? 'fixed inset-0 z-[100] flex flex-col min-h-0 w-full h-[100dvh] max-h-[100dvh] relative bg-[#f5f0e1] pb-[env(safe-area-inset-bottom)]'
      : 'fixed inset-0 z-[60] flex flex-col bg-gray-950 min-h-0'
    : 'max-w-2xl mx-auto flex w-full min-h-0 flex-1 flex-col';

  const paperShellClass = `relative ${paper.bg} bg-gradient-to-b ${paper.bgGrad} shadow-2xl flex flex-col overflow-hidden min-h-0 ${
    fullscreen
      ? immersiveMobile
        ? 'flex-1 m-0 w-full min-h-0 rounded-none'
        : 'flex-1 mx-4 mb-4 rounded-sm'
      : 'flex-1 mx-0 min-h-0 rounded-sm'
  }`;

  const headerRowClass = fullscreen && !narrow
    ? `relative flex min-w-0 border-b ${paper.border} px-4 pt-5 pb-3 sm:px-8 items-center gap-3`
    : `relative flex min-w-0 border-b ${paper.border} px-4 pt-5 pb-3 sm:px-8 ${
        narrow ? 'items-center justify-between gap-2' : 'items-center justify-between'
      }`;

  if (!data) {
    return (
      <div
        className="min-h-0 h-dvh max-h-dvh bg-gray-950 text-gray-100 flex flex-col overflow-hidden"
        aria-busy="true"
        aria-label="Loading shared page"
      >
        <span className="sr-only">Loading…</span>
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-0 pt-3 sm:px-6 sm:pt-4">
          <div className={`${wrapperClass} h-full min-h-0`}>
            <InsightTopChromeSkeleton />
            <InsightReadingSkeleton narrow={narrow} paperClassName="flex-1 mx-0 min-h-0 rounded-sm" />
          </div>
        </main>
      </div>
    );
  }

  const pageLabel = data.page;
  const totalPages = data.totalPages;

  const paperBody = (
    <>
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className={`relative z-20 shrink-0 ${paper.bg} shadow-[0_4px_12px_rgba(0,0,0,0.06)]`}>
          <div className={headerRowClass}>
            {narrow ? (
              <>
                <span
                  className={`text-[10px] uppercase tracking-[0.2em] ${paper.textMuted} shrink-0`}
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Insight {pageLabel}
                </span>
                <span
                  className={`text-[10px] ${paper.textLight} min-w-0 flex-1 truncate text-right ${
                    immersiveMobile ? 'pr-[max(2.75rem,calc(env(safe-area-inset-right)+2.25rem))]' : ''
                  }`}
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {data.bookTitle}
                </span>
              </>
            ) : fullscreen && !narrow ? (
              <>
                <span
                  className={`text-[10px] uppercase tracking-[0.2em] ${paper.textMuted} shrink-0`}
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Insight {pageLabel}
                </span>
                <span
                  className={`text-[10px] ${paper.textLight} min-w-0 flex-1 truncate text-left`}
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {data.bookTitle}
                </span>
              </>
            ) : (
              <>
                <span
                  className={`text-[10px] uppercase tracking-[0.2em] ${paper.textMuted} shrink-0`}
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Insight {pageLabel}
                </span>
                <div className="flex max-w-[55%] min-w-0 shrink-0 items-center gap-2 sm:max-w-none">
                  <span
                    className={`text-[10px] ${paper.textLight} truncate`}
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {data.bookTitle}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto hide-scrollbar">
          <div
            className="relative px-4 py-6 sm:px-8 sm:pl-16"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            <div
              className={`tiptap ${INSIGHT_BODY_TEXT_CLASS} ${paper.text}`}
              style={{ fontFamily: 'Georgia, serif' }}
              dangerouslySetInnerHTML={{ __html: data.content }}
            />
          </div>
        </div>

        <div
          className={`relative z-10 flex shrink-0 items-center justify-between border-t ${paper.border} ${paper.bg} px-6 py-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]`}
          style={{ fontFamily: 'Georgia, serif' }}
        >
          <button
            type="button"
            disabled
            aria-hidden
            className="flex items-center gap-1.5 rounded-lg bg-[#8b4513]/10 px-4 py-2 text-sm font-semibold text-[#8b4513] opacity-0 pointer-events-none"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>
          <span className={`text-sm font-medium ${paper.textMuted}`}>
            Insight {pageLabel} / {totalPages}
          </span>
          <button
            type="button"
            disabled
            aria-hidden
            className="flex items-center gap-1.5 rounded-lg bg-[#8b4513]/10 px-4 py-2 text-sm font-semibold text-[#8b4513] opacity-0 pointer-events-none"
          >
            Next
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-0 h-dvh max-h-dvh bg-gray-950 text-gray-100 flex flex-col overflow-hidden">
      <main
        className={`flex min-h-0 flex-1 flex-col ${
          fullscreen ? 'overflow-hidden p-0' : 'overflow-hidden px-4 pb-0 pt-3 sm:px-6 sm:pt-4'
        }`}
      >
        <div className={`${wrapperClass} h-full min-h-0`}>
          {immersiveMobile ? (
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="absolute z-[120] top-[max(8px,env(safe-area-inset-top))] right-[max(8px,env(safe-area-inset-right))] p-2.5 rounded-full bg-[#3b3225]/35 text-white shadow-lg backdrop-blur-md active:scale-95"
              title="Exit fullscreen"
              aria-label="Exit fullscreen"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0v4m0-4h4m7 11l5 5m0 0v-4m0 4h-4M9 15l-5 5m0 0h4m-4 0v-4m11-7l5-5m0 0h-4m4 0v4" />
              </svg>
            </button>
          ) : null}

          {!immersiveMobile ? (
            <div className="flex items-center gap-2 sm:gap-3 py-3 shrink-0 px-0 sm:px-2">
              <span
                className="text-sm font-semibold text-white truncate min-w-0 flex-1"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {data.bookTitle}
              </span>
              <button
                type="button"
                onClick={() => setFullscreen((f) => !f)}
                className="shrink-0 text-gray-500 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10"
                title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {fullscreen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0v4m0-4h4m7 11l5 5m0 0v-4m0 4h-4M9 15l-5 5m0 0h4m-4 0v-4m11-7l5-5m0 0h-4m4 0v4" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                )}
              </button>
            </div>
          ) : null}

          <div className={paperShellClass} style={{ boxShadow: INSIGHT_PAPER_BOX_SHADOW }}>
            {paperBody}
          </div>
        </div>
      </main>
    </div>
  );
}
