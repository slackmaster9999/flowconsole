import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VerticalSplit } from '../../src/core/components/VerticalSplit';


beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    value() {
      return { left: 0, width: 1000, height: 600, top: 0, bottom: 600, right: 1000 };
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
    value: () => {},
    writable: true,
  });
  Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
    value: () => {},
    writable: true,
  });
});

describe('VerticalSplit', () => {
  it('allows dragging to resize panes', () => {
    render(
      <VerticalSplit initialPercent={40}>
        <VerticalSplit.Pane>
          <div data-testid="left">Left</div>
        </VerticalSplit.Pane>
        <VerticalSplit.Pane>
          <div data-testid="right">Right</div>
        </VerticalSplit.Pane>
      </VerticalSplit>
    );

    const separator = screen.getByRole('separator');
    fireEvent.pointerDown(separator, { clientX: 400 });
    fireEvent.pointerMove(separator, { clientX: 700 });
    fireEvent.pointerUp(separator);

    const leftPane = screen.getByTestId('left').parentElement;
    expect(leftPane?.style.width).toMatch(/70/);
  });
});
