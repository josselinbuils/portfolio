import { type LanguageService } from '../interfaces/LanguageService';
import { type SupportedLanguage } from '../interfaces/SupportedLanguage';
import { typeScriptService } from './typeScript/typeScriptService';

export function getLanguageService(
  language: SupportedLanguage,
): LanguageService {
  switch (language) {
    case 'javascript':
    case 'jsx':
      return {
        ...typeScriptService,
        lint: () => [],
        transpile: (c) => c,
      };

    case 'typescript':
    case 'tsx':
      return typeScriptService;

    default:
      return {
        getCompletions: () => undefined,
        getQuickInfo: () => undefined,
        lint: () => [],
        transpile: () => '', // Not executable
      };
  }
}
