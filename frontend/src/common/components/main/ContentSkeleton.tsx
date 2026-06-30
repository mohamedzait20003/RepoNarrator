export function ContentSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6 animate-pulse">
      <div className="h-8 w-1/3 rounded-md bg-muted" />
      <div className="h-4 w-2/3 rounded-md bg-muted" />
      <div className="h-4 w-1/2 rounded-md bg-muted" />
      <div className="mt-4 h-48 rounded-xl bg-muted" />
    </div>
  );
}
