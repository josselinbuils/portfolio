/** @see https://jakerunzer.com/running-ts-in-browser */
import fs from 'node:fs';
import path from 'node:path';
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
import { type PartialRecord } from '@/platform/interfaces/PartialRecord';
import {
  type LintIssue,
  type LintIssueLevel,
} from '../components/Editor/components/LintIssue/LintIssue';

const categoryToLintLevelMap: PartialRecord<
  DiagnosticCategory,
  LintIssueLevel
> = {
  [DiagnosticCategory.Error]: 'error',
  [DiagnosticCategory.Warning]: 'warning',
};

const excludedTsCodes = [2307];

const libs = {
  '/dom.d.ts': loadTypeScriptLibrary('lib.dom.d.ts'),
  '/es2015.d.ts': loadTypeScriptLibrary('lib.es2015.d.ts'),
  '/lib.es5.d.ts': loadTypeScriptLibrary('lib.es5.d.ts'),
  '/lib.es2015.d.ts': loadTypeScriptLibrary('lib.es2015.d.ts'),
  '/lib.es2015.core.d.ts': loadTypeScriptLibrary('lib.es2015.core.d.ts'),
  '/lib.es2015.collection.d.ts': loadTypeScriptLibrary(
    'lib.es2015.collection.d.ts',
  ),
  '/lib.es2015.generator.d.ts': loadTypeScriptLibrary(
    'lib.es2015.generator.d.ts',
  ),
  '/lib.es2015.promise.d.ts': loadTypeScriptLibrary('lib.es2015.promise.d.ts'),
  '/lib.es2015.iterable.d.ts': loadTypeScriptLibrary(
    'lib.es2015.iterable.d.ts',
  ),
  '/lib.es2015.proxy.d.ts': loadTypeScriptLibrary('lib.es2015.proxy.d.ts'),
  '/lib.es2015.reflect.d.ts': loadTypeScriptLibrary('lib.es2015.reflect.d.ts'),
  '/lib.es2015.symbol.d.ts': loadTypeScriptLibrary('lib.es2015.symbol.d.ts'),
  '/lib.es2015.symbol.wellknown.d.ts': loadTypeScriptLibrary(
    'lib.es2015.symbol.wellknown.d.ts',
  ),
};

function createSystem(files: { [name: string]: string }): System {
  files = { ...files };
  return {
    args: [],
    createDirectory: () => {
      throw new Error('createDirectory not implemented');
    },
    directoryExists: (directory) =>
      Object.keys(files).some((p) => p.startsWith(directory)),
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
    resolvePath: (p) => p,
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

function loadTypeScriptLibrary(library: string): string {
  return fs.readFileSync(
    path.join(process.cwd(), `node_modules/typescript/lib/${library}`),
    'utf8',
  );
}
