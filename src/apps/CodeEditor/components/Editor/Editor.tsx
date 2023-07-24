import { faCamera } from '@fortawesome/free-solid-svg-icons/faCamera';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons/faCircleInfo';
import { faFileCirclePlus } from '@fortawesome/free-solid-svg-icons/faFileCirclePlus';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons/faFolderOpen';
import { faStream } from '@fortawesome/free-solid-svg-icons/faStream';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import cn from 'classnames';
import {
  Suspense,
  type ChangeEvent,
  type FC,
  type TargetedEvent,
} from 'preact/compat';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { useKeyMap } from '@/platform/hooks/useKeyMap';
import { useList } from '@/platform/hooks/useList';
import { useMemState } from '@/platform/hooks/useMemState';
import { type ClientCursor } from '../../interfaces/ClientCursor';
import { type ClientState } from '../../interfaces/ClientState';
import { type CursorPosition } from '../../interfaces/CursorPosition';
import { type EditableState } from '../../interfaces/EditableState';
import { type Selection } from '../../interfaces/Selection';
import { createSelection } from '../../utils/createSelection';
import { highlightCode } from '../../utils/highlightCode/highlightCode';
import { spliceString } from '../../utils/spliceString';
import { Shortcut } from '../Shortcut/Shortcut';
import { ToolButton } from '../ToolButton/ToolButton';
import { Toolbar } from '../Toolbar/Toolbar';
import styles from './Editor.module.scss';
import { Cursor } from './components/Cursor/Cursor';
import { LineHighlight } from './components/LineHighlight/LineHighlight';
import { LineNumbers } from './components/LineNumbers/LineNumbers';
import { Tab } from './components/Tab/Tab';
import { Tabs } from './components/Tabs/Tabs';
import { type Completion } from './hooks/useAutoCompletion/useAutoCompletion';
import { useAutoCompletion } from './hooks/useAutoCompletion/useAutoCompletion';
import { useHistory } from './hooks/useHistory';
import { useSharedFile } from './hooks/useSharedFile/useSharedFile';
import { type EditorFile } from './interfaces/EditorFile';
import { autoEditChange } from './utils/autoEditChange/autoEditChange';
import { comment } from './utils/comment';
import { duplicate } from './utils/duplicate';
import { fileSaver } from './utils/fileSaver';
import { canFormat, formatCode } from './utils/formatCode';
import { getLineBeforeCursor } from './utils/getLineBeforeCursor';
import { getLineIndent } from './utils/getLineIndent';
import { getLineNumber } from './utils/getLineNumber';
import { getWidthWithoutPadding } from './utils/getWidthWithoutPadding';
import { indent } from './utils/indent';
import { isCodePortionEnd } from './utils/isCodePortionEnd';
import { moveLines } from './utils/moveLines';
import { showShortcuts } from './utils/showShortcuts';
import { unindent } from './utils/unindent';

export interface EditorProps {
  className?: string;
  code: string;
  onChange(code: string): void;
  onCursorPositionUpdate(cursorPosition: CursorPosition): void;
}

