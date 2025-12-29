import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CodeDiagramWorkbench } from '../../src/core/components/Workbench/CodeDiagramWorkbench';
import React from 'react';
import { ThemeProvider } from '../../src/theme/ThemeProvider';

vi.mock('@monaco-editor/react', () => ({
  Editor: ({
    value,
    onChange,
    beforeMount,
  }: {
    value: string;
    onChange?: (val: string) => void;
    beforeMount?: (monaco: unknown) => void; 



  }) => {
    beforeMount?.({ languages: { typescript: { typescriptDefaults: { addExtraLib: vi.fn() }, javascriptDefaults: { addExtraLib: vi.fn() } } } });
    return (
      <textarea
        data-testid="code-editor"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
    );
  },
}));

const mockEvaluate = vi.fn();
vi.mock('../../src/core/languages/typescript/evaluateDiagramCode', () => ({
  evaluateDiagramCode: (...args: unknown[]) => mockEvaluate(...args),
}));

vi.mock('../../src/core/components/ArchitectureDiagram', () => ({
  ArchitectureDiagram: ({ model }: { model: { nodes: unknown[] } }) => (
    <div data-testid="diagram">nodes:{model.nodes.length}</div>
  ),
})); 

vi.mock('../../src/core/components/VerticalSplit', () => {
  const Pane = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const Split = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  Split.Pane = Pane;
  return { VerticalSplit: Split };
});

vi.mock('../../src/theme/ThemeProvider', () => ({
  useTheme: () => ({ resolvedScheme: 'dark' })
}));

describe('CodeDiagramWorkbench', () => {
  beforeEach(() => {
    mockEvaluate.mockResolvedValue({ ok: true, model: { nodes: [], edges: [] } });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    mockEvaluate.mockReset();
  });

  it('triggers evaluation when mounted', async () => {
    render(
        <CodeDiagramWorkbench />
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    expect(mockEvaluate).toHaveBeenCalledTimes(1);
  });

  it('shows error when evaluation fails', async () => {
    mockEvaluate.mockResolvedValueOnce({ ok: false, error: 'Syntax error' });
    render(<CodeDiagramWorkbench />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    expect(mockEvaluate).toHaveBeenCalledTimes(1);
    const evaluationPromise = mockEvaluate.mock.results.at(-1)?.value as Promise<unknown>;
    await act(async () => {
      await evaluationPromise;
    });
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText('Ошибка генерации')).toBeInTheDocument();
    expect(screen.getByText('Syntax error')).toBeInTheDocument();
  });

  it('switches samples via dropdown', () => {
    render(<CodeDiagramWorkbench />);
    const select = screen.getByTestId('sample-select') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'oss-collab' } });
    expect(select.value).toBe('oss-collab');
    expect(screen.getByTestId('sample-description')).toHaveTextContent('open-source dev platform');
  });

  it('debounces rapid code edits into a single evaluation', async () => {
    render(<CodeDiagramWorkbench />);

    // initial evaluation
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    expect(mockEvaluate).toHaveBeenCalledTimes(1);
    mockEvaluate.mockClear();

    const editor = screen.getByTestId('code-editor');
    fireEvent.change(editor, { target: { value: 'first edit' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    fireEvent.change(editor, { target: { value: 'second edit' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });

    expect(mockEvaluate).toHaveBeenCalledTimes(1);
  });

  it('hides overlay after successful evaluation', async () => {
    render(<CodeDiagramWorkbench />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    const evaluationPromise = mockEvaluate.mock.results.at(-1)?.value as Promise<unknown>;
    await act(async () => {
      await evaluationPromise;
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(screen.queryByTestId('progress-overlay')).not.toBeInTheDocument();
  });
});
