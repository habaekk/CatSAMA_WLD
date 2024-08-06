// app/not-found.js
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 dark:text-white">
      <h1 className="text-6xl font-extrabold mb-8">404</h1>
      <p className="text-2xl mb-4">존재하지 않는 페이지 입니다</p>
      <Link href="/">
        <span className="text-blue-500 hover:underline">홈으로 돌아가기</span>
      </Link>
    </div>
  );
}
