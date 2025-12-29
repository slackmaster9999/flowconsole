import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../src/theme/ThemeProvider';

function ThemeConsumer() {
  const { resolvedScheme, toggleScheme, scheme } = useTheme();
  return (
    <div>
      <span data-testid="scheme">{scheme}</span>
      <span data-testid="resolved">{resolvedScheme}</span>
      <button onClick={() => toggleScheme()}>toggle</button>
    </div>
  );
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('ThemeProvider', () => {
  it('cycles schemes when toggled', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await waitFor(() => expect(screen.getByTestId('scheme')).toHaveTextContent('auto'));
    await act(async () => {
      fireEvent.click(screen.getByText('toggle'));
    });
    expect(screen.getByTestId('scheme')).toHaveTextContent('dark');
    await act(async () => {
      fireEvent.click(screen.getByText('toggle'));
    });
    expect(screen.getByTestId('scheme')).toHaveTextContent('light');
  });
});
