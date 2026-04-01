import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../lib/api';
import { NOTIFICATION_STYLE_ORDER, NOTIFICATION_STYLE_UI } from '../lib/notificationStyles';
import type {
  InsightStyle,
  NotificationScheduleRow,
  SendNotificationNowResponse,
  UserNotificationsResponse,
} from '../lib/types';

function toTimeValue(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function parseTimeValue(s: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function ScheduleToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={enabled ? 'On' : 'Off'}
      onClick={() => onChange(!enabled)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 ${
        enabled ? 'bg-amber-700/90' : 'bg-gray-700'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function NotificationScheduleCards({ token }: { token: string }) {
  const [data, setData] = useState<UserNotificationsResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendNowBusy, setSendNowBusy] = useState<InsightStyle | null>(null);
  const [sendNowHint, setSendNowHint] = useState<Partial<Record<InsightStyle, string>>>({});
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetch<UserNotificationsResponse>('/users/me/notifications', token);
      if (res) setData(res);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not load');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = useCallback(
    async (body: {
      deliveryTimeZone?: string;
      style?: InsightStyle;
      enabled?: boolean;
      localHour?: number;
      localMinute?: number;
    }) => {
      setSaveError(null);
      try {
        const res = await apiFetch<UserNotificationsResponse>('/users/me/notifications', token, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        if (res) setData(res);
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : 'Could not save');
      }
    },
    [token],
  );

  const sendNow = useCallback(
    async (style: InsightStyle) => {
      setSendNowBusy(style);
      setSendNowHint((h) => ({ ...h, [style]: '' }));
      try {
        const res = await apiFetch<SendNotificationNowResponse>(
          '/users/me/notifications/send-now',
          token,
          {
            method: 'POST',
            body: JSON.stringify({ style }),
          },
        );
        if (res) {
          setSendNowHint((h) => ({
            ...h,
            [style]: res.sent ? 'Sent.' : res.message,
          }));
        }
      } catch (e) {
        setSendNowHint((h) => ({
          ...h,
          [style]: e instanceof Error ? e.message : 'Could not send',
        }));
      } finally {
        setSendNowBusy(null);
      }
    },
    [token],
  );

  const scheduleMap = new Map<InsightStyle, NotificationScheduleRow>();
  data?.schedules.forEach((s) => scheduleMap.set(s.style, s));

  const onTimeChange = (style: InsightStyle, value: string) => {
    const parsed = parseTimeValue(value);
    if (!parsed) return;
    setData((d) => {
      if (!d) return d;
      return {
        ...d,
        schedules: d.schedules.map((s) =>
          s.style === style
            ? { ...s, localHour: parsed.hour, localMinute: parsed.minute }
            : s,
        ),
      };
    });
    const key = style;
    const prev = timers.current.get(key);
    if (prev) clearTimeout(prev);
    timers.current.set(
      key,
      setTimeout(() => {
        void patch({
          style,
          localHour: parsed.hour,
          localMinute: parsed.minute,
        });
        timers.current.delete(key);
      }, 400),
    );
  };

  useEffect(
    () => () => {
      timers.current.forEach((t) => clearTimeout(t));
    },
    [],
  );

  if (loading && !data) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {NOTIFICATION_STYLE_ORDER.map((s) => (
          <div
            key={s}
            className="h-32 rounded-xl border border-gray-800/80 bg-gray-900/25 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (loadError) {
    return <p className="text-sm text-red-400">{loadError}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {saveError ? (
        <p className="text-xs text-red-400 rounded-lg border border-red-900/35 bg-red-950/20 px-3 py-2">{saveError}</p>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {NOTIFICATION_STYLE_ORDER.map((style) => {
          const row = scheduleMap.get(style);
          if (!row) return null;
          const ui = NOTIFICATION_STYLE_UI[style];
          return (
            <div
              key={style}
              className={`flex flex-col rounded-xl border border-gray-800/90 bg-gradient-to-b from-gray-900/50 to-gray-950/80 p-3 shadow-sm shadow-black/10 min-h-[9.5rem] ${
                row.enabled ? 'ring-1 ring-amber-900/25' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <span className="text-base leading-none" aria-hidden>
                    {ui.emoji}
                  </span>
                  <h3 className="text-xs font-semibold text-white mt-1 leading-tight">{ui.label}</h3>
                  <p className="text-[10px] text-gray-400 leading-snug mt-0.5 line-clamp-2">{ui.blurb}</p>
                </div>
                <ScheduleToggle
                  enabled={row.enabled}
                  onChange={(on) => {
                    setData((d) => {
                      if (!d) return d;
                      return {
                        ...d,
                        schedules: d.schedules.map((s) =>
                          s.style === style ? { ...s, enabled: on } : s,
                        ),
                      };
                    });
                    void patch({ style, enabled: on });
                  }}
                />
              </div>
              <div className="mt-auto pt-1 space-y-1.5">
                <label className="block">
                  <span className="sr-only">Send time for {ui.label}</span>
                  <input
                    type="time"
                    step={60}
                    disabled={!row.enabled}
                    value={toTimeValue(row.localHour, row.localMinute)}
                    onChange={(e) => onTimeChange(style, e.target.value)}
                    className="w-full rounded-md border border-gray-700/90 bg-gray-950/90 px-2 py-1.5 text-xs text-white tabular-nums focus:border-amber-800/50 focus:outline-none focus:ring-1 focus:ring-amber-600/25 disabled:opacity-35"
                  />
                </label>
                <button
                  type="button"
                  disabled={sendNowBusy === style}
                  onClick={() => void sendNow(style)}
                  className="self-start rounded-md border border-amber-700/60 bg-amber-900/40 px-2 py-1 text-xs leading-4 font-semibold text-white hover:bg-amber-900/55 disabled:opacity-70 disabled:pointer-events-none transition-colors whitespace-nowrap"
                >
                  {sendNowBusy === style ? 'Sending…' : 'Send now'}
                </button>
                {sendNowHint[style] ? (
                  <p
                    className={`text-[10px] leading-snug ${
                      sendNowHint[style] === 'Sent.' ? 'text-emerald-300' : 'text-gray-200'
                    }`}
                  >
                    {sendNowHint[style]}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
