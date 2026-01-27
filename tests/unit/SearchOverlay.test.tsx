import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../src/theme/ThemeProvider';
import { NavigationItem } from '../../src/web/components/NavigationPanel';
import SearchOverlay from '../../src/web/components/NavigationPanel/SearchOverlay';

const items: NavigationItem[] = [
  {
    id: 'root',
    title: 'Root',
    description: 'root node',
    badge: 'root',
    type: 'container',
    children: [
      {
        id: 'child',
        title: 'Child',
        description: 'child node',
        badge: 'child',
        type: 'element',
        parentId: 'root',
        children: [],
      },
    ],
  },
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

describe('SearchOverlay', () => {
  it('filters and selects an item', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <ThemeProvider>
        <SearchOverlay
          opened
          onClose={onClose}
          items={items}
          tree={items}
          onSelect={onSelect}
        />
      </ThemeProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('Search by title, id, description...'), {
      target: { value: 'child' },
    });
    fireEvent.click(screen.getByText('Child'));
    expect(onSelect).toHaveBeenCalledWith('child');
  });
});
