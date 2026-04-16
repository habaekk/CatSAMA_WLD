import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from './page';

jest.mock('../components/DarkMode/DarkModeToggle', () => {
  return function MockDarkModeToggle() {
    return <button type="button">Mock Dark Mode Toggle</button>;
  };
});

describe('Settings page', () => {
  it('toggles the advanced settings section', async () => {
    const user = userEvent.setup();

    render(<SettingsPage />);

    expect(screen.queryByPlaceholderText('Enter Home Assistant URL')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Advanced Settings ▼' }));

    expect(screen.getByPlaceholderText('Enter Home Assistant URL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Ollama API URL')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Advanced Settings ▲' }));

    expect(screen.queryByPlaceholderText('Enter Home Assistant URL')).not.toBeInTheDocument();
  });
});
