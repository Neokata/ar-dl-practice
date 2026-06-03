'use client';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center p-4 text-center">
      <div className="text-6xl mb-6">😵</div>
      <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--accent-pink)' }}>Something went wrong</h1>
      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
        Don&apos;t worry — your progress is saved. Try again or go back to the home page.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary">
          Try Again
        </button>
        <a href="/" className="btn-secondary">
          🏠 Go Home
        </a>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 rounded-lg text-left text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-pink)' }}>
          <div className="font-bold mb-1" style={{ color: 'var(--accent-pink)' }}>Error details:</div>
          <div style={{ color: 'var(--text-muted)' }}>{error.message}</div>
        </div>
      )}
    </div>
  );
}