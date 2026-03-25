import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import Sidebar, { MobileNav } from './Sidebar';

export default function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Page content */}
        <main className="flex-1 px-6 py-8 pb-24 lg:pb-8 overflow-y-auto hide-scrollbar">
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
