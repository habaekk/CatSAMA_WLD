'use client';

import Link from 'next/link';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <h1 className="mb-8 text-6xl font-extrabold">Error</h1>
      <p className="mb-4 text-2xl">
        문제가 발생했습니다. 다시 시도하거나 홈으로 이동해 주세요.
      </p>
      {error.message ? (
        <p className="mb-6 max-w-xl px-6 text-center text-sm text-gray-600 dark:text-gray-300">
          {error.message}
        </p>
      ) : null}
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors duration-300 hover:bg-blue-600"
        >
          Try again
        </button>
        <Link href="/" className="rounded-lg border border-blue-500 px-4 py-2 text-blue-500">
          Go home
        </Link>
      </div>
    </div>
  );
}
