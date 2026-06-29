import type { LibraryBook } from './types';

interface StatsBarProps {
  books: LibraryBook[];
}

export default function StatsBar({ books }: StatsBarProps) {
  const toRead = books.filter((b) => b.status === 'to-read').length;
  const reading = books.filter((b) => b.status === 'reading').length;
  const finished = books.filter((b) => b.status === 'finished').length;

  const ratedBooks = books.filter(
    (b) => b.status === 'finished' && b.rating !== null
  );
  const avgRating =
    ratedBooks.length > 0
      ? ratedBooks.reduce((sum, b) => sum + (b.rating ?? 0), 0) /
        ratedBooks.length
      : null;

  if (books.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-4 items-center justify-center sm:justify-start px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-sm">
      <Stat label="To Read" value={toRead} color="text-slate-600 dark:text-slate-300" />
      <Sep />
      <Stat label="Reading" value={reading} color="text-blue-600 dark:text-blue-400" />
      <Sep />
      <Stat label="Finished" value={finished} color="text-emerald-600 dark:text-emerald-400" />
      {avgRating !== null && (
        <>
          <Sep />
          <span className="text-amber-500 dark:text-amber-400 font-medium">
            ★ {avgRating.toFixed(1)} avg
          </span>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <span className={`${color} font-medium`}>
      <span className="font-bold">{value}</span> {label}
    </span>
  );
}

function Sep() {
  return <span className="text-slate-300 dark:text-slate-600 select-none">·</span>;
}
