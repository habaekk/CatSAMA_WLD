import { render, screen } from '@testing-library/react';
import HomePage from './page';
import DashboardPage from './dashboard/page';
import SettingsPage from './settings/page';
import LlmPage from './LLM/page';

jest.mock('./components/Chat/ChatWindow', () => {
  return function MockChatWindow() {
    return <div>Mock ChatWindow</div>;
  };
});

jest.mock('./components/HA_Dashboard/HomeAssistantOverlayCards', () => {
  return function MockOverlayCards() {
    return <div>Mock Overlay Cards</div>;
  };
});

jest.mock('./components/HA_Dashboard/HomeAssistantDashboard', () => {
  return function MockDashboard() {
    return <div>Mock Home Assistant Dashboard</div>;
  };
});

jest.mock('./components/DarkMode/DarkModeToggle', () => {
  return function MockDarkModeToggle() {
    return <button type="button">Mock Dark Mode Toggle</button>;
  };
});

describe('page smoke tests', () => {
  it('renders the home page shell', () => {
    render(<HomePage />);

    expect(screen.getByTitle('Open LLM VTuber')).toBeInTheDocument();
    expect(screen.getByText('Mock Overlay Cards')).toBeInTheDocument();
    expect(screen.getByText('Mock ChatWindow')).toBeInTheDocument();
  });

  it('renders the dashboard page shell', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Mock Home Assistant Dashboard')).toBeInTheDocument();
  });

  it('renders the settings page shell', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText('Mock Dark Mode Toggle')).toBeInTheDocument();
  });

  it('renders the llm page shell', () => {
    render(<LlmPage />);

    expect(screen.getByText('Mock ChatWindow')).toBeInTheDocument();
  });
});
