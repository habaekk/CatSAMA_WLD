// app/profile/page.js
'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState({
    image: 'https://via.placeholder.com/150',
    name: '홍길동',
    email: 'hong@example.com',
    address: '서울특별시 강남구',
    worldcoin: 'worldcoin_account_example'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    // 여기서 서버에 변경된 데이터를 보낼 수 있습니다.
    console.log('Updated user:', user);
  };

  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-center p-6 relative dark:text-white">
      <div className="w-full h-[80vh] rounded-lg bg-white dark:bg-gray-800 p-6 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">프로필 페이지</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">프로필 이미지</label>
            <img src={user.image} alt="Profile" className="w-32 h-32 rounded-full mb-4" />
            {isEditing && (
              <input
                type="text"
                name="image"
                value={user.image}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">이름</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            ) : (
              <p className="text-lg text-gray-900 dark:text-gray-100">{user.name}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">이메일</label>
            <p className="text-lg text-gray-900 dark:text-gray-100">{user.email}</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">배송지 주소</label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={user.address}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            ) : (
              <p className="text-lg text-gray-900 dark:text-gray-100">{user.address}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">월드코인 계정</label>
            <p className="text-lg text-gray-900 dark:text-gray-100">{user.worldcoin}</p>
          </div>
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleEditClick}
              className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
            >
              {isEditing ? '취소' : '수정'}
            </button>
            {isEditing && (
              <button
                type="submit"
                className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
              >
                저장
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
