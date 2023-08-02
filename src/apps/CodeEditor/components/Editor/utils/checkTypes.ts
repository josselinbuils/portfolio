/** @see https://jakerunzer.com/running-ts-in-browser */
import {
  DiagnosticCategory,
  JsxEmit,
  ModuleKind,
  ModuleResolutionKind,
  ScriptSnapshot,
  ScriptTarget,
  createLanguageService,
  createSourceFile,
  getDefaultCompilerOptions,
  type CompilerHost,
  type CompilerOptions,
  type DiagnosticMessageChain,
  type LanguageServiceHost,
  type SourceFile,
  type System,
} from 'typescript';
import dom from 'typescript/lib/lib.dom.d?raw';
import libEs2015Collection from 'typescript/lib/lib.es2015.collection.d?raw';
import libEs2015Core from 'typescript/lib/lib.es2015.core.d?raw';
import libEs2015 from 'typescript/lib/lib.es2015.d?raw';
import libEs2015Generator from 'typescript/lib/lib.es2015.generator.d?raw';
import libEs2015Iterable from 'typescript/lib/lib.es2015.iterable.d?raw';
import libEs2015Promise from 'typescript/lib/lib.es2015.promise.d?raw';
import libEs2015Proxy from 'typescript/lib/lib.es2015.proxy.d?raw';
import libEs2015Reflect from 'typescript/lib/lib.es2015.reflect.d?raw';
import libEs2015Symbol from 'typescript/lib/lib.es2015.symbol.d?raw';
import libEs2015SymbolWellKnown from 'typescript/lib/lib.es2015.symbol.wellknown.d?raw';
import libEs5 from 'typescript/lib/lib.es5.d?raw';
import { type PartialRecord } from '@/platform/interfaces/PartialRecord';
import {
  type LintIssue,
  type LintIssueLevel,
} from '../components/LintIssue/LintIssue';

const categoryToLintLevelMap: PartialRecord<
  DiagnosticCategory,
  LintIssueLevel
> = {
  [DiagnosticCategory.Error]: 'error',
  [DiagnosticCategory.Warning]: 'warning',
};

const excludedTsCodes = [2307];

const libs = {
  '/dom.d.ts': dom,
  '/es2015.d.ts': libEs2015,
  '/lib.es5.d.ts': libEs5,
  '/lib.es2015.d.ts': libEs2015,
  '/lib.es2015.core.d.ts': libEs2015Core,
  '/lib.es2015.collection.d.ts': libEs2015Collection,
  '/lib.es2015.generator.d.ts': libEs2015Generator,
  '/lib.es2015.promise.d.ts': libEs2015Promise,
  '/lib.es2015.iterable.d.ts': libEs2015Iterable,
  '/lib.es2015.proxy.d.ts': libEs2015Proxy,
  '/lib.es2015.reflect.d.ts': libEs2015Reflect,
  '/lib.es2015.symbol.d.ts': libEs2015Symbol,
  '/lib.es2015.symbol.wellknown.d.ts': libEs2015SymbolWellKnown,
};

function createSystem(files: { [name: string]: string }): System {
  files = { ...files };
  return {
    args: [],
    createDirectory: () => {
      throw new Error('createDirectory not implemented');
    },
    directoryExists: (directory) =>
      Object.keys(files).some((path) => path.startsWith(directory)),
    exit: () => {
      throw new Error('exit not implemented');
    },
    fileExists: (fileName) => files[fileName] != null,
    getCurrentDirectory: () => '/',
    getDirectories: () => [],
    getExecutingFilePath: () => {
      throw new Error('getExecutingFilePath not implemented');
    },
    readDirectory: (directory) => (directory === '/' ? Object.keys(files) : []),
    readFile: (fileName) => files[fileName],
    resolvePath: (path) => path,
    newLine: '\n',
    useCaseSensitiveFileNames: true,
    write: () => {
      throw new Error('write not implemented');
    },
    writeFile: (fileName, contents) => {
      files[fileName] = contents;
    },
  };
}

const compilerOptions: CompilerOptions = {
  ...getDefaultCompilerOptions(),
  esModuleInterop: true,
  jsx: JsxEmit.React,
  lib: ['dom', 'es2015'],
  module: ModuleKind.None,
  moduleResolution: ModuleResolutionKind.NodeJs,
  skipDefaultLibCheck: true,
  skipLibCheck: true,
  strict: false,
  suppressOutputPathCheck: true,
  target: ScriptTarget.Latest,
};

export function checkTypes(code: string): LintIssue[] {
  try {
    const dummyFilename = 'file.ts';
    const files: { [name: string]: string } = {
      [dummyFilename]: code,
    };

    const system = createSystem({
      ...libs,
      ...files,
    });

    const sourceFiles: { [name: string]: SourceFile } = {};

    for (const name of Object.keys(files)) {
      sourceFiles[name] = createSourceFile(
        name,
        files[name],
        compilerOptions.target || ScriptTarget.Latest,
      );
    }

    const compilerHost: CompilerHost = {
      ...system,
      getCanonicalFileName: (fileName) => fileName,
      getDefaultLibFileName: () => '/lib.es2015.d.ts',
      getDirectories: () => [],
      getNewLine: () => system.newLine,
      getSourceFile: (filename) => sourceFiles[filename],
      useCaseSensitiveFileNames: () => system.useCaseSensitiveFileNames,
    };

    const languageServiceHost: LanguageServiceHost = {
      ...compilerHost,
      getCompilationSettings: () => compilerOptions,
      getScriptFileNames: () => Object.keys(files),
      getScriptSnapshot: (filename) => {
        const contents = system.readFile(filename);
        return contents ? ScriptSnapshot.fromString(contents) : undefined;
      },
      getScriptVersion: () => '0',
      writeFile: system.writeFile,
    };

    const languageService = createLanguageService(languageServiceHost);
    const diagnostics = languageService.getSemanticDiagnostics(dummyFilename);

    return diagnostics
      .map(
        ({
          category,
          code: tsCode,
          length,
          messageText,
          start,
        }): LintIssue | undefined => {
          const level = categoryToLintLevelMap[category];

          return length !== undefined &&
            level !== undefined &&
            start !== undefined &&
            !excludedTsCodes.includes(tsCode)
            ? {
                length,
                level,
                message: `TS${tsCode}: ${
                  typeof messageText === 'string'
                    ? messageText
                    : getMessageFromDiagnosticMessageChain(messageText)
                }`,
                start,
              }
            : undefined;
        },
      )
      .filter((lintIssue): lintIssue is LintIssue => Boolean(lintIssue));
  } catch (error) {
    console.error('An error occurred during type check:', error);
    return [];
  }
}

function getMessageFromDiagnosticMessageChain({
  messageText,
  next,
}: DiagnosticMessageChain): string {
  return (
    next?.reduce(
      (message, diagnosticMessageChain) =>
        `${message}\n${getMessageFromDiagnosticMessageChain(
          diagnosticMessageChain,
        )}`,
      messageText,
    ) ?? messageText
  );
}
