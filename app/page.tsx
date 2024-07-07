'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  const images = [
    "/cat/cat_sit.webp",
    "/cat/cat_sleep.webp",
    "/cat/cat_sit2.webp",
    "/cat/cat_walk.webp",
    "/cat/cat_eat.webp"
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="main-content flex min-h-screen flex-col items-center justify-center p-24 relative">
      <Link href="/user" className="absolute top-4 right-4 cursor-pointer">
        <Image
          src="/user.png" // 사용자 아이콘 이미지 파일 경로
          alt="User Icon"
          width={40}
          height={40}
          className="rounded-full"
        />
      </Link>
      <div className="absolute top-4 left-4">
        <Image
          src="/logo.webp" // 로고 이미지 파일 경로
          alt="Logo"
          width={40}
          height={40}
        />
      </div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">캣사마</h1>
        <p className="text-lg text-gray-500">우리 집의 귀여운 고양이</p>
      </div>
      <div className="relative z-10">
        <Image
          src={images[currentImage]}
          alt="Cat Image"
          width={200}
          height={200}
          priority
        />
      </div>
      <div className="text-center mt-8">
        <p className="text-lg text-gray-500">CaaS - Cat as a Service</p>
      </div>
    </main>
  );
}
