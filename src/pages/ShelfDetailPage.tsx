import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { apiFetch } from '../lib/api';
import type { Shelf } from '../lib/types';
import ShelfView from '../components/ShelfView';

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

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;
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
