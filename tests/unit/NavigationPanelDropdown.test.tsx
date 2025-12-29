import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from '../../src/theme/ThemeProvider';
import { NavigationItem } from '../../src/core/components/NavigationPanel';
import NavigationPanelDropdown from '../../src/core/components/NavigationPanel/NavigationPanelDropdown';

const tree: NavigationItem[] = [
  {
    id: 'root',
    title: 'Root',
    description: 'entry',
    badge: 'root',
    type: 'container',
    children: [
      {
        id: 'child',
        title: 'Child Service',
        description: 'child desc',
        badge: 'service',
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

describe('NavigationPanelDropdown', () => {
  it('filters items via search and allows selection', () => {
    const onSelect = vi.fn();
    const onToggle = vi.fn();
    const Wrapper = () => {
      const [searchValue, setSearchValue] = React.useState('');
      return (
        <ThemeProvider>
          <NavigationPanelDropdown
            tree={tree}
            flat={[tree[0], ...tree[0].children]}
            activeId="root"
            search={searchValue}
            onSearch={setSearchValue}
            expanded={new Set(['root'])}
            onToggleExpand={onToggle}
            onSelect={onSelect}
          />
        </ThemeProvider>
      );
    };

    render(<Wrapper />);

    fireEvent.change(screen.getByPlaceholderText('Search views...'), {
      target: { value: 'child' },
    });
    expect(screen.getByText('Child Service')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Child Service'));
    expect(onSelect).toHaveBeenCalledWith('child');
  });
});
