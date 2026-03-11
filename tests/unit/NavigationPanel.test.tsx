import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';


import { ArchitectureDiagramModel } from '../../src/web/diagram/types';
import NavigationPanel from '../../src/web/components/NavigationPanel';

const fitView = vi.fn();
const getNode = vi.fn().mockReturnValue({ id: 'service-a' });

vi.mock('@xyflow/react', () => ({
  useReactFlow: () => ({
    fitView,
    getNode,
  }),
}));

vi.mock('../../src/web/hooks/hooks', async () => {
  const actual = await vi.importActual<typeof import('../../src/web/components/NavigationPanel')>(
    '../../src/web/hooks/hooks'
  );
  return {
    ...actual,
    useHoverPopover: () => ({
      opened: true,
      activatedBy: 'click' as const,
      openByHover: vi.fn(),
      closeByHover: vi.fn(),
      toggleByClick: vi.fn(),
      close: vi.fn(),
      setOpened: vi.fn(),
    }),
  };
});

vi.mock('../../src/web/components/NavigationPanel/NavigationPanelControls', () => ({
  NavigationPanelControls: () => <div data-testid="controls" />,
  default: () => <div data-testid="controls" />,
}));

vi.mock('../../src/web/components/NavigationPanel/NavigationPanelDropdown', () => ({
  NavigationPanelDropdown: ({ flat, onSelect }: any) => (
    <div>
      {flat.map((item: any) => (
        <button key={item.id} onClick={() => onSelect(item.id)}>
          {item.title}
        </button>
      ))}
    </div>
  ),
  default: ({ flat, onSelect }: any) => (
    <div>
      {flat.map((item: any) => (
        <button key={item.id} onClick={() => onSelect(item.id)}>
          {item.title}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../../src/web/components/NavigationPanel/SearchOverlay', () => ({
  default: () => null,
}));

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

describe('NavigationPanel', () => {
  const model: ArchitectureDiagramModel = {
    nodes: [
      {
        id: 'container-1',
        type: 'container',
        data: { title: 'Module', expanded: true },
        position: { x: 0, y: 0 },
      },
      {
        id: 'service-a',
        type: 'element',
        parentId: 'container-1',
        data: { title: 'Service A' },
        position: { x: 0, y: 0 },
      },
    ],
    edges: [],
  };

  it('selects an item and focuses it inside React Flow', () => {
    render(
        <NavigationPanel model={model} />
    );

    fireEvent.click(screen.getByText('Service A'));
    expect(fitView).toHaveBeenCalled();
  });
});
