import { faCamera } from '@fortawesome/free-solid-svg-icons/faCamera';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons/faFolderOpen';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faStream } from '@fortawesome/free-solid-svg-icons/faStream';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useKeyMap } from '@josselinbuils/hooks/useKeyMap';
import { useList } from '@josselinbuils/hooks/useList';
import cn from 'classnames';
import {
  ChangeEvent,
  DragEvent,
  FC,
  SyntheticEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useMemState } from '~/platform/hooks/useMemState';
import { highlightCode } from '~/platform/utils/highlightCode/highlightCode';
import { ClientCursor } from '../../interfaces/ClientCursor';
import { ClientState } from '../../interfaces/ClientState';
import { CursorPosition } from '../../interfaces/CursorPosition';
import { EditableState } from '../../interfaces/EditableState';
import { Selection } from '../../interfaces/Selection';
import { createSelection } from '../../utils/createSelection';
import { spliceString } from '../../utils/spliceString';
import { Shortcut } from '../Shortcut/Shortcut';
import { Toolbar } from '../Toolbar/Toolbar';
import { ToolButton } from '../ToolButton/ToolButton';
import { Cursor } from './components/Cursor/Cursor';
import { Highlight } from './components/Highlight/Highlight';
import { LineNumbers } from './components/LineNumbers/LineNumbers';
import { Tab } from './components/Tab/Tab';
import { Tabs } from './components/Tabs/Tabs';
import {
  Completion,
  useAutoCompletion,
} from './hooks/useAutoCompletion/useAutoCompletion';
import { useHistory } from './hooks/useHistory';
import { useSharedFile } from './hooks/useSharedFile/useSharedFile';
import { EditorFile } from './interfaces/EditorFile';
import { autoEditChange } from './utils/autoEditChange/autoEditChange';
import { comment } from './utils/comment';
import { fileSaver, SHARED_FILENAME } from './utils/fileSaver';
import { canFormat, formatCode } from './utils/formatCode';
import { getLineBeforeCursor } from './utils/getLineBeforeCursor';
import { getLineIndent } from './utils/getLineIndent';
import { getLineNumber } from './utils/getLineNumber';
import { indent } from './utils/indent';
import { isCodePortionEnd } from './utils/isCodePortionEnd';
import { unindent } from './utils/unindent';

import styles from './Editor.module.scss';

