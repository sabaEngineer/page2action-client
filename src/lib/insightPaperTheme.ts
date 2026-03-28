/** Warm parchment palette — shared by Insights book view and public share page. */
export const insightPaper = {
  bg: 'bg-[#f5f0e1]',
  bgGrad: 'from-[#f5f0e1] to-[#ebe5d3]',
  text: 'text-[#3b3225]',
  textMuted: 'text-[#8a7e6b]',
  textLight: 'text-[#b0a48d]',
  border: 'border-[#d9ceb8]',
  line: '#d9ceb8',
  accent: 'text-[#8b4513]',
  accentBg: 'bg-[#8b4513]',
} as const;

/**
 * Matches Tiptap `PageContent` / `NewPage` editor body classes so read-only HTML
 * matches the in-app page.
 */
export const INSIGHT_BODY_TEXT_CLASS =
  'flex-1 w-full bg-transparent outline-none text-[16px] leading-[26px] min-h-[400px] max-w-none sm:text-[15px]';

export const INSIGHT_PAPER_BOX_SHADOW =
  '4px 4px 20px rgba(0,0,0,0.5), inset 0 0 60px rgba(139,69,19,0.04)';
