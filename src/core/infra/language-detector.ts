import * as path from 'node:path';
import type { SupportedLanguage } from '../types/common';

export class LanguageDetector {
  private static extensionMap: Record<string, SupportedLanguage> = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.cs': 'csharp',
    '.java': 'java',
    '.go': 'go',
  };

  static detectFromFilePath(filePath: string): SupportedLanguage | null {
    const ext = path.extname(filePath).toLowerCase();
    return this.extensionMap[ext] || null;
  }

  static detectFromContent(content: string): SupportedLanguage | null {
    if (content.includes('package ') && content.includes('func ')) return 'go';
    if (content.includes('def ') && content.includes('import ')) return 'python';
    if (content.includes('namespace ') && content.includes('using ')) return 'csharp';
    if (content.includes('public class ') && content.includes('import ')) return 'java';
    if (content.includes('const ') || content.includes('let ')) return 'typescript';

    return null;
  }
}
