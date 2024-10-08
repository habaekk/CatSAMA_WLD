'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { getState, setState, getService, callService } from "./components/HA_API/api"; // Import the API functions

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

  const entity = process.env.NEXT_PUBLIC_ENTITY;

  // Handler functions for API calls
  const handleGetState = async () => {
    try {
      const stateData = await getState(entity);
      console.log("Fetched State:", stateData.state); // state 값만 출력
    } catch (error) {
      console.error("Error fetching state:", error);
    }
  };
  
  const handleSetState = () => setState("example.entity_id", "new_state");
  const handleGetService = async () => {
    try {
      const serviceData = await getService();
      console.log("Fetched Service Data:", serviceData); // 콘솔에 결과값 출력
    } catch (error) {
      console.error("Error getting service:", error);
    }
  };
  const handleCallService = async () => {
    try {
      const result = await callService("fan", "toggle", entity);
      console.log("Service Call Result:", result); // 결과값 출력
    } catch (error) {
      console.error("Error calling service:", error);
    }
  };

  return (
    <main className="main-content flex min-h-screen flex-col items-center justify-center p-24 relative dark:text-white">
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
      <div className="mt-8 flex flex-col items-center">
        <button onClick={handleGetState} className="bg-blue-500 text-white p-2 rounded m-2">Get State</button>
        <button onClick={handleSetState} className="bg-green-500 text-white p-2 rounded m-2">Set State</button>
        <button onClick={handleGetService} className="bg-purple-500 text-white p-2 rounded m-2">Get Service</button>
        <button onClick={handleCallService} className="bg-red-500 text-white p-2 rounded m-2">Call Service</button>
      </div>
    </main>
  );
}