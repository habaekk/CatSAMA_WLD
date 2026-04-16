'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';

type UserProfile = {
  image: string;
  name: string;
  email: string;
  address: string;
  worldcoin: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>({
    image: 'https://via.placeholder.com/150',
    name: 'Hong Gildong',
    email: 'hong@example.com',
    address: 'Gangnam-gu, Seoul',
    worldcoin: 'worldcoin_account_example',
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = () => {
    setIsEditing((prev) => !prev);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEditing(false);
    console.log('Updated user:', user);
  };

  return (
    <div className="main-content relative flex min-h-screen flex-col items-center justify-center p-6 dark:text-white">
      <div className="flex h-[80vh] w-full flex-col items-center justify-center rounded-lg bg-gray-100 p-6 dark:bg-gray-900">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-gray-700 dark:text-gray-300">Profile Image</label>
            <img src={user.image} alt="Profile" className="mb-4 h-32 w-32 rounded-full" />
            {isEditing ? (
              <input
                type="text"
                name="image"
                value={user.image}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
              />
            ) : null}
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-gray-700 dark:text-gray-300">Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
              />
            ) : (
              <p className="text-lg text-gray-900 dark:text-gray-100">{user.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-gray-700 dark:text-gray-300">Email</label>
            <p className="text-lg text-gray-900 dark:text-gray-100">{user.email}</p>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-gray-700 dark:text-gray-300">Address</label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={user.address}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100"
              />
            ) : (
              <p className="text-lg text-gray-900 dark:text-gray-100">{user.address}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-gray-700 dark:text-gray-300">Worldcoin Account</label>
            <p className="text-lg text-gray-900 dark:text-gray-100">{user.worldcoin}</p>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleEditClick}
              className="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            {isEditing ? (
              <button
                type="submit"
                className="rounded-md bg-green-500 p-2 text-white hover:bg-green-600"
              >
                Save
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
