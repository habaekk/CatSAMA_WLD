'use client';

import Image from 'next/image';
import Link from 'next/link';
import Header from "../component/Header"

export default function UserPage() {
  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-center p-24 relative">
      <Header />

      {/* 상단 로고 */}
      <div className="mb-8 mt-16">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/logo.png" // 로고 이미지 파일 경로
            alt="Logo"
            width={100}
            height={50}
          />
        </Link>
      </div>

      {/* 이미지와 텍스트 섹션 */}
      <div className="flex items-center mb-8">
        <Image
          src="/profile.png" // 이미지 파일 경로
          alt="Profile Image"
          width={50}
          height={50}
          className="mr-4"
        />
        <p className="text-lg">텍스트 내용</p>
      </div>

      {/* 중앙 QR 코드 영역 */}
      <div className="border-2 border-gray-400 p-8 mb-8">
        <p className="text-4xl">QR</p>
      </div>

      {/* QR 코드 아래의 텍스트 */}
      <div className="mb-8">
        <p className="text-lg">QR 코드 아래의 텍스트</p>
      </div>

      {/* 하단 숫자 코드를 입력할 네모 박스 */}
      <div className="text-center">
        <input 
          type="text"
          className="border-2 border-gray-400 px-4 py-2 rounded mb-4"
          placeholder="코드 텍스트"
        />
        <p className="text-sm">Additional text or instructions here</p>
      </div>
    </div>
  );
}