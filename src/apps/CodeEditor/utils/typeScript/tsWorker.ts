import {
  DiagnosticCategory,
  JsxEmit,
  ModuleKind,
  ModuleResolutionKind,
  ScriptSnapshot,
  ScriptTarget,
  createLanguageService as createTypeScriptLanguageService,
  getDefaultCompilerOptions,
  transpile,
  type CompilerOptions,
  type Diagnostic,
  type DiagnosticMessageChain,
  type LanguageService as TypeScriptLanguageService,
  type QuickInfo,
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
  type LintIssueLevel,
  type LintIssue,
} from '../../interfaces/LanguageService';
import {
  type WorkerAction,
  type WorkerActionGenericHandler,
  type WorkerResponse,
  type WorkerResponseResult,
} from './interfaces';

const dummyFilename = 'file.ts';

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

const compilerOptions: CompilerOptions = {
  ...getDefaultCompilerOptions(),
  esModuleInterop: true,
  jsx: JsxEmit.React,
  lib: ['dom', 'es2015'],
  module: ModuleKind.None,
  moduleResolution: ModuleResolutionKind.NodeNext,
  skipDefaultLibCheck: true,
  skipLibCheck: true,
  strict: true,
  suppressOutputPathCheck: true,
  target: ScriptTarget.Latest,
};

export type LintActionHandler = WorkerActionGenericHandler<
  'lint',
  [string],
  LintIssue[]
>;

export type GetQuickInfoActionHandler = WorkerActionGenericHandler<
  'getQuickInfo',
  [string, number],
  QuickInfo | undefined
>;

export type TranspileActionHandler = WorkerActionGenericHandler<
  'transpile',
  [string],
  string
>;

export type WorkerActionHandler =
  | GetQuickInfoActionHandler
  | LintActionHandler
  | TranspileActionHandler;

onmessage = ({
  data: action,
}: MessageEvent<WorkerAction<WorkerActionHandler>>) => {
  const { args, type, uuid } = action;

  switch (type) {
    case 'getQuickInfo': {
      const [code, cursorOffset] = args;
      const tsLanguageService = getTypeScriptLanguageService(code);
      const quickInfo = tsLanguageService.getQuickInfoAtPosition(
        dummyFilename,
        cursorOffset,
      );

      sendWorkerResponse<GetQuickInfoActionHandler>(uuid, quickInfo);
      break;
    }

    case 'lint': {
      const [code] = args;
      const tsLanguageService = getTypeScriptLanguageService(code);
      const diagnostics =
        tsLanguageService.getSemanticDiagnostics(dummyFilename);
      const lintIssues = convertDiagnosticsToLintIssues(diagnostics);

      sendWorkerResponse<LintActionHandler>(uuid, lintIssues);
      break;
    }

    case 'transpile': {
      const [code] = args;
      const transpiledCode = transpile(code, compilerOptions);

      sendWorkerResponse<TranspileActionHandler>(uuid, transpiledCode);
      break;
    }

    default:
      console.error(`Unknown action: ${action}.`);
      break;
  }
};

function sendWorkerResponse<Handler extends WorkerActionGenericHandler>(
  uuid: string,
  result: WorkerResponseResult<Handler>,
) {
  postMessage({ result, uuid } satisfies WorkerResponse<Handler>);
}

function convertDiagnosticsToLintIssues(
  diagnostics: Diagnostic[],
): LintIssue[] {
  const categoryToLintLevelMap: PartialRecord<
    DiagnosticCategory,
    LintIssueLevel
  > = {
    [DiagnosticCategory.Error]: 'error',
    [DiagnosticCategory.Warning]: 'warning',
  };
  const excludedTsCodes = [2307];

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

function getTypeScriptLanguageService(code: string): TypeScriptLanguageService {
  const files: Record<string, string> = {
    ...libs,
    [dummyFilename]: code,
  };
  return createTypeScriptLanguageService({
    fileExists: (filename) => files[filename] !== undefined,
    getCompilationSettings: () => compilerOptions,
    getCurrentDirectory: () => '/',
    getDefaultLibFileName: () => '/lib.es2015.d.ts',
    getNewLine: () => '\n',
    getScriptFileNames: () => Object.keys(files),
    getScriptSnapshot(filename) {
      const contents = this.readFile(filename);
      return contents ? ScriptSnapshot.fromString(contents) : undefined;
    },
    getScriptVersion: () => '0',
    readFile: (filename) => files[filename],
    useCaseSensitiveFileNames: () => true,
  });
}
