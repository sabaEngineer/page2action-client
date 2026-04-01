export type Book = {
  id: string;
  title: string;
  author: string | null;
  shelfId: string | null;
  userId: string;
  /** Set when the user shares an insight from this book (public URL segment). */
  publicSlug?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Shelf = {
  id: string;
  name: string;
  position: number;
  isPublic: boolean;
  shareSlug: string | null;
  userId: string;
  books: Book[];
  createdAt: string;
  updatedAt: string;
};

export type ShareStatus = {
  allPublic: boolean;
  shareSlug: string | null;
};

export type PublicShelf = Shelf & {
  user: { name: string | null; email: string };
};

export type PublicBookshelf = {
  name: string | null;
  email: string;
  allPublic: boolean;
  shelves: Shelf[];
};

export type DetailType = 'EXAMPLE' | 'STORY' | 'NOTE';

export type InsightDetail = {
  id: string;
  content: string;
  type: DetailType;
  insightId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type InsightStyle =
  | 'MORNING_BOOST'
  | 'APPLY_TODAY'
  | 'DO_IT_NOW'
  | 'SPREAD_THE_IDEA'
  | 'TODAYS_TAKEAWAY';

export type InsightSharePath = {
  ownerSlug: string;
  bookSlug: string;
  page: number;
};

export type Insight = {
  id: string;
  content: string;
  style: InsightStyle | null;
  bookId: string;
  userId: string;
  position: number;
  isShared?: boolean;
  shareSlug?: string | null;
  /** Present when this page is shared and slugs exist (for copy link). */
  sharePath?: InsightSharePath | null;
  details: InsightDetail[];
  book?: { id: string; title: string; author: string | null; publicSlug?: string | null };
  createdAt: string;
  updatedAt: string;
};

/** Public GET /insights/public/page/… (read-only). */
export type PublicSharedInsight = {
  content: string;
  style: InsightStyle | null;
  details: { content: string; type: DetailType }[];
  bookTitle: string;
  bookAuthor: string | null;
  authorName: string | null;
  page: number;
  /** Footer denominator: insight count + 1 (“new page” slot), same as authenticated book view. */
  totalPages: number;
};

export type NotificationScheduleRow = {
  style: InsightStyle;
  enabled: boolean;
  localHour: number;
  localMinute: number;
};

export type UserNotificationsResponse = {
  deliveryTimeZone: string;
  schedules: NotificationScheduleRow[];
};
