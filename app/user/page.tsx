'use client';

import Image from 'next/image';
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';
import { useState } from 'react';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-center p-6 relative dark:text-white bg-gray-100 dark:bg-gray-900">
      {/* 큰 글씨로 CatSAMA */}
      <h1 className="text-5xl font-extrabold mb-8">CatSAMA</h1>

      {/* 이메일 입력 필드 */}
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full max-w-md p-4 mb-4 text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded"
      />

      {/* 비밀번호 입력 필드 */}
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full max-w-md p-4 mb-4 text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded"
      />

      {/* 로그인 버튼 */}
      <button className="w-full max-w-md bg-blue-500 text-white p-4 rounded hover:bg-blue-600 mb-4">
        로그인
      </button>

      {/* 아이디가 없으세요? 가입하기 */}
      <div className="text-white mb-6">
        아이디가 없으세요? <a href="#" className="text-blue-500 hover:underline mb-6">가입하기</a>
      </div>

      {/* 디바이드 줄 */}
      <div className="flex items-center w-full max-w-md my-4">
        <hr className="w-full border-gray-300 dark:border-gray-700" />
        <span className="mx-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">또는</span>
        <hr className="w-full border-gray-300 dark:border-gray-700" />
      </div>

      {/* 월드코인으로 로그인 섹션 */}
      <div className="flex flex-col items-center">

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
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
            <div className="flex items-center">
              <Image
                src="/WLD.svg" // 이미지 파일 경로
                alt="WLD Logo"
                width={40}
                height={40}
                className="mr-1"
              />
              <p className="text-lg font-bold mr-4">월드코인 앱을 이용하여 로그인</p>
            </div>
            </button>
          
          
          )}
        </IDKitWidget>
      </div>
    </div>
  );
}
