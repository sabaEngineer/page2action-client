import { next, rewrite } from '@vercel/edge';

/** Link-preview and search crawlers: serve OG HTML from /api/og-insight instead of the SPA shell. */
const BOT_UA =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|Discordbot|TelegramBot|WhatsApp|Applebot|Googlebot|bingbot|Google-InspectionTool|Pinterest|vkShare|SkypeUriPreview|Embedly|redditbot|Slack-ImgProxy|outbrain|Quora[\s-]Link[\s-]Preview/i;

export const config = {
  matcher: '/insight/:path*',
};

export default function middleware(request: Request): Response {
  const ua = request.headers.get('user-agent') ?? '';
  if (!BOT_UA.test(ua)) {
    return next();
  }

  const url = new URL(request.url);
  const m = /^\/insight\/([^/]+)\/([^/]+)\/(\d+)\/?$/.exec(url.pathname);
  if (!m) {
    return next();
  }

  const rewriteUrl = new URL('/api/og-insight', url.origin);
  rewriteUrl.searchParams.set('owner', decodeURIComponent(m[1]));
  rewriteUrl.searchParams.set('book', decodeURIComponent(m[2]));
  rewriteUrl.searchParams.set('page', m[3]);

  return rewrite(rewriteUrl);
}
