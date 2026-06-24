export default function QuizLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="mx-auto h-8 w-48 rounded bg-gray-200" />
        <div className="mx-auto mt-4 h-4 w-64 rounded bg-gray-100" />
      </div>
    </div>
  );
}
