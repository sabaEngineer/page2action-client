import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthCallback from './pages/AuthCallback';
import AppLayout from './components/AppLayout';
import BooksPage from './pages/BooksPage';
import ShelfDetailPage from './pages/ShelfDetailPage';
import InsightsPage from './pages/InsightsPage';
import NotificationsPage from './pages/NotificationsPage';
import PublicShelfPage from './pages/PublicShelfPage';
import PublicBookshelfPage from './pages/PublicBookshelfPage';
import PublicInsightPage from './pages/PublicInsightPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Public shared insight (single book “page”, read-only) */}
      <Route path="/insight/:owner/:book/:page" element={<PublicInsightPage />} />

      {/* Public share pages (no auth); name segment is cosmetic, slug is the secret token */}
      <Route path="/s/:who/:slug" element={<PublicShelfPage />} />
      <Route path="/s/:slug" element={<PublicShelfPage />} />
      <Route path="/bookshelf/:who/:slug" element={<PublicBookshelfPage />} />
      <Route path="/bookshelf/:slug" element={<PublicBookshelfPage />} />

      {/* Authenticated shell with sidebar */}
      <Route element={<AppLayout />}>
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:shelfId" element={<ShelfDetailPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/boosts" element={<Navigate to="/notifications" replace />} />
      </Route>
    </Routes>
  );
}
