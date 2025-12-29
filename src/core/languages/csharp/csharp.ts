import type { LanguageDefinition, EvaluationResult } from "../types";


const csharpSamples = [
  {
    id: 'retail-banking-cs',
    title: 'Retail Banking (C#)',
    description: 'Тот же сценарий, но на C# DSL.',
    code: `var customer = new User { Name = "Customer", Description = "Retail banking customer" };
var platform = new ComputerSystem { Name = "Cloud Banking" };
var backend = new Container { Name = "Core Services", System = platform };
var api = new RestApi { Name = "Accounts API", Description = "Loads balances", BelongsTo = backend };

customer.SendsRequestTo(api, "load dashboard");`,
  },
] satisfies LanguageDefinition['samples'];

type WorkerRequest = { id: number; type: 'evaluate'; source: string };
type WorkerResponse = { id: number; result: EvaluationResult };

let workerCounter = 0;
let workerInstance: Worker | null = null;
const pending = new Map<number, (value: EvaluationResult) => void>();

function ensureWorker(): Worker {
  if (workerInstance) return workerInstance;
  workerInstance = new Worker(new URL('./csharpWorker.ts', import.meta.url), { type: 'module' });
  workerInstance.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const { id, result } = event.data;
    const resolve = pending.get(id);
    if (resolve) {
      pending.delete(id);
      resolve(result);
    }
  };
  workerInstance.onerror = (error) => {
    pending.forEach((resolve) => resolve({ ok: false, error: String(error.message ?? error) }));
    pending.clear();
  };
  return workerInstance;
}

async function evaluateCSharpDiagram(source: string): Promise<EvaluationResult> {
  const worker = ensureWorker();
  const id = ++workerCounter;
  const request: WorkerRequest = { id, type: 'evaluate', source };
  return new Promise<EvaluationResult>((resolve) => {
    pending.set(id, resolve);
    worker.postMessage(request);
  });
}

export const csharpLanguage: LanguageDefinition = {
  id: 'csharp',
  label: 'C#',
  monacoLanguage: 'csharp',
  samples: csharpSamples,
  defaultSampleId: csharpSamples[0]?.id,
  evaluate: (source: string) => evaluateCSharpDiagram(source),
};
