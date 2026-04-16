import { render, screen } from '@testing-library/react';
import CategoryCard from './CategoryCard';

jest.mock('next/link', () => {
  return function MockLink({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) {
    return <a href={href}>{children}</a>;
  };
});

describe('CategoryCard', () => {
  it('renders the title and destination link', () => {
    render(<CategoryCard title="Dashboard" link="/dashboard" />);

    const link = screen.getByRole('link', { name: 'Dashboard' });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/dashboard');
  });
});
