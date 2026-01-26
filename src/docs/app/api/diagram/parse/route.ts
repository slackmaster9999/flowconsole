import { NextResponse, type NextRequest } from 'next/server';
import { registerDynamicLanguage, LangRegistration } from '@ast-grep/napi';
import csharpLang from '@ast-grep/lang-csharp';
import pythonLang from '@ast-grep/lang-python';
import javaLang from '@ast-grep/lang-java';
import goLang from '@ast-grep/lang-go';
import {
  ParserRegistry,
  TypeScriptParser,
  PythonParser,
  CSharpParser,
  JavaParser,
  GoParser,
  type SupportedLanguage,
} from '@flowconsole/core';

export const runtime = 'nodejs';

type ParseRequest = {
  source?: string;
  lang?: SupportedLanguage;
};

type ParseResponse = { ok: boolean; result?: unknown, error?: string };

let registry: ParserRegistry | null = null;
let languagesRegistered = false;

const ALLOWED_ORIGINS = new Set(
  [process.env.NEXT_PUBLIC_FLOWCONSOLE_APP_ORIGIN, 'http://localhost:5173'].filter(
    (origin): origin is string => Boolean(origin)
  )
);

function getCorsHeaders(req: NextRequest) {
  const origin = req.headers.get('origin');
  const headers = {
      'Access-Control-Allow-Origin': origin ?? "http://localhost:5173",
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      Vary: 'Origin',
    };

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    return headers;
  }
  return headers;
}

function jsonResponse(req: NextRequest, payload: ParseResponse, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: getCorsHeaders(req),
  });
}

function loadLang(mod: unknown): LangRegistration {
  const candidate = mod as { default?: unknown };
  return candidate?.default ?? mod;
}

function getRegistry() {
  if (!languagesRegistered) {
    registerDynamicLanguage({
      csharp: loadLang(csharpLang),
      python: loadLang(pythonLang),
      java: loadLang(javaLang),
      go: loadLang(goLang),
    });
    languagesRegistered = true;
  }

  if (!registry) {
    registry = new ParserRegistry();
    registry.register(new TypeScriptParser());
    registry.register(new PythonParser());
    registry.register(new CSharpParser());
    registry.register(new JavaParser());
    registry.register(new GoParser());
  }

  return registry;
}

export async function POST(req: NextRequest) {
  let payload: ParseRequest;
  try {
    payload = (await req.json()) as ParseRequest;
  } catch {
    const response: ParseResponse = { ok: false, error: 'Invalid JSON body' };
    return jsonResponse(req, response, 400);
  }

  const source = payload.source;
  const lang = payload.lang ?? 'typescript';

  if (!source || typeof source !== 'string') {
    const response: ParseResponse = { ok: false, error: 'Missing source' };
    return jsonResponse(req, response, 400);
  }

  const registry = getRegistry();
  const parser = registry.getParser(lang);

  if (!parser) {
    const response: ParseResponse = { ok: false, error: `Unsupported language: ${lang}` };
    return jsonResponse(req, response, 400);
  }

  try {
    const result = parser.parse(source);
    const response: ParseResponse = { ok: true, result };
    return jsonResponse(req, response);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const response: ParseResponse = { ok: false, error: message };
    return jsonResponse(req, response, 500);
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}
