import { useEffect, useMemo, useRef, useState } from 'react';

type HoverState = {
  opened: boolean;
  activatedBy: 'hover' | 'click';
};

type HoverOptions = {
  openDelay?: number;
  closeDelay?: number;
};

export function useHoverPopover({ openDelay = 150, closeDelay = 200 }: HoverOptions = {}) {
  const openTimer = useRef<number>(100);
  const closeTimer = useRef<number>(100);
  const [state, setState] = useState<HoverState>({ opened: false, activatedBy: 'hover' });

  const clearTimers = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  };

  const openByHover = () => {
    clearTimers();
    openTimer.current = window.setTimeout(() => {
      setState({ opened: true, activatedBy: 'hover' });
    }, openDelay);
  };

  const closeByHover = () => {
    if (state.activatedBy === 'click') return;
    clearTimers();
    closeTimer.current = window.setTimeout(() => {
      setState((prev) => ({ ...prev, opened: false }));
    }, closeDelay);
  };

  const toggleByClick = () => {
    clearTimers();
    setState((prev) => ({
      opened: !prev.opened,
      activatedBy: 'click',
    }));
  };

  const close = () => {
    clearTimers();
    setState((prev) => ({ ...prev, opened: false }));
  };

  useEffect(() => clearTimers, []);

  return {
    opened: state.opened,
    activatedBy: state.activatedBy,
    openByHover,
    closeByHover,
    toggleByClick,
    close,
    setOpened: (opened: boolean) => setState((prev) => ({ ...prev, opened })),
  };
}

export function useNavigationHistory(initialId?: string) {
  const [history, setHistory] = useState<string[]>(initialId ? [initialId] : []);
  const [index, setIndex] = useState(initialId ? 0 : -1);

  useEffect(() => {
    if (!initialId) return;
    setHistory([initialId]);
    setIndex(0);
  }, [initialId]);

  const visit = (id: string) => {
    if (!id) return;
    setHistory((prev) => {
      const next = prev.slice(0, index + 1);
      if (next[next.length - 1] === id) return prev;
      next.push(id);
      return next;
    });
    setIndex((prev) => prev + 1);
  };

  const goBack = () => {
    setIndex((prev) => Math.max(0, prev - 1));
  };
  const goForward = () => {
    setIndex((prev) => Math.min(history.length - 1, prev + 1));
  };

  return useMemo(
    () => ({
      current: index >= 0 ? history[index] : undefined,
      canBack: index > 0,
      canForward: index >= 0 && index < history.length - 1,
      goBack,
      goForward,
      visit,
      history,
      index,
    }),
    [history, index]
  );
}
