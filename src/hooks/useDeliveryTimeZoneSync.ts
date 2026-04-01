import { useEffect } from 'react';
import { apiFetch } from '../lib/api';

function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
  } catch {
    return 'UTC';
  }
}

/** Keeps server `deliveryTimeZone` aligned with the device (no UI). */
export function useDeliveryTimeZoneSync(token: string | null) {
  useEffect(() => {
    if (!token) return;

    const sync = () => {
      void apiFetch('/users/me/notifications', token, {
        method: 'PATCH',
        body: JSON.stringify({ deliveryTimeZone: browserTimeZone() }),
      }).catch(() => {
        /* offline / stale token */
      });
    };

    sync();
    const onVis = () => {
      if (document.visibilityState === 'visible') sync();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [token]);
}
