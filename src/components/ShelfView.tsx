import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { apiFetch } from '../lib/api';
import { publicShelfShareUrl } from '../lib/shareUrl';
import type { Book, Shelf } from '../lib/types';
import ShareLinkCopyButton from './ShareLinkCopyButton';

/* ── Colors ────────────────────────────────────────────────────── */

const SPINE_COLORS = [
  'from-indigo-700 to-indigo-900',
  'from-violet-700 to-violet-900',
  'from-emerald-700 to-emerald-900',
  'from-amber-700 to-amber-900',
  'from-rose-700 to-rose-900',
  'from-cyan-700 to-cyan-900',
  'from-fuchsia-700 to-fuchsia-900',
  'from-sky-700 to-sky-900',
  'from-orange-700 to-orange-900',
  'from-teal-700 to-teal-900',
];

function colorForBook(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return SPINE_COLORS[Math.abs(hash) % SPINE_COLORS.length];
}

/* ── BookSpine (shared, exported) ──────────────────────────────── */

export function BookSpine({ book, onClick }: { book: Book; onClick?: () => void }) {
  const color = colorForBook(book.id);
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`group relative flex-shrink-0 rounded transition-all duration-200 ${onClick ? 'cursor-pointer hover:-translate-y-2 hover:shadow-lg hover:shadow-black/40' : ''}`}
      style={{ height: '180px', width: '120px' }}
    >
      <div
        className={`absolute inset-0 rounded bg-gradient-to-br ${color} shadow-[inset_-3px_0_6px_rgba(0,0,0,0.3),inset_2px_0_4px_rgba(255,255,255,0.06)]`}
      />
      <div className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l bg-black/25" />
      <div className="absolute inset-2 rounded-sm border border-white/10" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
        <span className="text-xs font-bold text-white/95 leading-snug line-clamp-3">
          {book.title}
        </span>
        {book.author && (
          <span className="mt-1.5 text-[10px] text-white/50 leading-tight line-clamp-1">
            {book.author}
          </span>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-5 rounded-b bg-black/15" />
    </Tag>
  );
}

/* ── ShelfView (full detail page for one shelf) ────────────────── */

export default function ShelfView({
  shelf,
  token,
  onChanged,
}: {
  shelf: Shelf;
  token: string;
  onChanged: () => void;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [sharing, setSharing] = useState(false);

  async function togglePublic() {
    setSharing(true);
    try {
      await apiFetch(`/shelves/${shelf.id}/toggle-public`, token, { method: 'POST' });
      onChanged();
    } catch {
      /* ignore */
    } finally {
      setSharing(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete shelf "${shelf.name}"?`)) return;
    try {
      await apiFetch(`/shelves/${shelf.id}`, token, { method: 'DELETE' });
      navigate('/books', { replace: true });
    } catch {
      /* ignore */
    }
  }

  const shareUrl =
    shelf.isPublic && shelf.shareSlug
      ? publicShelfShareUrl(
          window.location.origin,
          shelf.shareSlug,
          user?.name,
          user?.email ?? null,
        )
      : null;

  return (
    <div className="mt-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-white">{shelf.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{shelf.books.length} book{shelf.books.length !== 1 ? 's' : ''}</p>
          {shareUrl && (
            <ShareLinkCopyButton
              url={shareUrl}
              kind="shelf"
              name={user?.name}
              email={user?.email}
              prefixText="This shelf is public."
            />
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => void togglePublic()}
            disabled={sharing}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              shelf.isPublic
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30'
                : 'border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {shelf.isPublic ? 'Public' : 'Make public'}
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-500 hover:text-red-400 hover:border-red-900/40 transition-colors"
          >
            Delete shelf
          </button>
        </div>
      </div>

      {/* Books */}
      <div className="mt-8 relative">
        <div className="flex items-end gap-4 px-5 pb-0 min-h-[200px] flex-wrap">
          {shelf.books.map((book) => (
            <BookSpine key={book.id} book={book} onClick={() => setSelectedBook(book)} />
          ))}
          <InlineAddBook shelfId={shelf.id} token={token} onAdded={onChanged} />
        </div>
        <div className="h-3 rounded-b-lg bg-gradient-to-b from-amber-800/50 to-amber-950/50 border-t border-amber-700/30 shadow-[0_4px_12px_rgba(0,0,0,0.4)]" />
        <div className="h-1.5 mx-4 bg-gradient-to-b from-black/20 to-transparent rounded-b" />
      </div>

      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          token={token}
          onClose={() => setSelectedBook(null)}
          onChanged={() => { setSelectedBook(null); onChanged(); }}
        />
      )}
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

/* ── Book Detail Modal ─────────────────────────────────────────── */

function BookDetailModal({
  book,
  token,
  onClose,
  onChanged,
}: {
  book: Book;
  token: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const color = colorForBook(book.id);

  async function save() {
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch<Book>(`/books/${book.id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ title: title.trim(), author: author.trim() }),
      });
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Remove "${book.title}"?`)) return;
    setBusy(true);
    try {
      await apiFetch(`/books/${book.id}`, token, { method: 'DELETE' });
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl overflow-hidden">
        <div className={`h-20 bg-gradient-to-br ${color}`} />
        <div className="p-6">
          {editing ? (
            <div className="flex flex-col gap-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-2 mt-1">
                <button type="button" disabled={busy || !title.trim()} onClick={() => void save()} className="flex-1 rounded-lg bg-indigo-600 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-40">Save</button>
                <button type="button" disabled={busy} onClick={() => { setEditing(false); setTitle(book.title); setAuthor(book.author ?? ''); setError(null); }} className="flex-1 rounded-lg border border-gray-700 py-2 text-xs text-gray-300 hover:bg-gray-800">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-white">{book.title}</h3>
              {book.author && <p className="mt-1 text-sm text-gray-400">by {book.author}</p>}
              <p className="mt-3 text-xs text-gray-600">Added {new Date(book.createdAt).toLocaleDateString()}</p>
              {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
              <div className="flex gap-2 mt-5">
                <button type="button" disabled={busy} onClick={() => setEditing(true)} className="flex-1 rounded-lg border border-gray-700 py-2 text-xs font-medium text-gray-300 hover:bg-gray-800 transition-colors">Edit</button>
                <button type="button" disabled={busy} onClick={() => void remove()} className="flex-1 rounded-lg border border-red-900/40 py-2 text-xs font-medium text-red-400 hover:bg-red-950/30 transition-colors">Delete</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
