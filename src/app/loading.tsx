export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900 transition-colors">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-neutral-200 dark:border-neutral-700" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-400 animate-spin" />
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Chargement…</p>
      </div>
    </div>
  );
}
