import type { InsightStyle } from './types';

/** Styles available on the notifications page (Today’s takeaway excluded for now). */
export type NotifiableInsightStyle = Exclude<InsightStyle, 'TODAYS_TAKEAWAY'>;

export const NOTIFICATION_STYLE_ORDER: NotifiableInsightStyle[] = [
  'MORNING_BOOST',
  'DO_IT_NOW',
  'SPREAD_THE_IDEA',
  'APPLY_TODAY',
];

export const NOTIFICATION_STYLE_UI: Record<
  NotifiableInsightStyle,
  { label: string; emoji: string; blurb: string }
> = {
  MORNING_BOOST: {
    label: 'Morning Boost',
    emoji: '☀️',
    blurb: 'Short energising reminder',
  },
  DO_IT_NOW: {
    label: 'Do it now',
    emoji: '⚡',
    blurb: 'A concrete step to take',
  },
  SPREAD_THE_IDEA: {
    label: 'Spread the idea',
    emoji: '💡',
    blurb: 'Something worth sharing',
  },
  APPLY_TODAY: {
    label: 'Apply today',
    emoji: '🎯',
    blurb: 'Try this in real life today',
  },
};
