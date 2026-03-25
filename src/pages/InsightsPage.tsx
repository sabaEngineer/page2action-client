import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/auth';
import { apiFetch } from '../lib/api';
import type { Book, Insight, InsightStyle } from '../lib/types';

/** Book user last edited an insight for, else most recently added book. */
function pickDefaultBookId(books: Book[], insights: Insight[]): string | null {
  if (books.length === 0) return null;
  if (insights.length > 0) {
    const latest = insights.reduce((a, b) =>
      new Date(a.updatedAt) >= new Date(b.updatedAt) ? a : b,
    );
    if (books.some((bk) => bk.id === latest.bookId)) return latest.bookId;
  }
  const sorted = [...books].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return sorted[0]?.id ?? null;
}

const STYLE_LABELS: Record<string, { label: string; emoji: string }> = {
  MORNING_BOOST: { label: 'Morning Boost', emoji: '☀️' },
  APPLY_TODAY: { label: 'Apply This Today', emoji: '🎯' },
  DO_IT_NOW: { label: 'Do it now', emoji: '⚡' },
  SPREAD_THE_IDEA: { label: 'Spread the Idea', emoji: '💡' },
};

/* warm parchment palette */
const paper = {
  bg: 'bg-[#f5f0e1]',
  bgGrad: 'from-[#f5f0e1] to-[#ebe5d3]',
  text: 'text-[#3b3225]',
  textMuted: 'text-[#8a7e6b]',
  textLight: 'text-[#b0a48d]',
  border: 'border-[#d9ceb8]',
  line: '#d9ceb8',
  accent: 'text-[#8b4513]',
  accentBg: 'bg-[#8b4513]',
};

