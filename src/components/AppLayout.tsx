import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { useDeliveryTimeZoneSync } from '../hooks/useDeliveryTimeZoneSync';
import { ImmersiveFullscreenProvider, useImmersiveFullscreenOptional } from '../context/immersive-fullscreen-context';
import Sidebar, { MobileNav } from './Sidebar';

function AppLayoutShell() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  useDeliveryTimeZoneSync(token);
  const { pathname } = useLocation();
  const immersive = useImmersiveFullscreenOptional()?.immersive ?? false;
  /** Insights (non-immersive): fill viewport and scroll inside the book, not the whole app shell. */
  const insightsInternalScroll = pathname === '/insights' && !immersive;

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (immersive) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [immersive]);

  if (!user) return null;

  return (
    <div
      className={`min-h-screen bg-gray-950 text-gray-100 flex ${immersive ? 'overflow-hidden h-[100dvh] max-h-[100dvh]' : ''}`}
    >
      {!immersive ? <Sidebar /> : null}

      <div
        className={`flex-1 flex flex-col min-w-0 min-h-0 ${
          immersive || insightsInternalScroll ? 'overflow-hidden' : ''
        } ${insightsInternalScroll ? 'h-dvh max-h-dvh' : ''}`}
      >
        <main
          className={`flex-1 hide-scrollbar min-h-0 ${
            immersive
              ? 'p-0 overflow-hidden'
              : insightsInternalScroll
                ? 'flex flex-col overflow-hidden px-6 py-8 pb-24 lg:pb-8'
                : 'px-6 py-8 pb-24 lg:pb-8 overflow-y-auto'
          }`}
        >
          <Outlet />
        </main>
      </div>

      {!immersive ? <MobileNav /> : null}
    </div>
  );
}

export default function AppLayout() {
  return (
    <ImmersiveFullscreenProvider>
      <AppLayoutShell />
    </ImmersiveFullscreenProvider>
  );
}
