import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecoilRoot } from 'recoil';
import DarkModeToggle from './DarkModeToggle';

describe('DarkModeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('hydrates from localStorage and applies dark mode to the document', async () => {
    localStorage.setItem('darkMode', 'true');

    render(
      <RecoilRoot>
        <DarkModeToggle />
      </RecoilRoot>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Light Mode' })).toBeInTheDocument();
    });

    expect(document.documentElement).toHaveClass('dark');
  });

  it('toggles the theme and persists the new value', async () => {
    const user = userEvent.setup();

    render(
      <RecoilRoot>
        <DarkModeToggle />
      </RecoilRoot>
    );

    const button = await screen.findByRole('button', { name: 'Dark Mode' });
    await user.click(button);

    expect(screen.getByRole('button', { name: 'Light Mode' })).toBeInTheDocument();
    expect(localStorage.getItem('darkMode')).toBe('true');
    expect(document.documentElement).toHaveClass('dark');
  });
});
