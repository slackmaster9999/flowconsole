import { Editor, type Monaco } from '@monaco-editor/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArchitectureDiagram } from '../ArchitectureDiagram';
import { architectureEdgeTypes, architectureNodeTypes } from '../../diagram/registry';
import type { ArchitectureDiagramModel } from '../../diagram/types';
import { VerticalSplit } from '../VerticalSplit';
import './styles.css';
import { DEFAULT_LANGUAGE, findLanguage, LANGUAGES } from '../../languages';
import type { LanguageDefinition } from '../../languages/types';
import type { ThemeControls } from '../../types/theme';

type Props = {
  resolvedScheme: 'light' | 'dark';
  themeControls?: ThemeControls;
};

export function CodeDiagramWorkbench({ themeControls }: Props) {
  const initialLanguage = DEFAULT_LANGUAGE;
  const initialSample =
    initialLanguage.samples.find((sample) => sample.id === initialLanguage.defaultSampleId) ??
    initialLanguage.samples[0];

  const [languageId, setLanguageId] = useState(initialLanguage.id);
  const [selectedSampleIdByLanguage, setSelectedSampleIdByLanguage] = useState<Record<string, string>>({
    [initialLanguage.id]: initialSample?.id ?? '',
  });
  const [codeByLanguage, setCodeByLanguage] = useState<Record<string, string>>({
    [initialLanguage.id]: initialSample?.code ?? '',
  });
  const [diagramModel, setDiagramModel] = useState<ArchitectureDiagramModel>({ nodes: [], edges: [] });
  const [error, setError] = useState<string | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const evaluationCounter = useRef(0);
  const debounceTimer = useRef<number | null>(null);
  const overlayTimer = useRef<number | null>(null);
  const activeLanguageRef = useRef(initialLanguage.id);
  const effectiveScheme = themeControls?.resolvedScheme;
  const editorTheme = effectiveScheme === 'dark' ? 'vs-dark' : 'vs';
  const activeLanguage = findLanguage(languageId);
  const activeSample = useMemo(() => {
    const targetId = selectedSampleIdByLanguage[activeLanguage.id];
    return activeLanguage.samples.find((sample) => sample.id === targetId) ?? activeLanguage.samples[0];
  }, [activeLanguage, selectedSampleIdByLanguage]);
  const selectedSampleId = selectedSampleIdByLanguage[activeLanguage.id] ?? activeSample?.id ?? '';
  const code = codeByLanguage[activeLanguage.id] ?? activeSample?.code ?? '';

  const handleSampleChange = useCallback(
    (sampleId: string) => {
      setSelectedSampleIdByLanguage((prev) => ({ ...prev, [activeLanguage.id]: sampleId }));
      const sample = activeLanguage.samples.find((item) => item.id === sampleId) ?? activeLanguage.samples[0];
      setCodeByLanguage((prev) => ({ ...prev, [activeLanguage.id]: sample?.code ?? '' }));
    },
    [activeLanguage]
  );

  const handleLanguageChange = useCallback((nextLanguageId: string) => {
    const nextLanguage = findLanguage(nextLanguageId);
    setLanguageId(nextLanguage.id);
    setError(null);
    setOverlayVisible(true);

    setSelectedSampleIdByLanguage((prev) => {
      if (prev[nextLanguage.id]) return prev;
      const fallbackId =
        nextLanguage.defaultSampleId ?? nextLanguage.samples[0]?.id ?? '';
      return { ...prev, [nextLanguage.id]: fallbackId };
    });

    setCodeByLanguage((prev) => {
      if (prev[nextLanguage.id] !== undefined) return prev;
      const fallbackId =
        nextLanguage.defaultSampleId ?? nextLanguage.samples[0]?.id ?? '';
      const sample = nextLanguage.samples.find((item) => item.id === fallbackId) ?? nextLanguage.samples[0];
      return { ...prev, [nextLanguage.id]: sample?.code ?? '' };
    });
  }, []);

  const triggerEvaluation = useCallback(
    (language: LanguageDefinition, source: string) => {
      evaluationCounter.current += 1;
      const currentEval = evaluationCounter.current;
      const targetLanguageId = language.id;
      if (overlayTimer.current !== null) {
        window.clearTimeout(overlayTimer.current);
        overlayTimer.current = null;
      }
      setOverlayVisible(true);
      setError(null);

      void language
        .evaluate(source)
        .then((result) => {
          if (currentEval !== evaluationCounter.current) return;
          if (activeLanguageRef.current !== targetLanguageId) return;
          if (!result.ok) {
            setOverlayVisible(false);
            setError(result.error);
            return;
          }

          overlayTimer.current = window.setTimeout(() => {
            if (currentEval !== evaluationCounter.current) return;
            if (activeLanguageRef.current !== targetLanguageId) return;
            setDiagramModel(result.model);
            setOverlayVisible(false);
            overlayTimer.current = null;
          }, 200);
        })
        .catch((error) => {
          if (currentEval !== evaluationCounter.current) return;
          if (activeLanguageRef.current !== targetLanguageId) return;
          setOverlayVisible(false);
          setError(error instanceof Error ? error.message : String(error));
        });
    },
    []
  );

  useEffect(() => {
    if (debounceTimer.current !== null) {
      window.clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = window.setTimeout(() => {
      triggerEvaluation(activeLanguage, code);
    }, 250);

    return () => {
      if (debounceTimer.current !== null) {
        window.clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, [activeLanguage, code, triggerEvaluation]);

  useEffect(() => {
    activeLanguageRef.current = activeLanguage.id;
    return () => {
      if (overlayTimer.current !== null) {
        window.clearTimeout(overlayTimer.current);
      }
    };
  }, [activeLanguage.id]);

  const handleEditorBeforeMount = useCallback(
    (monaco: Monaco) => {
      activeLanguage.monacoSetup?.(monaco);
    },
    [activeLanguage]
  );

  return (
    <VerticalSplit minPercent={20} initialPercent={25} maxPercent={55}>
      <VerticalSplit.Pane>
        <div className="code-pane">
          <div className="code-pane__header">
            <div>
              <label>Architecture DSL</label>
              <p>Опиши диаграмму на {activeLanguage.label}, используя fluent API.</p>
            </div>
            <div className="code-pane__sample-picker">
              <span>Язык</span>
              <select
                value={activeLanguage.id}
                onChange={(event) => handleLanguageChange(event.target.value)}
                data-testid="language-select"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="code-pane__sample-picker">
              <span>Пример</span>
              <select
                value={selectedSampleId}
                onChange={(event) => handleSampleChange(event.target.value)}
                data-testid="sample-select"
              >
                {activeLanguage.samples.map((sample) => (
                  <option key={sample.id} value={sample.id}>
                    {sample.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {activeSample?.description ? (
            <p className="code-pane__sample-description" data-testid="sample-description">
              {activeSample.description}
            </p>
          ) : null}
          <div className="code-pane__editor">
            <Editor
              key={activeLanguage.id}
              height="100%"
              width="100%"
              theme={editorTheme}
              language={activeLanguage.monacoLanguage}
              options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
              value={code}
              onChange={(value) =>
                setCodeByLanguage((prev) => ({ ...prev, [activeLanguage.id]: value ?? '' }))
              }
              beforeMount={handleEditorBeforeMount}
            />
          </div>
          {error ? (
            <div className="code-pane__error">
              <strong>Ошибка генерации</strong>
              <pre>{error}</pre>
            </div>
          ) : null}
        </div>
      </VerticalSplit.Pane>

      <VerticalSplit.Pane>
        <div className="diagram-pane">
          <div className={`diagram-pane__canvas ${overlayVisible ? 'is-blurred' : ''}`}>
            <ArchitectureDiagram
              model={diagramModel}
              nodeTypes={architectureNodeTypes}
              edgeTypes={architectureEdgeTypes}
              editable={true}
              themeControls={themeControls}
            />
          </div>
          {overlayVisible ? (
            <div className="diagram-pane__overlay" data-testid="progress-overlay">
              <div className="progress-card">
                <div className="progress-card__spinner" />
                <p>Processing…</p>
              </div>
            </div>
          ) : null}
        </div>
      </VerticalSplit.Pane>
    </VerticalSplit>
  );
}
export default CodeDiagramWorkbench
