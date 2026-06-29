import { useState, useEffect, useReducer } from 'react';
import type { LibraryBook, ReadStatus, SortConfig, SortField } from './types';
import SearchBar from './SearchBar';
import BookCard from './BookCard';
import StatsBar from './StatsBar';

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

const LIBRARY_KEY = 'reading-tracker:library';
const THEME_KEY = 'reading-tracker:dark';

function loadLibrary(): LibraryBook[] {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LibraryBook[];
  } catch {
    return [];
  }
}

function saveLibrary(books: LibraryBook[]) {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(books));
  } catch {
    // quota exceeded or private mode — silently ignore
  }
}

function loadDark(): boolean {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === null) return false;
    return JSON.parse(raw) as boolean;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Library reducer
// ---------------------------------------------------------------------------

type LibraryAction =
  | { type: 'ADD'; book: LibraryBook }
  | { type: 'SET_STATUS'; key: string; status: ReadStatus }
  | { type: 'DELETE'; key: string }
  | { type: 'RATE'; key: string; rating: number };

function libraryReducer(state: LibraryBook[], action: LibraryAction): LibraryBook[] {
  switch (action.type) {
    case 'ADD': {
      if (state.some((b) => b.key === action.book.key)) return state;
      return [action.book, ...state];
    }
    case 'SET_STATUS':
      return state.map((b) =>
        b.key === action.key
          ? { ...b, status: action.status, rating: action.status !== 'finished' ? null : b.rating }
          : b
      );
    case 'DELETE':
      return state.filter((b) => b.key !== action.key);
    case 'RATE':
      return state.map((b) =>
        b.key === action.key && b.status === 'finished' ? { ...b, rating: action.rating } : b
      );
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

function sortBooks(books: LibraryBook[], config: SortConfig): LibraryBook[] {
  return [...books].sort((a, b) => {
    let cmp = 0;
    if (config.field === 'title') cmp = a.title.localeCompare(b.title);
    else if (config.field === 'author') cmp = a.author.localeCompare(b.author);
    else cmp = a.addedAt.localeCompare(b.addedAt);
    return config.dir === 'asc' ? cmp : -cmp;
  });
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_OPTIONS: { value: ReadStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'to-read', label: 'To Read' },
  { value: 'reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
];

const SORT_FIELDS: { value: SortField; label: string }[] = [
  { value: 'addedAt', label: 'Date Added' },
  { value: 'title', label: 'Title' },
  { value: 'author', label: 'Author' },
];

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(loadDark);
  const [library, dispatch] = useReducer(libraryReducer, undefined, loadLibrary);
  const [filterStatus, setFilterStatus] = useState<ReadStatus | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'addedAt', dir: 'desc' });

  // Persist library
  useEffect(() => { saveLibrary(library); }, [library]);

  // Persist theme + apply class to <html>
  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, JSON.stringify(isDark)); } catch { /* ignore */ }
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const libraryKeys = new Set(library.map((b) => b.key));
  const filtered = library.filter((b) => filterStatus === 'all' || b.status === filterStatus);
  const displayed = sortBooks(filtered, sortConfig);

  function toggleSortField(field: SortField) {
    setSortConfig((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'asc' }
    );
  }

  function toggleSortDir() {
    setSortConfig((prev) => ({ ...prev, dir: prev.dir === 'asc' ? 'desc' : 'asc' }));
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">📚</span>
            <h1 className="text-lg font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
              Reading Tracker
            </h1>
          </div>
          <button
            onClick={() => setIsDark((d) => !d)}
            aria-label="Toggle dark mode"
            className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            Find a Book
          </h2>
          <SearchBar
            libraryKeys={libraryKeys}
            onAddBook={(b) => dispatch({ type: 'ADD', book: b })}
          />
        </section>

        {/* Stats */}
        {library.length > 0 && (
          <section>
            <StatsBar books={library} />
          </section>
        )}

        {/* Library */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              My Library
              {library.length > 0 && (
                <span className="ml-2 text-slate-400 dark:text-slate-500 normal-case font-normal">
                  ({library.length} {library.length === 1 ? 'book' : 'books'})
                </span>
              )}
            </h2>

            {library.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center text-xs">
                {/* Status filter */}
                <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setFilterStatus(value)}
                      className={`px-2.5 py-1.5 transition-colors ${
                        filterStatus === value
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 dark:text-slate-500">Sort:</span>
                  <select
                    value={sortConfig.field}
                    onChange={(e) => toggleSortField(e.target.value as SortField)}
                    className="text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {SORT_FIELDS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <button
                    onClick={toggleSortDir}
                    aria-label="Toggle sort direction"
                    className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {sortConfig.dir === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Empty — no books */}
          {library.length === 0 && (
            <div className="text-center py-20">
              <p className="text-5xl mb-4 select-none">📖</p>
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Your library is empty</p>
              <p className="text-sm mt-1 text-slate-400 dark:text-slate-500">Search for a book above to get started.</p>
            </div>
          )}

          {/* Empty — filter matches nothing */}
          {library.length > 0 && displayed.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3 select-none">🔎</p>
              <p className="text-base font-medium text-slate-600 dark:text-slate-400">No books match this filter</p>
              <p className="text-sm mt-1 text-slate-400 dark:text-slate-500">Try a different status filter.</p>
            </div>
          )}

          {/* Grid */}
          {displayed.length > 0 && (
            <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {displayed.map((book) => (
                <li key={book.key}>
                  <BookCard
                    book={book}
                    onStatusChange={(key, status) => dispatch({ type: 'SET_STATUS', key, status })}
                    onDelete={(key) => dispatch({ type: 'DELETE', key })}
                    onRate={(key, rating) => dispatch({ type: 'RATE', key, rating })}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="text-center py-6 text-xs text-slate-400 dark:text-slate-600">
        CSCI 39548 · Assignment 3 · Reading Tracker
      </footer>
    </div>
  );
}
