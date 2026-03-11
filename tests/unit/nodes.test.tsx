import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContainerNodeType, ElementNodeType } from '../../src/web/diagram/types';
import { ContainerNode } from '../../src/web/reactflow/nodes/ContainerNode';
import { ElementNode } from '../../src/web/reactflow/nodes/ElementNode';

vi.mock('../../src/web/reactflow/nodes/HiddenHandles', () => ({
  HiddenHandles: () => <div data-testid="handles" />,
}));

describe('Diagram nodes', () => {
  describe('ContainerNode', () => {
    const renderContainer = (data: Partial<ContainerNodeType['data']> = {}, selected = false) =>
      render(<ContainerNode id="container-1" data={{ title: 'Module', ...data }} selected={selected} type={'container'} dragging={false} zIndex={0} selectable={false} deletable={false} draggable={false} isConnectable={false} positionAbsoluteX={0} positionAbsoluteY={0} />);

    it('dispatches container:open when clicking the container open button (expanded layout)', () => {
      const listener = vi.fn();
      window.addEventListener('container:open', listener as EventListener);
      renderContainer({ description: 'desc', childCount: 2, expanded: false });
      fireEvent.click(screen.getByRole('button', { name: /zoom/i }));
      expect(listener).toHaveBeenCalled();
      expect(screen.getByTestId('handles')).toBeInTheDocument();
      window.removeEventListener('container:open', listener as EventListener);
    });

    it('renders collapsed layout with open button and centered content', () => {
      renderContainer({ description: 'Short desc', expanded: false });
      expect(screen.getByText('Module')).toBeInTheDocument();
      expect(screen.getByText('Short desc')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /zoom/i })).toBeInTheDocument();
      expect(screen.getByTestId('handles')).toBeInTheDocument();
    });

    it('shows child count footer when collapsed and childCount > 0', () => {
      const { container } = renderContainer({ expanded: false, childCount: 3 });
      const footer = container.querySelector('span[style*="font-size: 10px"]');
      expect(footer).not.toBeNull();
    });

    it('hides open button when showOpenButton is false in expanded layout', () => {
      const listener = vi.fn();
      window.addEventListener('container:open', listener as EventListener);
      renderContainer({ expanded: true, showOpenButton: false });
      expect(screen.queryByRole('button', { name: /zoom/i })).toBeNull();
      expect(listener).not.toHaveBeenCalled();
      window.removeEventListener('container:open', listener as EventListener);
    });

    it('applies muted tone by default and no selection shadow when not selected', () => {
      const { container } = renderContainer();
      const card = container.querySelector('.diagram-container') as HTMLElement;
      expect(card.style.borderColor).toBe('var(--diagram-muted)');
      expect(card.style.boxShadow).toBe('');
    });

    it('applies custom tone and selection box shadow when selected', () => {
      const { container } = renderContainer({ tone: 'warning' }, true);
      const card = container.querySelector('.diagram-container') as HTMLElement;
      expect(card.style.borderColor).toBe('var(--diagram-warning)');
      expect(card.style.boxShadow).toContain('var(--diagram-warning)22');
      expect(card.style.boxShadow).toContain('var(--diagram-card-shadow)');
    });

    it('renders subtitle, description, and badge in expanded layout', () => {
      renderContainer({ subtitle: 'Sub', description: 'desc', badge: 'beta', expanded: true });
      expect(screen.getByText('Sub')).toBeInTheDocument();
      expect(screen.getByText('desc')).toBeInTheDocument();
      expect(screen.getByText('beta')).toBeInTheDocument();
    });

    it('omits subtitle and description when not provided in expanded layout', () => {
      const { container } = renderContainer({ expanded: true });
      expect(container.querySelector('.diagram-card__subtitle')).toBeNull();
      expect(container.querySelector('.diagram-container__body')).toBeNull();
    });
  });

  describe('ElementNode', () => {
    const renderElement = (data: Partial<ElementNodeType['data']> = {}, selected = false) =>
      render(<ElementNode id="element-1" data={{ title: 'Service', ...data }} selected={selected} />);

    it.each<ElementNodeType['data']['status'][]>(['operational', 'degraded', 'down'])(
      'applies status color for %s',
      (status) => {
        const { container } = renderElement({ status });
        const statusDot = container.querySelector('.diagram-status') as HTMLElement;
        const expected =
          status === 'operational'
            ? 'var(--diagram-success)'
            : status === 'degraded'
              ? 'var(--diagram-warning)'
              : 'var(--diagram-danger)';
        expect(statusDot).toHaveStyle({ background: expected });
      }
    );

    it('falls back to muted status color when status is missing', () => {
      const { container } = renderElement();
      const statusDot = container.querySelector('.diagram-status') as HTMLElement;
      expect(statusDot).toHaveStyle({ background: 'var(--diagram-muted)' });
    });

    it('uses default tone without selection highlight when not selected', () => {
      const { container } = renderElement();
      const card = container.querySelector('.diagram-card') as HTMLElement;
      const icon = container.querySelector('.diagram-icon') as HTMLElement;
      expect(card.style.borderColor).toBe('var(--diagram-primary)');
      expect(icon.style.borderColor).toBe('var(--diagram-primary)');
      expect(card.style.boxShadow).toBe('');
    });

    it('applies custom tone and selection box shadow when selected', () => {
      const { container } = renderElement({ tone: 'danger' }, true);
      const card = container.querySelector('.diagram-card') as HTMLElement;
      expect(card.style.borderColor).toBe('var(--diagram-danger)');
      expect(card.style.boxShadow).toContain('var(--diagram-danger)33');
      expect(card.style.boxShadow).toContain('var(--diagram-card-shadow)');
    });

    it('renders service glyph by default', () => {
      const { container } = renderElement();
      expect((container.querySelector('.diagram-icon') as HTMLElement).textContent).toBe('⚙️');
    });

    it('renders glyph for provided shape', () => {
      const { container } = renderElement({ shape: 'database' });
      expect((container.querySelector('.diagram-icon') as HTMLElement).textContent).toBe('🗄️');
    });

    it('falls back to generic glyph when shape is unknown', () => {
      const { container } = renderElement({ shape: 'unknown' as unknown as ElementNodeType['data']['shape'] });
      expect((container.querySelector('.diagram-icon') as HTMLElement).textContent).toBe('⬢');
    });

    it('prefers custom icon over glyph', () => {
      const { container } = renderElement({ shape: 'database', icon: '✨' });
      expect((container.querySelector('.diagram-icon') as HTMLElement).textContent).toBe('✨');
    });

    it('renders badge and description when provided', () => {
      renderElement({ badge: 'beta', description: 'Detailed description' }, true);
      expect(screen.getByText('beta')).toBeInTheDocument();
      expect(screen.getByText('Detailed description')).toBeInTheDocument();
      expect(screen.getByTestId('handles')).toBeInTheDocument();
    });

    it('renders all provided tags', () => {
      renderElement({ tags: ['api', 'core', 'public'] });
      expect(screen.getByText('api')).toBeInTheDocument();
      expect(screen.getByText('core')).toBeInTheDocument();
      expect(screen.getByText('public')).toBeInTheDocument();
    });

    it('omits tag block when tags array is empty', () => {
      const { container } = renderElement({ tags: [] });
      expect(container.querySelector('.diagram-card__tags')).toBeNull();
    });

    it('hides description when not provided', () => {
      const { container } = renderElement({ description: undefined });
      expect(container.querySelector('div[style*="var(--diagram-text-muted)"]')).toBeNull();
    });

    it('does not add interactive handlers even when clickable is set', () => {
      const { container } = renderElement({ clickable: true });
      const card = container.querySelector('.diagram-card') as HTMLElement;
      expect(card.getAttribute('role')).toBeNull();
      expect(card.getAttribute('tabindex')).toBeNull();
      expect(card.getAttribute('onclick')).toBeNull();
    });
  });
});