export const Editor: FC<EditorProps> = ({
  className,
  code,
  onChange,
  onCursorPositionUpdate,
}) => {
  const [active, setActive] = useState(false);
  const [autoCompleteActive, setAutoCompleteActive] = useState(false);
  const [cursorColor, setCursorColor] = useState('#f0f0f0');
  const [cursors, setCursors] = useState<ClientCursor[]>([]);
  const [displayDragOverlay, setDisplayDragOverlay] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState('');
  const [selection, setSelection] = useState<Selection>(() =>
    createSelection(0),
  );
  const [files, fileManager] = useList<EditorFile>(fileSaver.loadFiles);
  const [activeFilename, previouslyActiveFilename, setActiveFilename] =
    useMemState<string>(files[0].name);
  const [scrollTop, setScrollTop] = useState(0);
  const codeElementRef = useRef<HTMLDivElement>(null);
  const textAreaElementRef = useRef<HTMLTextAreaElement>(null);
  const cursorOffset = selection[0];
  const { complete, hasCompletionItems } = useAutoCompletion({
    active: autoCompleteActive,
    code,
    cursorOffset,
    lineIndent: getLineIndent(code, cursorOffset),
    menuClassName: styles.autoCompletionMenu,
    onCompletion: applyAutoCompletion,
    textAreaElement: textAreaElementRef.current as HTMLTextAreaElement,
  });
  const applyState = useCallback(
    (state: EditableState): void => {
      onChange(state.code);
      setSelection(state.selection);
    },
    [onChange],
  );
  const activeFile = files.find(
    ({ name }) => name === activeFilename,
  ) as EditorFile;
  const { pushState } = useHistory({
    active: !activeFile.shared,
    code,
    fileName: activeFilename,
    selection,
    applyState,
  });
  const { updateClientState, updateSelection } = useSharedFile({
    active: activeFile.shared,
    applyClientState,
    code,
    filename: activeFilename,
    selection,
  });

  useKeyMap(
    {
      'Alt+Shift+ArrowDown': () => updateState(moveLines(code, selection, 1)),
      'Alt+Shift+ArrowUp': () => updateState(moveLines(code, selection, -1)),
      'Control+:,Control+/,Meta+:,Meta+/': () =>
        updateState(comment(code, selection)),
      'Control+D,Meta+D': () => updateState(duplicate(code, selection)),
      'Control+N,Meta+N': createFile,
      'Control+O,Meta+O': () => open(undefined),
      'Control+S,Meta+S': format,
      Escape: () => {
        if (autoCompleteActive) {
          setAutoCompleteActive(false);
        }
      },
      'Shift+Tab': () => updateState(unindent(code, selection)),
      Tab: () => {
        if (hasCompletionItems) {
          complete();
        } else {
          updateState(indent(code, selection));
        }
      },
    },
    active,
  );

  useEffect(() => {
    activeFile.content = code;
    fileSaver.saveFiles(files);
  }, [activeFile, code, files, activeFile.shared]);

  useLayoutEffect(() => {
    applyState({
      code: activeFile.content,
      selection: createSelection(0),
    });
    if (textAreaElementRef.current !== null) {
      textAreaElementRef.current.focus();
    }
  }, [activeFile, applyState]);

  useLayoutEffect(() => {
    setHighlightedCode(
      highlightCode(
        code,
        activeFile.language,
        selection[1] === selection[0] ? selection[0] : undefined,
      ),
    );
  }, [activeFile.language, code, selection]);

  useEffect(() => {
    const x = getLineBeforeCursor(code, cursorOffset).length + 1;
    const y = getLineNumber(code, cursorOffset) + 1;
    onCursorPositionUpdate({ offset: cursorOffset, x, y });
  }, [code, cursorOffset, onCursorPositionUpdate]);

  useLayoutEffect(() => {
    const textAreaElement = textAreaElementRef.current;

    if (textAreaElement !== null) {
      const { selectionEnd, selectionStart } = textAreaElement;

      if (selectionStart !== selection[0] || selectionEnd !== selection[1]) {
        textAreaElement.setSelectionRange(selection[0], selection[1]);
      }
    }
  }, [code, selection, textAreaElementRef]);

  useLayoutEffect(() => {
    if (codeElementRef.current !== null) {
      codeElementRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop]);

  function applyAutoCompletion({
    completion,
    newCursorOffset,
  }: Completion): void {
    insertText(completion, newCursorOffset);
  }

  function applyClientState(state: ClientState): void {
    if (code !== state.code) {
      onChange(state.code);
    }
    if (cursorColor !== state.cursorColor) {
      setCursorColor(state.cursorColor);
    }
    if (
      selection[0] !== state.selection[0] ||
      selection[1] !== state.selection[1]
    ) {
      setSelection(state.selection);
    }
    if (cursors !== state.cursors) {
      setCursors(state.cursors);
    }
  }

  function closeFile(name: string): void {
    const fileToClose = files.find((file) => file.name === name) as EditorFile;

    if (activeFilename === name) {
      const isPreviouslyActiveFileStillOpen = files.some(
        (file) => file.name === previouslyActiveFilename,
      );
      const newActiveFilename = isPreviouslyActiveFileStillOpen
        ? (previouslyActiveFilename as string)
        : (files.find((file) => file !== fileToClose) as EditorFile).name;

      setActiveFilename(newActiveFilename);
    }

    const updatedFiles = [...files];
    updatedFiles.splice(files.indexOf(fileToClose), 1);
    fileManager.set(updatedFiles);
  }

  function createFile(): void {
    const maxIndex = Math.max(
      ...files.map((file) =>
        parseInt(
          file.name.startsWith('local') ? file.name.slice(5, -3) || '0' : '-1',
          10,
        ),
      ),
    );
    const name = `local${maxIndex > -1 ? maxIndex + 1 : ''}.js`;
    fileManager.push({
      content: '',
      language: 'javascript',
      name,
      shared: false,
    });
    setActiveFilename(name);
  }

  function disableAutoCompletion(): void {
    if (autoCompleteActive) {
      setAutoCompleteActive(false);
    }
  }

  async function exportCodeSnippet(): Promise<void> {
    const { exportAsImage } = await import(
      './utils/exportAsImage/exportAsImage'
    );
    await exportAsImage(code, highlightedCode);
  }

  async function format(): Promise<void> {
    try {
      const { language } = activeFile;
      const formatted = await formatCode(code, cursorOffset, language);

      if (formatted.code !== code) {
        if (activeFile.shared) {
          updateClientState(formatted);
        } else {
          updateState(formatted);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    const newCode = event.currentTarget.value;
    const newCursorOffset = event.currentTarget.selectionStart;

    if (newCode.length > code.length) {
      const allowAutoComplete = isCodePortionEnd(code, cursorOffset);

      if (allowAutoComplete && !autoCompleteActive) {
        setAutoCompleteActive(true);
      }
    } else {
      disableAutoCompletion();
    }

    const currentState = { code, selection };
    const newState = autoEditChange(currentState, {
      code: newCode,
      selection: createSelection(newCursorOffset),
    });

    if (newState !== undefined) {
      updateState(newState);

      if (activeFile.shared) {
        // Mitigates that React issue https://github.com/facebook/react/issues/12762
        onChange(`${code} `);
      }
    }
  }

  async function handleDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    setDisplayDragOverlay(false);

    const file = event.dataTransfer?.files?.[0];

    if (file !== undefined) {
      return open(file);
    }
  }

  function handleSelect(event: TargetedEvent): void {
    if (!event.target) {
      return;
    }

    const { selectionEnd, selectionStart } =
      event.target as HTMLTextAreaElement;

    if (
      selectionEnd !== selectionStart ||
      !isCodePortionEnd(code, selectionStart)
    ) {
      setAutoCompleteActive(false);
    }

    if (selectionStart === selection[0] && selectionEnd === selection[1]) {
      return;
    }

    const newSelection = createSelection(selectionStart, selectionEnd);

    if (activeFile.shared) {
      updateSelection(newSelection);
    } else {
      setSelection(newSelection);
    }
  }

  function insertText(
    text: string,
    newCursorOffset: number = cursorOffset + text.length,
  ): void {
    updateState({
      code: spliceString(code, cursorOffset, 0, text),
      selection: createSelection(newCursorOffset),
    });
  }

  async function open(file?: File): Promise<void> {
    try {
      const { openFile } = await import('./utils/openFile');
      const editorFile = await openFile(file);

      if (editorFile !== undefined) {
        if (files.some(({ name }) => name === editorFile.name)) {
          closeFile(editorFile.name);
        }
        fileManager.push(editorFile);
        setActiveFilename(editorFile.name);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function updateState(newState: EditableState | undefined): void {
    if (newState === undefined) {
      return;
    }
    if (activeFile.shared) {
      updateClientState(newState);
    } else {
      pushState(newState);
      applyState(newState);
    }
  }

  return (
    <div className={cn(styles.editor, className)}>
      <Toolbar className={styles.toolbar}>
        <ToolButton
          icon={faFileCirclePlus}
          onClick={createFile}
          title={
            <>
              New&nbsp;
              <Shortcut keys={['Ctrl', 'N']} />
            </>
          }
        />
        <ToolButton
          icon={faFolderOpen}
          onClick={() => open()}
          title={
            <>
              Open&nbsp;
              <Shortcut keys={['Ctrl', 'O']} />
            </>
          }
        />
        <ToolButton
          disabled={code.length === 0 || !canFormat(activeFile.language)}
          icon={faStream}
          onClick={format}
          title={
            <>
              Format&nbsp;
              <Shortcut keys={['Ctrl', 'S']} />
            </>
          }
        />
        <ToolButton
          disabled={code.length === 0}
          icon={faCamera}
          onClick={exportCodeSnippet}
          title="Export as image"
        />
        <ToolButton
          icon={faCircleInfo}
          onClick={showShortcuts}
          title="Show shortcuts"
        />
      </Toolbar>
      <Tabs className={styles.tabs} label="Files">
        {files.map(({ name }, index) => (
          <Tab
            key={name}
            onClick={() => setActiveFilename(name)}
            selected={name === activeFilename}
          >
            {name}
            {index >= fileSaver.defaultFiles.length && (
              <FontAwesomeIcon
                className={styles.close}
                icon={faTimes}
                onClick={(event: Event) => {
                  event.stopPropagation();
                  closeFile(name);
                }}
              />
            )}
          </Tab>
        ))}
      </Tabs>
      <div className={styles.container}>
        {activeFile.SideComponent ? (
          <Suspense fallback={null}>
            <activeFile.SideComponent />
          </Suspense>
        ) : null}
        <LineNumbers
          className={styles.lineNumbers}
          code={code}
          editorWidth={getWidthWithoutPadding(textAreaElementRef.current)}
          scrollTop={scrollTop}
          selection={selection}
        />
        <div className={styles.code}>
          <div className={styles.graphicalObjects} ref={codeElementRef}>
            <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
            {textAreaElementRef.current && (
              <>
                {activeFile.shared &&
                  cursors.map((cursor) => (
                    <Cursor
                      code={code}
                      color={cursor.color}
                      key={cursor.clientID}
                      selection={cursor.selection}
                      parent={textAreaElementRef.current as HTMLTextAreaElement}
                    />
                  ))}
                <LineHighlight
                  code={code}
                  parent={textAreaElementRef.current as HTMLTextAreaElement}
                  selection={selection}
                />
              </>
            )}
          </div>
          <textarea
            className={styles.textarea}
            onBlur={() => setActive(false)}
            onChange={handleChange}
            onClick={(event) => {
              // Waits for selectionEnd and selectionStart to be updated
              setTimeout(() => handleSelect(event), 0);
            }}
            onDragEnd={() => setDisplayDragOverlay(false)}
            onDragEnter={() => {
              setDisplayDragOverlay(true);
              return false;
            }}
            onDragLeave={() => setDisplayDragOverlay(false)}
            onDragOver={() => false}
            onDrop={handleDrop as (event: DragEvent) => void}
            onKeyDown={(event) => {
              // Waits for selectionEnd and selectionStart to be updated
              setTimeout(() => handleSelect(event), 0);
            }}
            onMouseDown={(event) => {
              disableAutoCompletion();
              // Waits for selectionEnd and selectionStart to be updated
              setTimeout(() => handleSelect(event), 0);
            }}
            onFocus={() => setActive(true)}
            onSelect={handleSelect}
            onScroll={({ target }) =>
              setScrollTop((target as HTMLTextAreaElement).scrollTop)
            }
            ref={textAreaElementRef}
            spellCheck={false}
            style={activeFile.shared ? { caretColor: cursorColor } : undefined}
            value={code}
          />
          {displayDragOverlay && (
            <div className={styles.dragAndDropOverlay}>Drop to open</div>
          )}
        </div>
      </div>
    </div>
  );
};
