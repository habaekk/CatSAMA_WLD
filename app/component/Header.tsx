import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full flex justify-between items-center p-4 absolute top-0 left-0 bg-white dark:bg-gray-800 text-black dark:text-white">
      <div className="flex items-center space-x-4">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/logo.webp" // 로고 이미지 파일 경로
            alt="Logo"
            width={40}
            height={40}
          />
        </Link>
        <Link href="/dashboard" className="text-lg font-medium text-gray-700 hover:text-gray-900 cursor-pointer dark:text-white">
          DashBoard
        </Link>
        <Link href="/LLM" className="text-lg font-medium text-gray-700 hover:text-gray-900 cursor-pointer dark:text-white">
          Cat LLM
        </Link>
        <Link href="/commerce" className="text-lg font-medium text-gray-700 hover:text-gray-900 cursor-pointer dark:text-white">
          Commerce
        </Link>
        <Link href="/settings" className="text-lg font-medium text-gray-700 hover:text-gray-900 cursor-pointer dark:text-white">
          Settings
        </Link>
      </div>
      <Link href="/user" className="cursor-pointer">
        <Image
          src="/user.png" // 사용자 아이콘 이미지 파일 경로
          alt="User Icon"
          width={40}
          height={40}
          className="rounded-full"
        />
      </Link>
    </header>
  );
}
