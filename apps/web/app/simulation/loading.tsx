export default function SimulationLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 animate-pulse">
      <div className="h-6 w-32 rounded bg-gray-200 mb-8" />
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="h-20 rounded-lg bg-gray-100" />
        <div className="h-20 rounded-lg bg-gray-100" />
        <div className="h-20 rounded-lg bg-gray-100" />
      </div>
      <div className="space-y-3">
        <div className="h-16 rounded-lg bg-gray-100" />
        <div className="h-16 rounded-lg bg-gray-100" />
        <div className="h-16 rounded-lg bg-gray-100" />
      </div>
    </div>
  );
}
