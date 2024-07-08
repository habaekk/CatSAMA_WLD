// components/Header.tsx

import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full flex justify-between items-center p-4 absolute top-0 left-0">
      <Link href="/" className="top-4 left-4 cursor-pointer">
        <Image
          src="/logo.webp" // 로고 이미지 파일 경로
          alt="Logo"
          width={40}
          height={40}
        />
      </Link>
      <Link href="/user" className="top-4 right-4 cursor-pointer">
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
