import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { apiFetch } from '../lib/api';
import type { Book, Shelf, ShareStatus } from '../lib/types';
import { publicBookshelfShareUrl } from '../lib/shareUrl';
import ShareLinkCopyButton from './ShareLinkCopyButton';
import { BookSpine } from './ShelfView';

export default function BooksSection() {
  const { token, user } = useAuth();
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewShelf, setShowNewShelf] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<ShareStatus | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      const [list, status] = await Promise.all([
        apiFetch<Shelf[]>('/shelves', token),
        apiFetch<ShareStatus>('/shelves/share-status', token),
      ]);
      setShelves(list ?? []);
      setShareStatus(status);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load shelves');
      setShelves([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateShelfName = useCallback((id: string, name: string) => {
    setShelves((list) => list.map((s) => (s.id === id ? { ...s, name } : s)));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  async function toggleShareBookshelf() {
    if (!token) return;
    try {
      const result = await apiFetch<ShareStatus>('/shelves/toggle-all-public', token, { method: 'POST' });
      setShareStatus(result);
    } catch {
      /* ignore */
    }
    setMenuOpen(false);
  }

  function openCreateShelf() {
    setShowNewShelf(true);
    setMenuOpen(false);
  }

  const bookshelfShareUrl =
    shareStatus?.allPublic && shareStatus.shareSlug
      ? publicBookshelfShareUrl(
          window.location.origin,
          shareStatus.shareSlug,
          user?.name,
          user?.email ?? null,
        )
      : null;

  return (
    <section className="text-left">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-white">Bookshelf</h2>
          {bookshelfShareUrl && (
            <ShareLinkCopyButton
              url={bookshelfShareUrl}
              kind="bookshelf"
              name={user?.name}
              email={user?.email}
              prefixText="Your bookshelf is public -"
            />
          )}
        </div>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Shelf actions"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 w-9 h-9 text-white hover:bg-indigo-500 transition-colors shadow-sm"
          >
            <PlusIcon />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1.5 z-30 min-w-[11rem] rounded-lg border border-gray-800 bg-gray-900 py-1 shadow-xl shadow-black/40"
            >
              <button
                type="button"
                role="menuitem"
                onClick={openCreateShelf}
                className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-800/80 transition-colors"
              >
                Create shelf
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => void toggleShareBookshelf()}
                className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-800/80 transition-colors"
              >
                {shareStatus?.allPublic ? 'Stop sharing bookshelf' : 'Share bookshelf'}
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">{error}</p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-gray-500">Loading…</p>
      ) : shelves.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center max-w-sm mx-auto">
          <p className="text-gray-500 text-sm">
            No shelves yet. Use the <span className="text-gray-400">+</span> button above to create a shelf or share your whole bookshelf.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-0">
          {shelves.map((shelf) => (
            <ShelfRow
              key={shelf.id}
              shelf={shelf}
              token={token!}
              onReload={load}
              onShelfNameUpdate={updateShelfName}
            />
          ))}
        </div>
      )}

      {showNewShelf && (
        <NewShelfModal
          token={token!}
          onClose={() => setShowNewShelf(false)}
          onCreated={() => { setShowNewShelf(false); void load(); }}
        />
      )}
    </section>
  );
}

/* ── ShelfRow ─────────────────────────────────────────────────── */

