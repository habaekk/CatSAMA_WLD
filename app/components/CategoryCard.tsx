import Link from 'next/link';

interface CategoryCardProps {
  title: string;
  link: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, link }) => {
  return (
    <Link href={link}>
      <div className="w-80 h-40 bg-blue-500 text-white rounded-lg flex items-start justify-start text-3xl font-bold m-2 transition-transform transform hover:scale-105 dark:bg-blue-700 cursor-pointer p-4">
        {title}
      </div>
    </Link>
  );
};

export default CategoryCard;
