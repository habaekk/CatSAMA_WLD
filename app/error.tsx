// app/error.js
'use client';

import Link from 'next/link';

export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <h1 className="text-6xl font-extrabold mb-8">Error</h1>
      <p className="text-2xl mb-4">예기치 않은 오류가 발생했습니다</p>
      <Link href="/">
        <span className="text-blue-500 hover:underline">홈으로 돌아가기</span>
      </Link>
    </div>
  );
}
