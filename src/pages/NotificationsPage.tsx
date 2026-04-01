import { useAuth } from '../context/auth';
import NotificationScheduleCards from '../components/NotificationScheduleCards';

export default function NotificationsPage() {
  const { token } = useAuth();

  if (!token) return null;

  return (
    <section className="text-left mx-auto w-full max-w-2xl">
      <header className="mb-6 sm:mb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-amber-600/80 mb-2">Email</p>
        <h1
          className="text-2xl sm:text-[1.75rem] font-normal text-white tracking-tight text-balance"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          Notifications
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-300 max-w-xl">
          Pick a send time for each insight style. Time zone follows this device automatically. We send at most one
          email per style per day with the next insight in rotation for that style (never-emailed first, then it cycles).
          Use <span className="text-gray-200">Send now</span> to send that next insight immediately.
        </p>
      </header>

      <NotificationScheduleCards token={token} />
    </section>
  );
}
