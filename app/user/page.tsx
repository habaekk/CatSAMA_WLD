'use client';

import Image from 'next/image';
import Header from "../component/Header";
import Footer from "../component/Footer";
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';

function onSuccess(result) {
  // 인증 성공 시 실행되는 코드
  console.log('Verification successful:', result);
  window.alert(`Successfully verified with World ID! Your nullifier hash is: ` + result.nullifier_hash);
}

function handleVerify(result) {
  // 증명이 수신될 때 실행되는 선택적 콜백
  console.log('Proof received:', result);
}

export default function UserPage() {
  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-center p-24 relative">
      <Header />

      {/* 이미지와 텍스트 섹션 */}
      <div className="flex items-center mb-8">
        <Image
          src="/WLD.png" // 이미지 파일 경로
          alt="WLD Logo"
          width={50}
          height={50}
          className="mr-2"
        />
        <p className="text-2xl font-bold">월드코인 앱을 이용하여 로그인하세요</p>
      </div>

      <IDKitWidget
        app_id={process.env.NEXT_PUBLIC_APP_ID} // 환경 변수에서 가져온 app_id
        action={process.env.NEXT_PUBLIC_ACTION_ID} // 환경 변수에서 가져온 action id
        onSuccess={onSuccess} // 인증 성공 시 실행되는 콜백 함수
        handleVerify={handleVerify} // 증명 수신 시 실행되는 선택적 콜백 함수
        verification_level={VerificationLevel.Device}
      >
        {({ open }) => (
          <button 
            onClick={open} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            World ID 로 로그인 
          </button>
        )}
      </IDKitWidget>


      <Footer />
    </div>
  );
}