export const Editor: FC<Props> = ({
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
  const [selection, setSelection] = useState<Selection>({ start: 0, end: 0 });
  const [files, fileManager] = useList<EditorFile>(fileSaver.loadFiles);
  const [activeFileName, previouslyActiveFileName, setActiveFileName] =
    useMemState<string>(files[0].name);
  const [lineCount, setLineCount] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);
  const codeElementRef = useRef<HTMLDivElement>(null);
  const textAreaElementRef = useRef<HTMLTextAreaElement>(null);
  const cursorOffset = selection.start;
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
    [onChange]
  );
  const isSharedFileActive = activeFileName === SHARED_FILENAME;
  const { pushState } = useHistory({
    active: !isSharedFileActive,
    code,
    fileName: activeFileName,
    selection,
    applyState,
  });
  const { updateClientState, updateSelection } = useSharedFile({
    active: isSharedFileActive,
    applyClientState,
    code,
    selection,
  });
  const activeFile = files.find(
    ({ name }) => name === activeFileName
  ) as EditorFile;

  useKeyMap(
    {
      'Control+:,Control+/,Meta+:,Meta+/': () => {
        const newState = comment(code, selection);

        if (newState !== undefined) {
          updateState(newState);
        }
      },
      'Control+N,Meta+N': createFile,
      'Control+O,Meta+O': () => open(undefined),
      'Control+S,Meta+S': format,
      Escape: () => {
        if (autoCompleteActive) {
          setAutoCompleteActive(false);
        }
      },
      'Shift+Tab': () => {
        const newState = unindent(code, selection);

        if (newState !== undefined) {
          updateState(newState);
        }
      },
      Tab: () => {
        if (hasCompletionItems) {
          complete();
        } else {
          updateState(indent(code, selection));
        }
      },
    },
    active
  );

  useEffect(() => {
    activeFile.content = code;
    fileSaver.saveFiles(files);
  }, [activeFile, code, files, isSharedFileActive]);

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
    setHighlightedCode(highlightCode(code, activeFile.language));
  }, [activeFile.language, code]);

  useEffect(() => {
    const x = getLineBeforeCursor(code, cursorOffset).length + 1;
    const y = getLineNumber(code, cursorOffset) + 1;
    onCursorPositionUpdate({ offset: cursorOffset, x, y });
  }, [code, cursorOffset, onCursorPositionUpdate]);

  useLayoutEffect(() => {
    const newLineCount = (code.match(/\n/g)?.length || 0) + 1;

    if (newLineCount !== lineCount) {
      setLineCount(newLineCount);
    }
  }, [code, lineCount]);

  useLayoutEffect(() => {
    const textAreaElement = textAreaElementRef.current;

    if (textAreaElement !== null) {
      const { selectionEnd, selectionStart } = textAreaElement;

      if (
        selectionStart !== selection.start ||
        selectionEnd !== selection.end
      ) {
        textAreaElement.setSelectionRange(selection.start, selection.end);
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
      selection.start !== state.selection.start ||
      selection.end !== state.selection.end
    ) {
      setSelection(state.selection);
    }
    if (cursors !== state.cursors) {
      setCursors(state.cursors);
    }
  }

  function closeFile(name: string): void {
    const fileToClose = files.find((file) => file.name === name) as EditorFile;

    if (activeFileName === name) {
      const isPreviouslyActiveFileStillOpen = files.some(
        (file) => file.name === previouslyActiveFileName
      );
      const newActiveFileName = isPreviouslyActiveFileStillOpen
        ? (previouslyActiveFileName as string)
        : (files.find((file) => file !== fileToClose) as EditorFile).name;

      setActiveFileName(newActiveFileName);
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
          10
        )
      )
    );
    const name = `local${maxIndex > -1 ? maxIndex + 1 : ''}.js`;
    fileManager.push({ content: '', language: 'javascript', name });
    setActiveFileName(name);
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
        if (isSharedFileActive) {
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
    const newCode = event.target.value;
    const newCursorOffset = event.target.selectionStart;

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

      if (isSharedFileActive) {
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

  function handleSelect({ target }: SyntheticEvent): void {
    const { selectionEnd, selectionStart } = target as HTMLTextAreaElement;

    if (
      selectionEnd !== selectionStart ||
      !isCodePortionEnd(code, selectionStart)
    ) {
      setAutoCompleteActive(false);
    }

    if (selectionStart === selection.start && selectionEnd === selection.end) {
      return;
    }

    const newSelection = {
      start: selectionStart,
      end: selectionEnd,
    };

    if (isSharedFileActive) {
      updateSelection(newSelection);
    } else {
      setSelection(newSelection);
    }
  }

  function insertText(
    text: string,
    newCursorOffset: number = cursorOffset + text.length
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
        setActiveFileName(editorFile.name);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function updateState(newState: EditableState): void {
    if (isSharedFileActive) {
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
          icon={faPlus}
          onClick={createFile}
          title={
            <>
              New
              <Shortcut keys={['Ctrl', 'N']} />
            </>
          }
        />
        <ToolButton
          icon={faFolderOpen}
          onClick={() => open()}
          title={
            <>
              Open
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
              Format
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
      </Toolbar>
      <Tabs className={styles.tabs} label="Files">
        {files.map(({ name }, index) => (
          <Tab
            key={name}
            onClick={() => setActiveFileName(name)}
            selected={name === activeFileName}
          >
            {name}
            {index >= fileSaver.defaultFiles.length && (
              <FontAwesomeIcon
                className={styles.close}
                icon={faTimes}
                onClick={(event) => {
                  event.stopPropagation();
                  closeFile(name);
                }}
              />
            )}
          </Tab>
        ))}
      </Tabs>
      <LineNumbers
        className={styles.lineNumbers}
        lineCount={lineCount}
        scrollTop={scrollTop}
      />
      <div className={styles.code} ref={codeElementRef}>
        <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        {textAreaElementRef.current &&
          isSharedFileActive &&
          cursors.map((cursor) =>
            cursor.selection.end === cursor.selection.start ? (
              <Cursor
                color={cursor.color}
                key={cursor.clientID}
                offset={cursor.selection.start}
                parent={textAreaElementRef.current as HTMLTextAreaElement}
              />
            ) : (
              <Highlight
                code={code}
                color={cursor.color}
                endOffset={cursor.selection.end}
                parent={textAreaElementRef.current as HTMLTextAreaElement}
                startOffset={cursor.selection.start}
              />
            )
          )}
      </div>
      <textarea
        className={styles.textarea}
        onBlur={() => setActive(false)}
        onChange={handleChange}
        onDragEnd={() => setDisplayDragOverlay(false)}
        onDragEnter={() => {
          setDisplayDragOverlay(true);
          return false;
        }}
        onDragLeave={() => setDisplayDragOverlay(false)}
        onDragOver={() => false}
        onDrop={handleDrop as (event: DragEvent) => void}
        onMouseDown={disableAutoCompletion}
        onFocus={() => setActive(true)}
        onScroll={({ target }) =>
          setScrollTop((target as HTMLTextAreaElement).scrollTop)
        }
        onSelect={handleSelect}
        ref={textAreaElementRef}
        spellCheck={false}
        style={isSharedFileActive ? { caretColor: cursorColor } : undefined}
        value={code}
      />
      {displayDragOverlay && (
        <div className={styles.dragAndDropOverlay}>Drop to open</div>
      )}
    </div>
  );
};

interface Props {
  className?: string;
  code: string;
  onChange(code: string): void;
  onCursorPositionUpdate(cursorPosition: CursorPosition): void;
}
