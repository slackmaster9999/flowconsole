import { Children, type ReactElement, type ReactNode, useCallback, useRef, useState } from 'react';

type VerticalSplitPaneProps = { children: ReactNode };
type VerticalSplitComponent = ((props: VerticalSplitProps) => ReactElement | null) & {
  Pane: (props: VerticalSplitPaneProps) => ReactElement | null;
};

type VerticalSplitProps = {
  children: ReactNode;
  initialPercent?: number;
  minPercent?: number;
  maxPercent?: number;
};

function VerticalSplitPane({ children }: VerticalSplitPaneProps) {
  return <>{children}</>;
}

export const VerticalSplit: VerticalSplitComponent = ({
  children,
  initialPercent = 50,
  minPercent = 20,
  maxPercent = 80,
}: VerticalSplitProps) => {
  const panes = Children.toArray(children).filter(
    (child): child is ReactElement<VerticalSplitPaneProps> =>
      typeof child === 'object' &&
      child !== null &&
      'type' in child &&
      child.type === VerticalSplitPane
  );

  if (panes.length !== 2) {
    console.error('VerticalSplit expects exactly two VerticalSplit.Pane children.');
  }

  const [percent, setPercent] = useState(initialPercent);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updateWidth = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const { left: containerLeft, width } = containerRef.current.getBoundingClientRect();
      const rawPercent = ((clientX - containerLeft) / width) * 100;
      const clamped = Math.min(maxPercent, Math.max(minPercent, rawPercent));
      setPercent(clamped);
    },
    [maxPercent, minPercent]
  );

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    isDragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      updateWidth(event.clientX);
    },
    [updateWidth]
  );

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          minWidth: `${minPercent}%`,
          maxWidth: `${maxPercent}%`,
          height: '100%',
          display: 'flex',
        }}
      >
        {panes[0].props.children}
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          width: '6px',
          cursor: 'col-resize',
          background: 'var(--diagram-border-strong, #2f2f2f)',
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, minWidth: 0, height: '100%' }}>{panes[1].props.children}</div>
    </div>
  );
};

VerticalSplit.Pane = VerticalSplitPane;
