import { type SupportedExtension } from '../interfaces/SupportedExtension';
import { type SupportedLanguage } from '../interfaces/SupportedLanguage';

const languageToExtensionMap: Record<SupportedLanguage, SupportedExtension> = {
  css: 'css',
  html: 'html',
  javascript: 'js',
  json: 'json',
  jsx: 'jsx',
  markdown: 'md',
  scss: 'scss',
  svg: 'svg',
  tsx: 'tsx',
  typescript: 'ts',
  xml: 'xml',
  yaml: 'yml',
};

export function getExtensionFromLanguage(
  language: SupportedLanguage,
): SupportedExtension {
  return languageToExtensionMap[language];
}
