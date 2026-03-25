const base = import.meta.env.VITE_API_URL ?? '';

export function apiPath(path: string) {
  const prefixed = path.startsWith('/api/') ? path : `/api${path}`;
  return `${base}${prefixed}`;
}

export async function apiFetch<T = unknown>(
  path: string,
  token: string | null,
  init?: RequestInit,
): Promise<T | null> {
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(apiPath(path), { ...init, headers });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      if (j.message) msg = Array.isArray(j.message) ? j.message.join(', ') : j.message;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json() as Promise<T>;
}
