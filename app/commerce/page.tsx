'use client';

import React from 'react';
import CategoryCard from '../component/CategoryCard';

const categories = [
  { title: 'Smart Home', link: '/smart_home' },
  { title: 'Pets', link: '/pets' },
  { title: 'Grocery', link: '/grocery' },
  { title: 'Household', link: '/household' },
  { title: 'Beauty', link: '/beauty' },
  { title: 'Health', link: '/health' },
];

export default function Commerce() {
  return (
    <div className="main-content flex min-h-screen flex-col items-center justify-center p-24 relative dark:text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-4">
        {categories.map((category, index) => (
          <CategoryCard key={index} title={category.title} link={category.link} />
        ))}
      </div>
    </div>
  );
}
