export default function ResultsLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 animate-pulse">
      <div className="text-center mb-12">
        <div className="mx-auto h-4 w-32 rounded bg-gray-200" />
        <div className="mx-auto mt-4 h-16 w-20 rounded bg-gray-100" />
      </div>
      <div className="space-y-4">
        <div className="h-6 w-full rounded bg-gray-100" />
        <div className="h-6 w-full rounded bg-gray-100" />
        <div className="h-6 w-full rounded bg-gray-100" />
        <div className="h-6 w-3/4 rounded bg-gray-100" />
      </div>
    </div>
  );
}
