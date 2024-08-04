'use client';

import { useState } from 'react';

export default function code() {
  const [verificationCode, setVerificationCode] = useState('');
  const [codeError, setCodeError] = useState(false);

  function handleCodeSubmit() {
    // 인증 코드 제출 버튼 클릭 시 실행되는 코드
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
        <h1 className="text-5xl font-extrabold mb-8">CatSAMA</h1>

        {/* 인증 코드 입력 필드 및 제출 버튼 */}
        <div className="w-full max-w-md flex items-center mb-2">
          <input
            type="text"
            placeholder="인증 코드*"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`flex-grow p-4 text-black dark:text-white bg-white dark:bg-gray-800 border ${codeError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md`}
          />
          <button 
            onClick={handleCodeSubmit} 
            className="bg-blue-500 text-white p-4 rounded-md hover:bg-blue-600 flex items-center justify-center ml-2"
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
