import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { TypeScriptParser } from '../parsers/typescript-parser';
import { PythonParser } from '../parsers/python-parser';
import { CSharpParser } from '../parsers/csharp-parser';
import { JavaParser } from '../parsers/java-parser';
import { GoParser } from '../parsers/go-parser';
import { registerDynamicLanguage } from '@ast-grep/napi';
import type { ParseResult } from '../types/common';

// Register dynamic languages for non-TS/JS
const csharp = require('@ast-grep/lang-csharp');
const python = require('@ast-grep/lang-python');
const java = require('@ast-grep/lang-java');
const go = require('@ast-grep/lang-go');

registerDynamicLanguage({
  csharp: csharp.default ?? csharp,
  python: python.default ?? python,
  java: java.default ?? java,
  go: go.default ?? go,
});

const fixturesDir = path.join(__dirname, 'fixtures');
const expectedDir = path.join(__dirname, 'expected');

// Helper to strip UUIDs from result for comparison
function stripIds(result: ParseResult): unknown {
  return {
    nodes: result.nodes.map(({ id, ...rest }) => rest),
    flows: result.flows.map(({ id, sourceId, targetId, ...rest }) => ({
      ...rest,
      // Keep sourceId/targetId as node names for matching
      sourceName: result.nodes.find(n => n.id === sourceId)?.name,
      targetName: result.nodes.find(n => n.id === targetId)?.name,
    })),
  };
}

const testCases: Array<{
  name: string;
  parser: () => InstanceType<typeof TypeScriptParser>;
  inputFile: string;
  expectedFile: string;
}> = [
  {
    name: 'TypeScript',
    parser: () => new TypeScriptParser(),
    inputFile: 'test_sample.ts',
    expectedFile: 'test_sample.ts.expected.json',
  },
  {
    name: 'Python',
    parser: () => new PythonParser(),
    inputFile: 'test_sample.py',
    expectedFile: 'test_sample.py.expected.json',
  },
  {
    name: 'C#',
    parser: () => new CSharpParser(),
    inputFile: 'test_sample.cs',
    expectedFile: 'test_sample.cs.expected.json',
  },
  {
    name: 'Java',
    parser: () => new JavaParser(),
    inputFile: 'test_sample.java',
    expectedFile: 'test_sample.java.expected.json',
  },
  {
    name: 'Go',
    parser: () => new GoParser(),
    inputFile: 'test_sample.go',
    expectedFile: 'test_sample.go.expected.json',
  },
];

describe('Parser tests', () => {
  it.each(testCases)('$name parser should correctly parse test_sample', ({ parser, inputFile, expectedFile }) => {
    const inputPath = path.join(fixturesDir, inputFile);
    const expectedPath = path.join(expectedDir, expectedFile);

    const source = fs.readFileSync(inputPath, 'utf8');
    const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));

    const p = parser();
    const result = p.parse(source);
    const stripped = stripIds(result);

    expect(stripped).toEqual(expected);
  });
});
