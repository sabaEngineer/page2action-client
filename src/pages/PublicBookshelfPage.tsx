import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import type { PublicBookshelf } from '../lib/types';
import { BookSpine } from '../components/ShelfView';

export default function PublicBookshelfPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicBookshelf | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    apiFetch<PublicBookshelf>(`/shelves/public/bookshelf/${slug}`, null)
      .then(setData)
      .catch(() => setError('Bookshelf not found or is private.'));
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center px-6">
        <p className="text-gray-400">{error}</p>
        <Link to="/" className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm">Go home</Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  const ownerName = data.name || data.email;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 px-6 py-12 max-w-5xl mx-auto">
      <p className="text-xs text-gray-500 uppercase tracking-wide">Shared bookshelf</p>
      <h1 className="mt-2 text-2xl font-bold text-white">{ownerName}'s bookshelf</h1>

      <div className="mt-10 space-y-0">
        {data.shelves.map((shelf) => (
          <div key={shelf.id} className="relative">
            <div className="flex items-center gap-3 px-5 pt-4 pb-2">
              <h3 className="text-sm font-semibold text-gray-300">{shelf.name}</h3>
              <span className="text-xs text-gray-600">{shelf.books.length} book{shelf.books.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-end gap-4 px-5 pb-0 min-h-[200px] flex-wrap">
              {shelf.books.map((book) => (
                <BookSpine key={book.id} book={book} />
              ))}
              {shelf.books.length === 0 && (
                <p className="text-sm text-gray-600 py-16">Empty shelf.</p>
              )}
            </div>
            <div className="h-3 rounded-b-lg bg-gradient-to-b from-amber-800/50 to-amber-950/50 border-t border-amber-700/30 shadow-[0_4px_12px_rgba(0,0,0,0.4)]" />
            <div className="h-1.5 mx-4 bg-gradient-to-b from-black/20 to-transparent rounded-b" />
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link to="/" className="text-sm text-indigo-400 hover:text-indigo-300">Page2Action</Link>
      </div>
    </div>
  );
}
