export type Book = {
  id: string;
  title: string;
  author: string | null;
  shelfId: string | null;
  userId: string;
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

export type Insight = {
  id: string;
  content: string;
  style: InsightStyle | null;
  bookId: string;
  userId: string;
  position: number;
  details: InsightDetail[];
  book?: { id: string; title: string; author: string | null };
  createdAt: string;
  updatedAt: string;
};
