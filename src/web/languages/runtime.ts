import { type SupportedLanguage, ParserRegistry, TypeScriptParser } from '@flowconsole/core';
import type { EvaluationResult } from './types';


export class TypeScriptPlaygroundRuntime {
    protected registry: ParserRegistry;

    constructor() {
        this.registry = new ParserRegistry();
        this.registry.register(new TypeScriptParser());
    }

    async ParseDiagrammingCode(source: string, language: SupportedLanguage): Promise<EvaluationResult> {
        const parser = this.registry.getParser(language);
        if (!parser) {
            return { ok: false, error: `${language} is not registered` };
        }

        const result = await parser.parse(source);

        if (result) {
            console.log(result);
            return { ok: true, model: { nodes: [], flows: [], edges: [] } };
        }

        throw new Error('Parsing failed', { cause: result });
    }
}