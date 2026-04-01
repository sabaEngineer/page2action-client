import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { apiFetch } from '../lib/api';
import type { Shelf } from '../lib/types';
import ShelfView from '../components/ShelfView';
import { ShelfViewSkeleton } from '../components/BookshelfSkeleton';

export default function ShelfDetailPage() {
  const { shelfId } = useParams<{ shelfId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [shelf, setShelf] = useState<Shelf | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token || !shelfId) return;
    setLoading(true);
    try {
      const data = await apiFetch<Shelf>(`/shelves/${shelfId}`, token);
      setShelf(data);
    } catch {
      navigate('/books', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [token, shelfId, navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div aria-busy="true">
        <Link to="/books" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">
          &larr; All shelves
        </Link>
        <span className="sr-only">Loading shelf</span>
        <ShelfViewSkeleton />
      </div>
    );
  }
  if (!shelf) return null;

  return (
    <div>
      <Link to="/books" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">
        &larr; All shelves
      </Link>
      <ShelfView shelf={shelf} token={token!} onChanged={load} />
    </div>
  );
}
