import { escapeHtmlAttr, plainTextExcerpt } from '../shared/ogPlainText';

type PublicPayload = {
  content: string;
  bookTitle: string;
  bookAuthor: string | null;
  authorName: string | null;
  page: number;
  details: { content: string; type: string }[];
};

function apiBase(): string {
  const u = process.env.API_URL ?? process.env.VITE_API_URL ?? '';
  return u.replace(/\/$/, '');
}

export type InsightOgResult = {
  status: number;
  body: string;
  headers: Record<string, string>;
};

/**
 * Build Open Graph HTML for a shared insight (used by Vercel serverless and Render static+Express).
 */
export async function renderInsightOg(params: {
  owner: string;
  book: string;
  page: number;
  host: string;
  proto: string;
}): Promise<InsightOgResult> {
  const { owner, book, page, host, proto } = params;
  const path = `/insight/${encodeURIComponent(owner)}/${encodeURIComponent(book)}/${page}`;
  const canonical = `${proto}://${host}${path}`;

  const notFoundHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>Not found</title></head><body><p>Not found.</p></body></html>`;
  const htmlHeaders = {
    'Content-Type': 'text/html; charset=utf-8',
  } as const;

  if (!owner || !book || !Number.isFinite(page) || page < 1) {
    return { status: 404, body: notFoundHtml, headers: { ...htmlHeaders } };
  }

  const base = apiBase();
  if (!base) {
    return {
      status: 500,
      body: 'API_URL or VITE_API_URL must be set for link previews.',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    };
  }

  const jsonUrl = `${base}/api/insights/public/page/${encodeURIComponent(owner)}/${encodeURIComponent(book)}/${page}`;
  let data: PublicPayload;
  try {
    const r = await fetch(jsonUrl, { headers: { Accept: 'application/json' } });
    if (!r.ok) {
      return { status: 404, body: notFoundHtml, headers: { ...htmlHeaders } };
    }
    data = (await r.json()) as PublicPayload;
  } catch {
    return {
      status: 502,
      body: 'Could not load insight.',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    };
  }

  let desc = plainTextExcerpt(data.content, 200);
  if (!desc && data.details?.length) {
    desc = plainTextExcerpt(data.details.map((d) => d.content).join(' '), 200);
  }
  if (!desc) desc = 'Shared insight on Page2Action.';

  const ogTitle = `${data.bookTitle} · p.${data.page} · Page2Action`;
  const e = (s: string) => escapeHtmlAttr(s);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${e(ogTitle)}</title>
  <meta property="og:title" content="${e(ogTitle)}" />
  <meta property="og:description" content="${e(desc)}" />
  <meta property="og:url" content="${e(canonical)}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Page2Action" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${e(ogTitle)}" />
  <meta name="twitter:description" content="${e(desc)}" />
  <link rel="canonical" href="${e(canonical)}" />
</head>
<body style="font-family:system-ui,sans-serif;padding:1.25rem;max-width:36rem;line-height:1.5;">
  <p style="margin:0 0 0.75rem;color:#333">${e(desc)}</p>
  <p style="margin:0"><a href="${e(canonical)}">Open in Page2Action</a></p>
</body>
</html>`;

  return {
    status: 200,
    body: html,
    headers: {
      ...htmlHeaders,
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  };
}