function ShelfRow({
  shelf,
  token,
  onReload,
  onShelfNameUpdate,
}: {
  shelf: Shelf;
  token: string;
  onReload: () => void;
  onShelfNameUpdate: (id: string, name: string) => void;
}) {
  const [nameDraft, setNameDraft] = useState(shelf.name);

  useEffect(() => {
    setNameDraft(shelf.name);
  }, [shelf.id, shelf.name]);

  async function commitShelfName() {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameDraft(shelf.name);
      return;
    }
    if (trimmed === shelf.name) return;
    const previous = shelf.name;
    onShelfNameUpdate(shelf.id, trimmed);
    try {
      await apiFetch(`/shelves/${shelf.id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ name: trimmed }),
      });
    } catch {
      onShelfNameUpdate(shelf.id, previous);
      setNameDraft(previous);
    }
  }

  function onNameKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  }

  return (
    <div className="relative">
      {/* Shelf label */}
      <div className="relative z-10 flex flex-wrap items-center gap-x-3 gap-y-2 px-5 pt-2 pb-2">
        <div className="inline-grid min-w-[6ch] max-w-[min(100vw-5rem,28rem)] align-middle">
          <span
            className="invisible col-start-1 row-start-1 whitespace-pre px-0 py-1 text-base font-medium tracking-tight"
            aria-hidden
          >
            {nameDraft.length > 0 ? nameDraft : '\u00a0'}
          </span>
          <input
            type="text"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={() => void commitShelfName()}
            onKeyDown={onNameKeyDown}
            aria-label="Shelf name"
            placeholder="Name this shelf"
            className="col-start-1 row-start-1 w-full min-w-0 bg-transparent py-1 text-base font-medium tracking-tight text-white placeholder:text-gray-600 outline-none transition-[box-shadow] border-0 border-b-2 border-transparent hover:border-white/10 focus:border-indigo-500/70 focus:hover:border-indigo-500/70"
          />
        </div>
        <span className="text-xs text-gray-500">
          {shelf.books.length} book{shelf.books.length !== 1 ? 's' : ''}
        </span>
        <Link
          to={`/books/${shelf.id}`}
          className="ml-auto text-xs text-gray-600 hover:text-indigo-400 transition-colors max-sm:ml-0"
        >
          View →
        </Link>
      </div>

      {/* Books row */}
      <div className="flex items-end gap-4 px-5 pb-0 min-h-[200px] flex-wrap">
        {shelf.books.map((book) => (
          <BookSpine key={book.id} book={book} />
        ))}
        <InlineAddBook shelfId={shelf.id} token={token} onAdded={onReload} />
      </div>

      {/* Shelf plank */}
      <div className="h-3 rounded-b-lg bg-gradient-to-b from-amber-800/50 to-amber-950/50 border-t border-amber-700/30 shadow-[0_4px_12px_rgba(0,0,0,0.4)]" />
      <div className="h-1.5 mx-4 bg-gradient-to-b from-black/20 to-transparent rounded-b" />
    </div>
  );
}

/* ── Inline Add Book ──────────────────────────────────────────── */

function InlineAddBook({
  shelfId,
  token,
  onAdded,
}: {
  shelfId: string;
  token: string;
  onAdded: () => void;
}) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await apiFetch<Book>('/books', token, {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim() || undefined,
          shelfId,
        }),
      });
      setTitle('');
      setAuthor('');
      onAdded();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSubmit();
    }
  }

  const canSave = title.trim().length > 0 && !saving;

  return (
    <div
      className="relative flex-shrink-0 rounded overflow-hidden"
      style={{ height: '180px', width: '120px' }}
    >
      <div className="absolute inset-0 rounded bg-gradient-to-br from-gray-800 to-gray-900 shadow-[inset_-3px_0_6px_rgba(0,0,0,0.3)]" />
      <div className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l bg-black/25" />
      <div className="absolute inset-2 rounded-sm border border-dashed border-gray-600/40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-2.5 gap-1.5">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Title"
          className="w-full bg-transparent text-center text-[11px] font-bold text-white/90 placeholder:text-gray-500 border-b border-gray-600/50 focus:border-indigo-500/60 outline-none pb-0.5 leading-tight"
        />
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Author"
          className="w-full bg-transparent text-center text-[10px] text-white/50 placeholder:text-gray-600 border-b border-gray-600/30 focus:border-indigo-500/40 outline-none pb-0.5 leading-tight"
        />
        <button
          type="button"
          disabled={!canSave}
          onClick={() => void handleSubmit()}
          className="mt-1.5 rounded bg-indigo-600/80 hover:bg-indigo-500 disabled:bg-gray-700/50 disabled:text-gray-600 px-3 py-1 text-[10px] font-medium text-white transition-colors"
        >
          {saving ? '...' : 'Add'}
        </button>
      </div>
    </div>
  );
}

/* ── New Shelf Modal ──────────────────────────────────────────── */

function NewShelfModal({
  token,
  onClose,
  onCreated,
}: {
  token: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch<Shelf>('/shelves', token, {
        method: 'POST',
        body: JSON.stringify({ name: name.trim() }),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create shelf');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">New shelf</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="shelf-name" className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
            <input
              id="shelf-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Currently reading"
              autoFocus
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors">Cancel</button>
            <button type="submit" disabled={saving || !name.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors">{saving ? 'Creating…' : 'Create shelf'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Icons ─────────────────────────────────────────────────────── */

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

