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

  function handleLogin() {
    // 로그인 버튼 클릭 시 실행되는 코드
    console.log('로그인 시도:', { email });
    // 여기서 실제 로그인 로직을 구현하거나 서버에 요청을 보낼 수 있습니다.
    if (email === 'test@example.com') {
      window.alert('로그인 성공!');
    } else {
      window.alert('로그인 실패: 이메일이나 비밀번호를 확인하세요.');
    }
  }

  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-center p-6 relative dark:text-white">
      <div className="w-full h-[80vh] rounded-lg bg-white dark:bg-gray-800 p-6 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        {/* 큰 글씨로 CatSAMA */}
        <h1 className="text-5xl font-extrabold mb-8">CatSAMA</h1>

        {/* 월드코인으로 로그인 섹션 */}
        <div className="w-full max-w-md flex flex-col items-center mb-4">
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
                className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300"
              >
                <div className="flex items-center justify-center">
                  <Image
                    src="/WLD.svg" // 이미지 파일 경로
                    alt="WLD Logo"
                    width={30}
                    height={30}
                    className="mr-2 mb-1"
                  />
                  <p className="text-lg font-bold">월드코인 앱을 이용하여 로그인</p>
                </div>
              </button>
            )}
          </IDKitWidget>
        </div>

        {/* 디바이드 줄 */}
        <div className="flex items-center w-full max-w-md my-4">
          <hr className="w-full border-gray-300 dark:border-gray-700" />
          <span className="mx-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">또는</span>
          <hr className="w-full border-gray-300 dark:border-gray-700" />
        </div>

        {/* 이메일 입력 필드 */}
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full max-w-md p-4 mb-4 text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded"
        />

        {/* 로그인 버튼 */}
        <button onClick={handleLogin} className="w-full max-w-md bg-blue-500 text-white p-4 rounded hover:bg-blue-600 mb-4">
          로그인
        </button>
      </div>
    </div>
  );
}
