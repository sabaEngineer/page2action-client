/** URL segment from display name: first + last word when possible; else email local part; else "reader". */
export function sharePathSegmentFromUser(
  name: string | null | undefined,
  email: string | null | undefined,
): string {
  const raw = (name ?? '').trim();
  if (raw) {
    const parts = raw.split(/\s+/).filter(Boolean);
    const label =
      parts.length >= 2
        ? `${parts[0]} ${parts[parts.length - 1]}`
        : parts[0];
    const s = slugifySegment(label);
    if (s) return s;
  }
  if (email) {
    const local = email.split('@')[0] ?? '';
    const s = slugifySegment(local);
    if (s) return s;
  }
  return 'reader';
}

function slugifySegment(input: string): string {
  const s = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return s || '';
}

export function publicShelfShareUrl(
  origin: string,
  shareSlug: string,
  name: string | null | undefined,
  email: string | null | undefined,
): string {
  const who = sharePathSegmentFromUser(name, email);
  const base = origin.replace(/\/$/, '');
  return `${base}/s/${who}/${shareSlug}`;
}

export function publicBookshelfShareUrl(
  origin: string,
  shareSlug: string,
  name: string | null | undefined,
  email: string | null | undefined,
): string {
  const who = sharePathSegmentFromUser(name, email);
  const base = origin.replace(/\/$/, '');
  return `${base}/bookshelf/${who}/${shareSlug}`;
}

/** Single shared insight page: `/insight/:ownerSlug/:bookSlug/:page` */
export function publicInsightShareUrl(
  origin: string,
  path: { ownerSlug: string; bookSlug: string; page: number },
): string {
  const base = origin.replace(/\/$/, '');
  const { ownerSlug, bookSlug, page } = path;
  return `${base}/insight/${encodeURIComponent(ownerSlug)}/${encodeURIComponent(bookSlug)}/${page}`;
}