export default function InsightsPage() {
  const { token } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [chosenBookId, setChosenBookId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [ins, bks] = await Promise.all([
        apiFetch<Insight[]>('/insights', token),
        apiFetch<Book[]>('/books', token),
      ]);
      setInsights(ins ?? []);
      setBooks(bks ?? []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  const activeBookId = useMemo(() => {
    if (books.length === 0) return null;
    if (chosenBookId && books.some((b) => b.id === chosenBookId)) return chosenBookId;
    return pickDefaultBookId(books, insights);
  }, [books, insights, chosenBookId]);

  const booksSorted = useMemo(
    () => [...books].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })),
    [books],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-600 border-t-indigo-400" />
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <section className="text-left">
        <h2 className="text-xl font-semibold text-white mb-4">Insights</h2>
        <p className="text-gray-500">Add some books first, then save insights from them.</p>
      </section>
    );
  }

  const book = books.find((b) => b.id === activeBookId);
  if (!book || !activeBookId) {
    return (
      <section className="text-left">
        <h2 className="text-xl font-semibold text-white mb-4">Insights</h2>
        <p className="text-gray-500">No book selected.</p>
      </section>
    );
  }

  const bookInsights = insights
    .filter((i) => i.bookId === activeBookId)
    .sort((a, b) => a.position - b.position);

  return (
    <section className="text-left">
      <h2 className="text-xl font-semibold text-white mb-4">Insights</h2>
      <BookView
        book={book}
        books={booksSorted}
        insights={bookInsights}
        token={token!}
        onBookChange={setChosenBookId}
        onInsightCreated={(ins) => setInsights((prev) => [...prev, ins])}
        onInsightDeleted={(id) => setInsights((prev) => prev.filter((i) => i.id !== id))}
        onInsightUpdated={(id, content) => setInsights((prev) => prev.map((i) => i.id === id ? { ...i, content } : i))}
      />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   Book picker — minimal inline dropdown
   ═══════════════════════════════════════════════════════ */

function BookPicker({
  book,
  books,
  onBookChange,
}: {
  book: Book;
  books: Book[];
  onBookChange: (bookId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function esc(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const active = listRef.current.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [open]);

  if (books.length <= 1) {
    return (
      <span className="text-sm font-semibold text-white truncate" style={{ fontFamily: 'Georgia, serif' }}>
        {book.title}
      </span>
    );
  }

  return (
    <div className="relative min-w-0 flex-1 z-[70]" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5 active:bg-white/10"
      >
        <svg className="shrink-0 h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white" style={{ fontFamily: 'Georgia, serif' }}>
          {book.title}
        </span>
        <svg
          className={`shrink-0 h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-gray-800 bg-gray-950/95 backdrop-blur-xl shadow-xl shadow-black/40 max-h-[min(50vh,260px)] overflow-y-auto hide-scrollbar py-1"
        >
          {books.map((b) => {
            const active = b.id === book.id;
            return (
              <button
                key={b.id}
                type="button"
                data-active={active}
                onClick={() => { onBookChange(b.id); setOpen(false); }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                  active
                    ? 'bg-indigo-500/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                {active ? (
                  <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                ) : (
                  <span className="shrink-0 w-1.5" />
                )}
                <span className="min-w-0 truncate" style={{ fontFamily: 'Georgia, serif' }}>
                  {b.title}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Book view — parchment paper with old-style feel
   ═══════════════════════════════════════════════════════ */

function BookView({ book, books, insights, token, onBookChange, onInsightCreated, onInsightDeleted, onInsightUpdated }: {
  book: Book;
  books: Book[];
  insights: Insight[];
  token: string;
  onBookChange: (bookId: string) => void;
  onInsightCreated: (insight: Insight) => void;
  onInsightDeleted: (id: string) => void;
  onInsightUpdated: (id: string, content: string) => void;
}) {
  const totalPages = insights.length + 1;
  const [page, setPage] = useState(Math.max(insights.length - 1, 0));
  const [fullscreen, setFullscreen] = useState(false);
  const [aiPreview, setAiPreview] = useState<string | null>(null);
  const [aiPageLoading, setAiPageLoading] = useState<string | null>(null);

  useEffect(() => {
    setPage(Math.max(insights.length - 1, 0));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id]);

  const isNewPage = page === insights.length;
  const currentInsight = isNewPage ? null : insights[page];

  const wrapperClass = fullscreen
    ? 'fixed inset-0 z-[60] flex flex-col bg-gray-950 min-h-0'
    : 'max-w-2xl mx-auto flex flex-col';

  return (
    <div className={wrapperClass}>
      {/* Book picker + fullscreen */}
      <div className="flex items-center gap-2 sm:gap-3 px-0 sm:px-2 py-3 shrink-0">
        <BookPicker book={book} books={books} onBookChange={onBookChange} />

        {/* Fullscreen toggle */}
        <button
          onClick={() => setFullscreen((f) => !f)}
          className="shrink-0 text-gray-500 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10"
          title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
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

      {/* The paper */}
      <div
        className={`relative rounded-sm ${paper.bg} bg-gradient-to-b ${paper.bgGrad} shadow-2xl flex flex-col overflow-hidden min-h-0 ${
          fullscreen ? 'flex-1 mx-4 mb-4' : 'min-h-[560px] mx-0'
        }`}
        style={{
          boxShadow: '4px 4px 20px rgba(0,0,0,0.5), inset 0 0 60px rgba(139,69,19,0.04)',
        }}
      >
        {/* Page edge shadow (right side) */}
        <div className="absolute right-0 top-2 bottom-2 w-3 bg-gradient-to-l from-black/[0.08] to-transparent rounded-r-sm" />
        {/* Page edge lines */}
        <div className="absolute right-1 top-4 bottom-4 w-px bg-[#d9ceb8]/60" />
        <div className="absolute right-2 top-6 bottom-6 w-px bg-[#d9ceb8]/30" />

        {/* Red margin line — hidden on mobile for more writing space */}
        <div className="absolute left-12 top-0 bottom-0 w-px bg-red-300/30 hidden sm:block" />

        {/* Ruled lines — enough to cover full mobile height */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-px"
              style={{ top: `${72 + i * 26}px`, backgroundColor: `${paper.line}66` }}
            />
          ))}
        </div>

        {/* Top decoration */}
        <div className={`relative px-8 pt-5 pb-3 border-b ${paper.border} flex items-center justify-between`}>
          <span className={`text-[10px] uppercase tracking-[0.2em] ${paper.textMuted}`} style={{ fontFamily: 'Georgia, serif' }}>
            {isNewPage ? 'New Page' : `Page ${page + 1}`}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] ${paper.textLight}`} style={{ fontFamily: 'Georgia, serif' }}>
              {book.title}
            </span>
            {!isNewPage && currentInsight && (
              <PageMenu insight={currentInsight} token={token} onStyleChanged={(s) => {
                currentInsight.style = s;
              }} onDelete={() => {
                onInsightDeleted(currentInsight.id);
                setPage((p) => Math.max(0, p - 1));
                void apiFetch(`/insights/${currentInsight.id}`, token, { method: 'DELETE' });
              }} onAiEdit={async (action) => {
                setAiPageLoading(action);
                try {
                  const result = await apiFetch<{ content: string }>(`/insights/${currentInsight.id}/ai-edit`, token, {
                    method: 'POST',
                    body: JSON.stringify({ action }),
                  });
                  if (result?.content) setAiPreview(result.content);
                } finally {
                  setAiPageLoading(null);
                }
              }} aiBusy={aiPageLoading !== null || aiPreview !== null} />
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="relative flex-1 px-4 sm:px-8 py-6 sm:pl-16 overflow-y-auto hide-scrollbar" style={{ fontFamily: 'Georgia, serif' }}>
          {isNewPage ? (
            <NewPage key={book.id} bookId={book.id} token={token} onCreated={onInsightCreated} />
          ) : currentInsight ? (
            <PageContent
              key={currentInsight.id}
              insight={currentInsight}
              token={token}
              aiLoading={aiPageLoading}
              aiPreview={aiPreview}
              onAcceptPreview={(content) => {
                onInsightUpdated(currentInsight.id, content);
                void apiFetch(`/insights/${currentInsight.id}`, token, {
                  method: 'PATCH',
                  body: JSON.stringify({ content }),
                });
                setAiPreview(null);
              }}
              onDiscardPreview={() => setAiPreview(null)}
            />
          ) : null}
        </div>

        {/* Navigation footer */}
        <div className={`relative flex items-center justify-between px-6 py-3 border-t ${paper.border}`}>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || aiPageLoading !== null || aiPreview !== null}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-0 bg-[#8b4513]/10 text-[#8b4513] hover:bg-[#8b4513]/20 active:scale-95"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>

          <span className={`text-sm font-medium ${paper.textMuted}`} style={{ fontFamily: 'Georgia, serif' }}>
            {page + 1} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1 || aiPageLoading !== null || aiPreview !== null}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-0 bg-[#8b4513]/10 text-[#8b4513] hover:bg-[#8b4513]/20 active:scale-95"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Next
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 3-dot page menu: copy, style display + manual override ── */

const AI_EDIT_OPTIONS = [
  { action: 'make_longer', label: 'Make longer', icon: '↗' },
  { action: 'improve_writing', label: 'Improve writing', icon: '✨' },
  { action: 'make_shorter', label: 'Make shorter', icon: '↙' },
  { action: 'fix_grammar', label: 'Fix grammar', icon: '📝' },
] as const;

function PageMenu({
  insight,
  token,
  onStyleChanged,
  onDelete,
  onAiEdit,
  aiBusy,
}: {
  insight: Insight;
  token: string;
  onStyleChanged: (style: InsightStyle | null) => void;
  onDelete: () => void;
  onAiEdit: (action: string) => void;
  aiBusy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [submenu, setSubmenu] = useState<'ai' | 'style' | null>(null);
  const [copied, setCopied] = useState(false);
  const [localStyle, setLocalStyle] = useState<InsightStyle | null>(insight.style);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalStyle(insight.style);
  }, [insight.id, insight.style]);

  useEffect(() => {
    if (!open) return;
    setSubmenu(null);
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function esc(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') {
        if (submenu) setSubmenu(null);
        else setOpen(false);
      }
    }
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  function handleCopy() {
    navigator.clipboard.writeText(insight.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleStyleChange(style: InsightStyle | null) {
    setLocalStyle(style);
    onStyleChanged(style);
    void apiFetch(`/insights/${insight.id}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ style }),
    });
  }

  const currentStyle = localStyle;
  const styleInfo = currentStyle ? STYLE_LABELS[currentStyle] : null;

  const chevron = (
    <svg className="w-3.5 h-3.5 text-[#8a7e6b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );

  const backBtn = (
    <button
      type="button"
      onClick={() => setSubmenu(null)}
      className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-[#8a7e6b] hover:bg-[#8b4513]/5 transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      <span className="text-xs">Back</span>
    </button>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`p-1.5 rounded-md transition-colors ${paper.textMuted} hover:bg-[#8b4513]/10`}
        aria-label="Page options"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="4" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="10" cy="16" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-[#d9ceb8] bg-[#f5f0e1] shadow-xl shadow-black/10 py-1 z-[80]">

          {/* ── Main menu ── */}
          {submenu === null && (
            <>
              {/* Copy */}
              <button
                type="button"
                onClick={handleCopy}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-[#3b3225] hover:bg-[#8b4513]/5 transition-colors"
              >
                <svg className="w-4 h-4 text-[#8a7e6b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
                <span>{copied ? 'Copied!' : 'Copy text'}</span>
              </button>

              <div className="my-1 h-px bg-[#d9ceb8]/60" />

              {/* Edit with AI → */}
              <button
                type="button"
                onClick={() => setSubmenu('ai')}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-[#3b3225] hover:bg-[#8b4513]/5 transition-colors"
              >
                <span className="w-4 text-center text-xs">✨</span>
                <span className="flex-1 text-left">Edit with AI</span>
                {chevron}
              </button>

              {/* Notification style → */}
              <button
                type="button"
                onClick={() => setSubmenu('style')}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-[#3b3225] hover:bg-[#8b4513]/5 transition-colors"
              >
                <span className="w-4 text-center text-xs">{styleInfo ? styleInfo.emoji : '🔔'}</span>
                <span className="flex-1 text-left">Notification style</span>
                {chevron}
              </button>

              <div className="my-1 h-px bg-[#d9ceb8]/60" />

              {/* Remove page */}
              <button
                type="button"
                onClick={() => { setOpen(false); onDelete(); }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-700/80 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 00-7.5 0" />
                </svg>
                <span>Remove page</span>
              </button>
            </>
          )}

          {/* ── AI edit submenu ── */}
          {submenu === 'ai' && (
            <>
              {backBtn}
              <div className="my-1 h-px bg-[#d9ceb8]/60" />
              {AI_EDIT_OPTIONS.map((opt) => (
                <button
                  key={opt.action}
                  type="button"
                  disabled={aiBusy}
                  onClick={() => { setOpen(false); setSubmenu(null); onAiEdit(opt.action); }}
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors ${
                    aiBusy ? 'opacity-50' : 'text-[#3b3225] hover:bg-[#8b4513]/5'
                  }`}
                >
                  <span className="w-4 text-center text-xs">{opt.icon}</span>
                  <span className="flex-1 text-left">{opt.label}</span>
                </button>
              ))}
            </>
          )}

          {/* ── Style submenu ── */}
          {submenu === 'style' && (
            <>
              {backBtn}
              <div className="my-1 h-px bg-[#d9ceb8]/60" />
              {Object.entries(STYLE_LABELS).map(([key, info]) => {
                const active = currentStyle === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleStyleChange(active ? null : (key as InsightStyle))}
                    className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors ${
                      active
                        ? 'bg-[#8b4513]/10 text-[#3b3225] font-medium'
                        : 'text-[#6b5d4d] hover:bg-[#8b4513]/5'
                    }`}
                  >
                    <span className="w-4 text-center">{info.emoji}</span>
                    <span className="flex-1 text-left">{info.label}</span>
                    {active && (
                      <svg className="w-3.5 h-3.5 text-[#8b4513]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                );
              })}
              {styleInfo && (
                <>
                  <div className="my-1 h-px bg-[#d9ceb8]/60" />
                  <div className="px-3.5 py-2 text-[10px] text-[#8a7e6b]">
                    AI suggested: {styleInfo.emoji} {styleInfo.label}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── New blank page ── */

function NewPage({ bookId, token, onCreated }: {
  bookId: string; token: string; onCreated: (insight: Insight) => void;
}) {
  const [content, setContent] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const createdId = useRef<string | null>(null);

  function handleChange(val: string) {
    setContent(val);
    clearTimeout(saveTimer.current);
    if (!val.trim()) return;
    saveTimer.current = setTimeout(() => void autoSave(val), 1200);
  }

  async function autoSave(val: string) {
    const trimmed = val.trim();
    if (!trimmed) return;
    if (!createdId.current) {
      const result = await apiFetch<Insight>('/insights', token, {
        method: 'POST',
        body: JSON.stringify({ content: trimmed, bookId }),
      });
      if (result) {
        createdId.current = result.id;
        onCreated(result);
      }
    } else {
      await apiFetch(`/insights/${createdId.current}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ content: trimmed }),
      });
    }
  }

  async function handleBlur() {
    clearTimeout(saveTimer.current);
    if (content.trim()) await autoSave(content);
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: 'Georgia, serif' }}>
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => void handleBlur()}
        placeholder="Start writing..."
        className={`flex-1 w-full bg-transparent ${paper.text} placeholder:${paper.textLight} outline-none resize-none text-[15px] leading-[26px] min-h-[400px]`}
        style={{ fontFamily: 'Georgia, serif' }}
        autoFocus
      />
    </div>
  );
}

/* ── Existing page — one big editable text ── */

function PageContent({ insight, token, aiLoading, aiPreview, onAcceptPreview, onDiscardPreview }: {
  insight: Insight;
  token: string;
  aiLoading: string | null;
  aiPreview: string | null;
  onAcceptPreview: (content: string) => void;
  onDiscardPreview: () => void;
}) {
  const [draft, setDraft] = useState(insight.content);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [typedLength, setTypedLength] = useState(0);
  const typingTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    setDraft(insight.content);
  }, [insight.id, insight.content]);

  useEffect(() => {
    if (!aiPreview) {
      setTypedLength(0);
      clearInterval(typingTimer.current);
      return;
    }
    setTypedLength(0);
    const len = aiPreview.length;
    const charsPerTick = Math.max(1, Math.ceil(len / 120));
    typingTimer.current = setInterval(() => {
      setTypedLength((prev) => {
        const next = prev + charsPerTick;
        if (next >= len) {
          clearInterval(typingTimer.current);
          return len;
        }
        return next;
      });
    }, 18);
    return () => clearInterval(typingTimer.current);
  }, [aiPreview]);

  function handleChange(val: string) {
    setDraft(val);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void autoSave(val), 1200);
  }

  async function autoSave(val: string) {
    const trimmed = val.trim();
    if (!trimmed || trimmed === insight.content) return;
    await apiFetch(`/insights/${insight.id}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ content: trimmed }),
    });
  }

  async function handleBlur() {
    clearTimeout(saveTimer.current);
    await autoSave(draft);
  }

  if (aiLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <span className="text-3xl animate-spin" style={{ animationDuration: '2s' }}>⏳</span>
      </div>
    );
  }

  if (aiPreview) {
    const displayed = aiPreview.slice(0, typedLength);
    const done = typedLength >= aiPreview.length;

    return (
      <div className="flex flex-col h-full" style={{ fontFamily: 'Georgia, serif' }}>
        <div className="flex-1 w-full text-[15px] leading-[26px] min-h-[400px] whitespace-pre-wrap text-[#3b3225]">
          {displayed}
          {!done && <span className="inline-block w-[2px] h-[1em] bg-[#8b4513] align-text-bottom animate-pulse ml-px" />}
        </div>

        <div className="sticky bottom-0 flex items-center gap-3 pt-4 pb-2">
          <button
            type="button"
            onClick={() => onAcceptPreview(aiPreview)}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#8b4513]/15 text-[#8b4513] hover:bg-[#8b4513]/25 active:scale-95 transition-all"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Accept
          </button>
          <button
            type="button"
            onClick={onDiscardPreview}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-800/10 text-red-800/70 hover:bg-red-800/20 active:scale-95 transition-all"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Discard
          </button>
          <span className="text-[11px] text-[#8a7e6b] italic ml-auto">AI suggestion</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: 'Georgia, serif' }}>
      <textarea
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => void handleBlur()}
        className={`flex-1 w-full bg-transparent ${paper.text} outline-none resize-none text-[15px] leading-[26px] min-h-[400px]`}
        style={{ fontFamily: 'Georgia, serif' }}
      />
    </div>
  );
}
