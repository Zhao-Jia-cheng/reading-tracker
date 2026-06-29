import { useState, useEffect, useRef } from 'react';
import type { LibraryBook, OpenLibraryDoc, OpenLibraryResponse } from './types';

interface SearchBarProps {
  libraryKeys: Set<string>;
  onAddBook: (book: LibraryBook) => void;
}

export default function SearchBar({ libraryKeys, onAddBook }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OpenLibraryDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setSearched(false);
      setError(null);
      return;
    }

    const timeout = setTimeout(async () => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmed)}&limit=10`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        const data: OpenLibraryResponse = await res.json();
        setResults(data.docs);
        setSearched(true);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError('Could not fetch results. Check your connection and try again.');
        setResults([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [query]);

  function handleAdd(doc: OpenLibraryDoc) {
    const book: LibraryBook = {
      key: doc.key,
      title: doc.title,
      author: doc.author_name?.[0] ?? 'Unknown author',
      firstPublishYear: doc.first_publish_year ?? null,
      coverId: doc.cover_i ?? null,
      status: 'to-read',
      rating: null,
      addedAt: new Date().toISOString(),
    };
    onAddBook(book);
  }

  const showPanel = query.trim().length >= 2;

  return (
    <div className="relative">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a book to add…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 transition text-sm"
          aria-label="Search books"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin select-none">
            ⟳
          </span>
        )}
      </div>

      {/* Results panel */}
      {showPanel && (
        <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg max-h-80 overflow-y-auto">
          {loading && (
            <p className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">
              Searching…
            </p>
          )}

          {error && !loading && (
            <p className="p-4 text-sm text-rose-600 dark:text-rose-400 text-center">
              {error}
            </p>
          )}

          {!loading && !error && searched && results.length === 0 && (
            <p className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">
              No books found for "{query.trim()}"
            </p>
          )}

          {!loading && !error && results.length > 0 && (
            <ul>
              {results.map((doc) => {
                const alreadyAdded = libraryKeys.has(doc.key);
                const coverUrl = doc.cover_i
                  ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                  : null;
                return (
                  <li
                    key={doc.key}
                    className="flex items-center gap-3 px-3 py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0"
                  >
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-8 h-12 rounded overflow-hidden bg-slate-100 dark:bg-slate-700">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600 text-xs">
                          📖
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                        {doc.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {doc.author_name?.[0] ?? 'Unknown'}
                        {doc.first_publish_year ? ` · ${doc.first_publish_year}` : ''}
                      </p>
                    </div>

                    {/* Add button */}
                    <button
                      onClick={() => !alreadyAdded && handleAdd(doc)}
                      disabled={alreadyAdded}
                      className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        alreadyAdded
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {alreadyAdded ? 'Added' : 'Add'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
