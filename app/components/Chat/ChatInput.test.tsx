import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from './ChatInput';

describe('ChatInput', () => {
  it('sends a typed message and clears the input when clicking send', async () => {
    const user = userEvent.setup();
    const onSendMessage = jest.fn();

    render(<ChatInput onSendMessage={onSendMessage} />);

    const input = screen.getByPlaceholderText('Send a message to CatSAMA');
    await user.type(input, 'Turn on the lights');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(onSendMessage).toHaveBeenCalledWith('Turn on the lights');
    expect(input).toHaveValue('');
  });

  it('does not send blank messages when pressing enter', async () => {
    const user = userEvent.setup();
    const onSendMessage = jest.fn();

    render(<ChatInput onSendMessage={onSendMessage} />);

    const input = screen.getByPlaceholderText('Send a message to CatSAMA');
    await user.type(input, '   {enter}');

    expect(onSendMessage).not.toHaveBeenCalled();
  });

  it('focuses the input on mount', () => {
    const onSendMessage = jest.fn();

    render(<ChatInput onSendMessage={onSendMessage} />);

    expect(screen.getByPlaceholderText('Send a message to CatSAMA')).toHaveFocus();
  });
});
