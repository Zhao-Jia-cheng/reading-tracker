export type ReadStatus = 'to-read' | 'reading' | 'finished';

export interface LibraryBook {
  /** Unique key from Open Library, e.g. "/works/OL45883W" */
  key: string;
  title: string;
  author: string;
  firstPublishYear: number | null;
  /** Open Library cover_i field — null when not available */
  coverId: number | null;
  status: ReadStatus;
  /** Star rating 1–5, only set when status === 'finished' */
  rating: number | null;
  /** ISO timestamp so we can sort by date added */
  addedAt: string;
}

export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
}

export interface OpenLibraryResponse {
  docs: OpenLibraryDoc[];
}

export type SortField = 'title' | 'author' | 'addedAt';
export type SortDir = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  dir: SortDir;
}
