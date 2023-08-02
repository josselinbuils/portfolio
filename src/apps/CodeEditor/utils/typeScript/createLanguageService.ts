/** @see https://jakerunzer.com/running-ts-in-browser */
import {
  JsxEmit,
  ModuleKind,
  ModuleResolutionKind,
  ScriptSnapshot,
  ScriptTarget,
  createLanguageService as createOriginalLanguageService,
  getDefaultCompilerOptions,
  transpile,
  type CompilerOptions,
  type Diagnostic,
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

export interface LanguageService {
  getSemanticDiagnostics(): Diagnostic[];
  transpile(): string;
}

export function createLanguageService(code: string): LanguageService {
  const dummyFilename = 'file.ts';
  const files: Record<string, string> = {
    ...libs,
    [dummyFilename]: code,
  };
  const languageService = createOriginalLanguageService({
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

  return {
    getSemanticDiagnostics: () =>
      languageService.getSemanticDiagnostics(dummyFilename),
    transpile: () => transpile(code, compilerOptions),
  };
}
