'use client';

export default function QuizError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" role="alert">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold text-gray-900">Something went wrong</h2>
        <p className="mt-2 text-sm text-gray-600">{error.message || 'Failed to load the quiz.'}</p>
        <button onClick={reset} className="mt-4 rounded-md bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700">
          Try again
        </button>
      </div>
    </div>
  );
}
