/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
//import { dotnet } from 'dotnet.js';

import type { EvaluationResult } from "../types";


type WorkerRequest = { id: number; type: 'evaluate'; source: string };
type WorkerResponse = { id: number; result: EvaluationResult };


let runtimeFailure: Error | null = null;

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;
  if (!message || typeof message.id !== 'number') return;
  if (message.type === 'evaluate') {
    void handleEvaluate(message);
  }
};

async function handleEvaluate(message: WorkerRequest) {
  const send = (result: EvaluationResult) => {
    const response: WorkerResponse = { id: message.id, result };
    self.postMessage(response);
  };

  try {
    //const { getAssemblyExports, getConfig } = await dotnet.create(); // Set up the .NET WASM runtime 
    //const config = getConfig();
    //const exports = await getAssemblyExports(config.mainAssemblyName);
    //const raw = runtime.evaluate(message.source ?? '');
    //send(safeParseResult(raw));
  } catch (error) {
    runtimeFailure = error instanceof Error ? error : new Error(String(error));
    send({ ok: false, error: runtimeFailure.message });
  }
}


/*function safeParseResult(raw: unknown): EvaluationResult {
  if (typeof raw !== 'string') {
    return { ok: false, error: '(JSON expected).' };
  }
  try {
    const data = JSON.parse(raw) as EvaluationResult;
    if (data && typeof data === 'object' && 'ok' in data) {
      return data;
    }
    return { ok: false, error: 'Build result in unknown JSON format.' };
  } catch (error) {
    return { ok: false, error: `JSON parse error: ${error instanceof Error ? error.message : String(error)}` };
  }
}*/

export {};
