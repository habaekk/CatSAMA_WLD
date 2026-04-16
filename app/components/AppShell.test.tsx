import { render, screen } from '@testing-library/react';
import AppShell from './AppShell';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/settings'),
}));

jest.mock('next/link', () => {
  return function MockLink({
    href,
    className,
    children,
    ...rest
  }: {
    href: string;
    className?: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  };
});

jest.mock('next/image', () => {
  return function MockImage({
    priority: _priority,
    ...props
  }: Record<string, unknown> & { priority?: boolean }) {
    return <img {...props} alt={String(props.alt ?? '')} />;
  };
});

describe('AppShell', () => {
  it('marks the current route as active and renders the main shell links', () => {
    render(
      <AppShell>
        <div>Page body</div>
      </AppShell>
    );

    const settingsLinks = screen.getAllByRole('link', { name: 'Settings' });
    const topSettingsLink = settingsLinks.find((link) =>
      link.className.includes('px-4 py-2 text-sm transition')
    );

    expect(screen.getByText('Page body')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CatSAMA smarthome AI CatSAMA' })).toHaveAttribute(
      'href',
      '/'
    );
    expect(topSettingsLink).toHaveClass('bg-[var(--brand)]');
  });
});
