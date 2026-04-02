/**
 * Production static + SPA fallback for Render (and any Node host).
 * Link-preview bots get OG HTML; browsers get the Vite-built SPA.
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderInsightOg } from './insightOgPreview';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

/** Same list as middleware.ts (Vercel). */
const BOT_UA =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|Discordbot|TelegramBot|WhatsApp|Applebot|Googlebot|bingbot|Google-InspectionTool|Pinterest|vkShare|SkypeUriPreview|Embedly|redditbot|Slack-ImgProxy|outbrain|Quora[\s-]Link[\s-]Preview/i;

const app = express();

app.get('/insight/:owner/:book/:page', async (req, res, next) => {
  const ua = req.get('user-agent') ?? '';
  if (!BOT_UA.test(ua)) {
    return res.sendFile(path.join(distDir, 'index.html'), (err) => {
      if (err) next(err);
    });
  }

  const pageNum = Number.parseInt(req.params.page, 10);
  const xfProto = req.get('x-forwarded-proto');
  const proto = (Array.isArray(xfProto) ? xfProto[0] : xfProto) || 'https';
  const host = req.get('host') ?? '';

  const result = await renderInsightOg({
    owner: req.params.owner,
    book: req.params.book,
    page: pageNum,
    host,
    proto,
  });

  for (const [k, v] of Object.entries(result.headers)) {
    res.setHeader(k, v);
  }
  res.status(result.status).send(result.body);
});

app.use(express.static(distDir));

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) next(err);
  });
});

const port = Number(process.env.PORT) || 4173;
app.listen(port, () => {
  console.log(`Static server listening on port ${port}`);
});
