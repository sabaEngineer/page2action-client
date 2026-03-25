import { useState } from 'react';
import { sharePathSegmentFromUser } from '../lib/shareUrl';

export default function ShareLinkCopyButton({
  url,
  kind,
  name,
  email,
  prefixText,
}: {
  url: string;
  kind: 'bookshelf' | 'shelf';
  name?: string | null;
  email?: string | null;
  prefixText: string;
}) {
  const [copied, setCopied] = useState(false);
  const who = sharePathSegmentFromUser(name, email);
  const label = `${kind}/${who}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
      <span>{prefixText}</span>
      <button
        type="button"
        onClick={() => void copy()}
        title="Copy link"
        aria-label={copied ? 'Link copied' : `Copy share link (${label})`}
        className="group inline-flex items-center gap-1.5 rounded-md border border-gray-700/90 bg-gray-900/90 px-2 py-0.5 font-mono text-[10px] tracking-tight text-indigo-300/90 hover:border-indigo-500/35 hover:bg-gray-800 transition-colors"
      >
        {copied ? (
          <span className="text-emerald-400/90">Copied</span>
        ) : (
          <>
            <span>{label}</span>
            <CopyIcon className="h-3 w-3 shrink-0 text-gray-500 transition-colors group-hover:text-indigo-400/90" />
          </>
        )}
      </button>
    </p>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}
