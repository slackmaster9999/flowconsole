#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as yargs from 'yargs';
import * as helpers from 'yargs/helpers';
import { registerDynamicLanguage } from '@ast-grep/napi';
import { ParserRegistry } from '@flowconsole/core/infra/parser-registry';
import { LanguageDetector } from '@flowconsole/core/infra/language-detector';
import { TypeScriptParser } from '@flowconsole/core/parsers/typescript-parser';
import { PythonParser } from '@flowconsole/core/parsers/python-parser';
import { CSharpParser } from '@flowconsole/core/parsers/csharp-parser';
import { JavaParser } from '@flowconsole/core/parsers/java-parser';
import { GoParser } from '@flowconsole/core/parsers/go-parser';
import type { SupportedLanguage } from '@flowconsole/core/types/common';
type LangRegistration = {
  libraryPath: string;
  extensions: string[];
  languageSymbol?: string;
  metaVarChar?: string;
  expandoChar?: string;
};

// ast-grep lang packages export CommonJS objects without a default field; make sure we pass the raw object.
function loadLang(mod: any): LangRegistration {
  return (mod?.default ?? mod) as LangRegistration;
}

const csharp = loadLang(require('@ast-grep/lang-csharp'));
const python = loadLang(require('@ast-grep/lang-python'));
const java = loadLang(require('@ast-grep/lang-java'));
const go = loadLang(require('@ast-grep/lang-go'));

interface ParseOptions {
  file: string;
  lang?: SupportedLanguage;
  output?: string;
}

registerDynamicLanguage({
  csharp,
  python,
  java,
  go,
});

const registry = new ParserRegistry();

registry.register(new TypeScriptParser());
registry.register(new PythonParser());
registry.register(new CSharpParser());
registry.register(new JavaParser());
registry.register(new GoParser());

async function parseFile(options: ParseOptions): Promise<void> {
  const { file, lang, output } = options;

  const source = fs.readFileSync(path.resolve(file), 'utf8');

  const detectedLang = lang || LanguageDetector.detectFromFilePath(file);

  if (!detectedLang) {
    console.error(`Error: Could not detect language for ${file}. Please specify with --lang`);
    console.error(`\nSupported languages: ${registry.getSupportedLanguages().join(', ')}`);
    process.exit(1);
  }

  const parser = registry.getParser(detectedLang);

  if (!parser) {
    console.error(`Error: No parser available for language: ${detectedLang}`);
    console.error(`Supported languages: ${registry.getSupportedLanguages().join(', ')}`);
    process.exit(1);
  }

  try {
    const result = parser.parse(source);
    const json = JSON.stringify(result, null, 2);

    if (output) {
      fs.writeFileSync(output, json, 'utf8');
      console.log(`Output written to: ${output}`);
    } else {
      console.log(json);
    }
  } catch (error) {
    console.error(`Error parsing file:`, error);
    process.exit(1);
  }
}

yargs(helpers.hideBin(process.argv))
  .command(
    'parse <file>',
    'Parse architecture file and extract nodes and flows',
    (yargs) => {
      return yargs
        .positional('file', {
          describe: 'Path to architecture file',
          type: 'string',
          demandOption: true,
        })
        .option('lang', {
          alias: 'l',
          describe: 'Language of the source file',
          choices: ['typescript', 'python', 'csharp', 'java', 'go'] as const,
          type: 'string',
        })
        .option('output', {
          alias: 'o',
          describe: 'Output file path (default: stdout)',
          type: 'string',
        });
    },
    (argv) => {
      parseFile(argv as ParseOptions).catch((error) => {
        console.error(error);
        process.exit(1);
      });
    }
  )
  .command(
    'languages',
    'List supported languages',
    () => {},
    () => {
      console.log('Supported languages:');
      registry.getSupportedLanguages().forEach((lang) => {
        console.log(`  - ${lang}`);
      });
    }
  )
  .demandCommand(1, 'You must provide a command')
  .help()
  .alias('help', 'h')
  .version('0.1.0')
  .alias('version', 'v')
  .parse();
