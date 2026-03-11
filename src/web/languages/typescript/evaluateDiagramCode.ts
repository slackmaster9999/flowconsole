import * as ts from 'typescript';

import { DiagramRuntime, ENTITY_TYPE_NAMES, type EntityTypeName } from './diagramRuntime';
import { buildReactFlowModel } from './modelToReactflowMapper';
import type { EvaluationResult } from '../types';

const ENTITY_TYPE_SET = new Set<EntityTypeName>(ENTITY_TYPE_NAMES);
const DSL_LINE_OFFSET = 1; //DSL_DECLARATIONS.split('\n').length;

export async function evaluateDiagramCode(source: string): Promise<EvaluationResult> {
  const runtime = new DiagramRuntime();
  const programSource = `$${source}`;

  const transpiled = ts.transpileModule(programSource, {
    fileName: 'diagram-dsl.ts',
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.ES2020,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      strict: false,
      esModuleInterop: true,
    },
    transformers: {
      before: [createEntityTransformer()],
    },
  });

  if (transpiled.diagnostics?.length) {
    const first = transpiled.diagnostics[0];
    const message = ts.flattenDiagnosticMessageText(first.messageText, '\n');
    const location = first.file && typeof first.start === 'number'
      ? first.file.getLineAndCharacterOfPosition(first.start)
      : undefined;
    const humanLine = location ? Math.max(1, location.line + 1 - DSL_LINE_OFFSET) : undefined;
    const prefix = location
      ? `line ${humanLine}, column ${location.character + 1}`
      : 'TS';
    return { ok: false, error: `${prefix}: ${message}` };
  }

  try {
    const evaluator = new Function('__createEntity', `${transpiled.outputText}`);
    evaluator(runtime.createEntityInvoker.bind(runtime));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }

  const intermediate = runtime.snapshot();
  const model = buildReactFlowModel(intermediate);
  return { ok: true, model };
}

function createEntityTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context) => {
    const { factory } = context;

    const visit: ts.Visitor = (node) => {
      if (ts.isVariableDeclaration(node) && node.initializer) {
        const match = resolveEntityMatch(node);
        if (match) {
          return factory.updateVariableDeclaration(
            node,
            node.name,
            node.exclamationToken,
            node.type,
            factory.createCallExpression(factory.createIdentifier('__createEntity'), undefined, [
              factory.createStringLiteral(match.typeName),
              match.initializer,
            ])
          );
        }
      }
      return ts.visitEachChild(node, visit, context);
    };

    return (sourceFile) => ts.visitNode(sourceFile, visit) as ts.SourceFile;
  };
}

function resolveEntityMatch(node: ts.VariableDeclaration) {
  if (!node.initializer) return null;
  const typeName = readTypeName(node.type);
  if (typeName && ENTITY_TYPE_SET.has(typeName)) {
    return { typeName, initializer: node.initializer };
  }

  if (ts.isSatisfiesExpression(node.initializer)) {
    const satisfiesType = readTypeName(node.initializer.type);
    if (satisfiesType && ENTITY_TYPE_SET.has(satisfiesType)) {
      return { typeName: satisfiesType, initializer: node.initializer.expression };
    }
  }

  return null;
}

function readTypeName(typeNode: ts.TypeNode | undefined): EntityTypeName | undefined {
  if (!typeNode) return undefined;
  if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
    return typeNode.typeName.text as EntityTypeName;
  }
  if (ts.isIdentifier(typeNode)) {
    return typeNode.text as EntityTypeName;
  }
  return undefined;
}
