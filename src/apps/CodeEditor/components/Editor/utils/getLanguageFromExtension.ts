import { type SupportedExtension } from '../interfaces/SupportedExtension';
import { type SupportedLanguage } from '../interfaces/SupportedLanguage';

const extensionToLanguageMap: Record<SupportedExtension, SupportedLanguage> = {
  cjs: 'javascript',
  css: 'css',
  html: 'html',
  js: 'javascript',
  json: 'json',
  jsx: 'jsx',
  md: 'markdown',
  mjs: 'javascript',
  scss: 'scss',
  svg: 'svg',
  ts: 'typescript',
  tsx: 'tsx',
  xml: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
};

export function getLanguageFromExtension(
  extension: string,
): SupportedLanguage | undefined {
  return extensionToLanguageMap[extension as SupportedExtension];
}
