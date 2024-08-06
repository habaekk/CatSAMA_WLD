'use client';

import { useState, useEffect } from 'react';

export default function Code() {
  const [verificationCode, setVerificationCode] = useState('');
  const [codeError, setCodeError] = useState(false);

  useEffect(() => {
    // 인증 코드 길이가 6자리인 경우 자동으로 제출 시도
    if (verificationCode.length === 6) {
      handleCodeSubmit();
    }
  }, [verificationCode]);

  function handleCodeSubmit() {
    console.log('코드 제출 시도:', { verificationCode });

    // 인증 코드 유효성 검사 (여기서는 간단한 예로 6자리 숫자인지 확인)
    const codePattern = /^\d{6}$/;
    if (!codePattern.test(verificationCode)) {
      setCodeError(true);
    } else {
      setCodeError(false);
      // 여기에 실제 인증 로직을 구현하거나 서버에 요청을 보낼 수 있습니다.
      console.log('Code verified successfully.');
      window.alert('인증 코드가 확인되었습니다.');
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleCodeSubmit();
    }
  }

  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-center p-6 relative dark:text-white">
      <div className="w-full h-[80vh] rounded-lg bg-white dark:bg-gray-800 p-6 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        {/* 큰 글씨로 CatSAMA */}
        <h1 className="text-4xl font-extrabold mb-8">코드를 입력하여 로그인</h1>

        <p className="mb-4 text-m">이메일로 보내진 6자리 코드를 입력해주세요.</p>

        {/* 인증 코드 입력 필드 및 제출 버튼 */}
        <div className="w-full max-w-md flex items-center mb-4">
          <input
            type="text"
            placeholder="인증 코드*"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`flex-grow p-4 text-black dark:text-white bg-white dark:bg-gray-800 border ${codeError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md focus:outline-none focus:ring-2 ${codeError ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
          />
          <button 
            onClick={handleCodeSubmit} 
            className="bg-blue-500 text-white p-4 rounded-md hover:bg-blue-600 flex items-center justify-center ml-2 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
        {codeError && <p className="text-red-500 w-full max-w-md text-left">❗유효하지 않은 인증 코드.</p>}
      </div>
    </div>
  );
}
