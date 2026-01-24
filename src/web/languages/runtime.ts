import type { EvaluationResult, SupportedLanguage } from './types';
import { mapParseResultToDiagramModel, type ParseResult } from './parseResultMapper';

const DEFAULT_API_PATH = '/api/diagram/parse';

function resolveApiPath() {
  const apiUrl = import.meta.env.VITE_FLOWCONSOLE_API_URL;
  if(!apiUrl) {
    throw new Error('FLOWCONSOLE_API_URL is not defined');
  }
  return `${apiUrl}${DEFAULT_API_PATH}`;
}

type ParseApiResponse =
  | { ok: true; result: ParseResult }
  | { ok: false; error: string };

export class TypeScriptPlaygroundRuntime {
  async ParseDiagrammingCode(source: string, language: SupportedLanguage): Promise<EvaluationResult> {
    const apiPath = resolveApiPath();
    const response = await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, lang: language }),
    });

    let payload: ParseApiResponse | null = null;
    try {
      payload = (await response.json()) as ParseApiResponse;
    } catch {
      payload = null;
    }

    if (!response.ok || !payload || !payload.ok) {
      const error =
        payload && 'error' in payload
          ? payload.error
          : `Request failed with status ${response.status}`;
      return { ok: false, error };
    }

    const model = mapParseResultToDiagramModel(payload.result);
    return { ok: true, model };
  }
}
