import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../src/theme/ThemeProvider';
import NavigationPanelControls from '../../src/core/components/NavigationPanel/NavigationPanelControls';

const breadcrumbs = [
  { id: 'root', title: 'Root' },
  { id: 'child', title: 'Child' },
];

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

describe('NavigationPanelControls', () => {
  it('invokes callbacks for navigation and search actions', () => {
    const onToggle = vi.fn();
    const onBack = vi.fn();
    const onForward = vi.fn();
    const onSearch = vi.fn();
    render(
      <ThemeProvider>
        <NavigationPanelControls
          breadcrumbs={breadcrumbs}
          viewTitle="View"
          activeId="child"
          onToggle={onToggle}
          onBack={onBack}
          onForward={onForward}
          canBack
          canForward
          onOpenSearch={onSearch}
        />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByLabelText('Back'));
    fireEvent.click(screen.getByLabelText('Forward'));
    fireEvent.click(screen.getByLabelText('Search views'));
    expect(onBack).toHaveBeenCalled();
    expect(onForward).toHaveBeenCalled();
    expect(onSearch).toHaveBeenCalled();
  });
});
