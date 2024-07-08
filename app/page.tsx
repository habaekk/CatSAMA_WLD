'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Header from './component/Header'; // Header 컴포넌트 임포트
import Footer from './component/Footer'; // Footer 컴포넌트 임포트

export default function Home() {
  const images = [
    "/cat/cat_sit.webp",
    "/cat/cat_sleep.webp",
    "/cat/cat_lie.webp",
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
      <Header /> {/* Header 컴포넌트 사용 */}
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
      <Footer /> {/* Footer 컴포넌트 사용 */}
    </main>
  );
}
