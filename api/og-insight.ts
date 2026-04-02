import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderInsightOg } from '../server/insightOgPreview';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const owner = typeof req.query.owner === 'string' ? req.query.owner : '';
  const book = typeof req.query.book === 'string' ? req.query.book : '';
  const pageRaw = typeof req.query.page === 'string' ? req.query.page : '';
  const page = Number.parseInt(pageRaw, 10);

  const xfProto = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(xfProto) ? xfProto[0] : xfProto) || 'https';
  const host = req.headers.host ?? '';

  const result = await renderInsightOg({ owner, book, page, host, proto });

  for (const [k, v] of Object.entries(result.headers)) {
    res.setHeader(k, v);
  }
  res.status(result.status).send(result.body);
}
