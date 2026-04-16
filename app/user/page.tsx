'use client';

import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';
import Image from 'next/image';
import { useState, type KeyboardEvent } from 'react';

function onSuccess(result: { nullifier_hash?: string }) {
  console.log('Verification successful:', result);
  window.alert(
    `Successfully verified with World ID! Your nullifier hash is: ${result.nullifier_hash ?? ''}`
  );
}

function handleVerify(result: unknown) {
  console.log('Proof received:', result);
}

export default function UserPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const appId = process.env.NEXT_PUBLIC_APP_ID as `app_${string}` | undefined;
  const actionId = process.env.NEXT_PUBLIC_ACTION_ID;

  function handleLogin() {
    console.log('Login attempt:', { email, password });

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setEmailError(true);
      return;
    }

    setEmailError(false);

    if (email === 'test@example.com' && password === 'password') {
      window.alert('Login successful.');
      return;
    }

    window.alert('Login failed: check your email and password.');
  }

  function handleKeyPress(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  }

  return (
    <div className="main-content relative flex min-h-screen flex-col items-center justify-center p-6 dark:text-white">
      <div className="flex h-[80vh] w-full flex-col items-center justify-center rounded-lg bg-gray-100 p-6 dark:bg-gray-900">
        <h1 className="mb-8 text-5xl font-extrabold">CatSAMA</h1>

        <div className="mb-4 flex w-full max-w-md flex-col items-center">
          {appId && actionId ? (
            <IDKitWidget
              app_id={appId}
              action={actionId}
              onSuccess={onSuccess}
              handleVerify={handleVerify}
              verification_level={VerificationLevel.Device}
            >
              {({ open }) => (
                <button
                  onClick={open}
                  className="w-full rounded-lg bg-blue-500 px-4 py-3 text-white transition-colors duration-300 hover:bg-blue-600"
                >
                  <div className="flex items-center justify-center">
                    <Image src="/WLD.svg" alt="WLD Logo" width={30} height={30} className="mb-1 mr-2" />
                    <p className="text-lg font-bold">Login with World ID</p>
                  </div>
                </button>
              )}
            </IDKitWidget>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              World ID configuration is missing.
            </p>
          )}
        </div>

        <div className="my-4 flex w-full max-w-md items-center">
          <hr className="w-full border-gray-300 dark:border-gray-700" />
          <span className="mx-4 whitespace-nowrap text-gray-500 dark:text-gray-400">or</span>
          <hr className="w-full border-gray-300 dark:border-gray-700" />
        </div>

        <div className="mb-2 flex w-full max-w-md items-center">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`flex-grow rounded-md border bg-white p-4 text-black dark:bg-gray-800 dark:text-white ${
              emailError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            }`}
          />
          <button
            onClick={handleLogin}
            className="ml-2 flex items-center justify-center rounded-md bg-blue-500 p-4 text-white hover:bg-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
        {emailError ? (
          <p className="w-full max-w-md text-left text-red-500">Enter a valid email address.</p>
        ) : null}
      </div>
    </div>
  );
}
