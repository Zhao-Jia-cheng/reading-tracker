import type { LibraryBook, ReadStatus } from './types';

interface BookCardProps {
  book: LibraryBook;
  onStatusChange: (key: string, status: ReadStatus) => void;
  onDelete: (key: string) => void;
  onRate: (key: string, rating: number) => void;
}

const STATUS_ORDER: ReadStatus[] = ['to-read', 'reading', 'finished'];

const STATUS_LABEL: Record<ReadStatus, string> = {
  'to-read': 'To Read',
  reading: 'Reading',
  finished: 'Finished',
};

const STATUS_COLORS: Record<ReadStatus, string> = {
  'to-read': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  reading: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  finished: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};

export default function BookCard({
  book,
  onStatusChange,
  onDelete,
  onRate,
}: BookCardProps) {
  const currentIdx = STATUS_ORDER.indexOf(book.status);
  const canGoBack = currentIdx > 0;
  const canGoForward = currentIdx < STATUS_ORDER.length - 1;

  const coverUrl = book.coverId
    ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`
    : null;

  return (
    <div className="flex gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      {/* Cover */}
      <div className="flex-shrink-0 w-14 h-20 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-700">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs text-center p-1">
            No cover
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug line-clamp-2">
          {book.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          {book.author}
          {book.firstPublishYear ? ` · ${book.firstPublishYear}` : ''}
        </p>

        {/* Status badge */}
        <span
          className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[book.status]}`}
        >
          {STATUS_LABEL[book.status]}
        </span>

        {/* Star rating — only for finished */}
        {book.status === 'finished' && (
          <div className="flex gap-0.5 mt-2" role="group" aria-label="Rate this book">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onRate(book.key, star)}
                aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                className={`text-lg leading-none transition-colors ${
                  book.rating !== null && star <= book.rating
                    ? 'text-amber-400'
                    : 'text-slate-300 dark:text-slate-600 hover:text-amber-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {canGoBack && (
            <button
              onClick={() => onStatusChange(book.key, STATUS_ORDER[currentIdx - 1])}
              className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              ← {STATUS_LABEL[STATUS_ORDER[currentIdx - 1]]}
            </button>
          )}
          {canGoForward && (
            <button
              onClick={() => onStatusChange(book.key, STATUS_ORDER[currentIdx + 1])}
              className="text-xs px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors font-medium"
            >
              → {STATUS_LABEL[STATUS_ORDER[currentIdx + 1]]}
            </button>
          )}
          <button
            onClick={() => onDelete(book.key)}
            className="text-xs px-2 py-1 rounded-md bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors ml-auto"
            aria-label={`Remove ${book.title} from library`}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
