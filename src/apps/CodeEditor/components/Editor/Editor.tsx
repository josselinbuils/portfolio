import { faCamera } from '@fortawesome/free-solid-svg-icons/faCamera';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons/faFolderOpen';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faStream } from '@fortawesome/free-solid-svg-icons/faStream';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import React, {
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
import { useKeyMap, useList, useMemState } from '~/platform/hooks';
import { Toolbar, ToolButton } from '../../components';
import { LineNumbers, Tab, Tabs } from './components';
import { INDENT } from './constants';
import { EditorFile } from './EditorFile';
import { useAutoCompletion } from './hooks';
import {
  docExec,
  exportAsImage,
  fileSaver,
  formatCode,
  getAutoCloseChar,
  getLineBeforeCursor,
  getLineIndent,
  highlightCode,
  isAutoCloseChar,
  isCodePortionEnd,
  isIntoAutoCloseGroup,
  isIntoBrackets,
  isOpenBracket,
  openFile,
} from './utils';

import styles from './Editor.module.scss';

export const Editor: FC<Props> = ({ className, code, onChange }) => {
  const [active, setActive] = useState(false);
  const [autoCompleteActive, setAutoCompleteActive] = useState(false);
  const [cursorOffset, setCursorOffset] = useState(0);
  const [displayDragOverlay, setDisplayDragOverlay] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState('');
  const [files, fileManager] = useList<EditorFile>(fileSaver.loadFiles);
  const [
    activeFileName,
    previouslyActiveFileName,
    setActiveFileName,
  ] = useMemState<string>(files[0].name);
  const [lineCount, setLineCount] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);
  const codeElementRef = useRef<HTMLDivElement>(null);
  const textAreaElementRef = useRef<HTMLTextAreaElement>(null);
  const { complete, hasCompletionItems } = useAutoCompletion({
    cursorOffset,
    lineIndent: getLineIndent(code, cursorOffset),
    menuClassName: styles.autoCompletionMenu,
    onCompletion: useCallback(({ completion, newCursorOffset }) => {
      docExec.insertText(completion);
      setCursorOffset(newCursorOffset);
    }, []),
    partialKeyword: autoCompleteActive
      ? (getLineBeforeCursor(code, cursorOffset)
          .split(/[ ([{]/)
          .pop() as string)
      : '',
    textAreaElement: textAreaElementRef.current,
  });
  const activeFile = files.find(
    ({ name }) => name === activeFileName
  ) as EditorFile;

  useKeyMap(
    {
      Backspace: () => {
        if (isThereSelection()) {
          return false;
        }

        if (isIntoAutoCloseGroup(code, cursorOffset)) {
          deleteRange(cursorOffset - 1, cursorOffset + 1);
        } else {
          const lineBeforeCursor = getLineBeforeCursor(code, cursorOffset);

          if (/^ +$/.test(lineBeforeCursor)) {
            deleteRange(
              cursorOffset - lineBeforeCursor.length - 1,
              cursorOffset
            );
          } else {
            return false;
          }
        }
      },
      'Control+N': createFile,
      'Control+S,Meta+S': format,
      Enter: () => {
        if (hasCompletionItems) {
          return;
        }
        const indent = getLineIndent(code, cursorOffset);
        const indentSpaces = ' '.repeat(indent);
        const additionalSpaces =
          isOpenBracket(code[cursorOffset - 1]) ||
          code[cursorOffset - 1] === ':'
            ? INDENT
            : '';

        if (isIntoBrackets(code, cursorOffset)) {
          docExec.insertText(
            `\n${indentSpaces}${additionalSpaces}\n${indentSpaces}`
          );
          setCursorOffset(cursorOffset + indent + 3);
        } else {
          docExec.insertText(`\n${indentSpaces}${additionalSpaces}`);
        }
      },
      Escape: () => {
        if (autoCompleteActive) {
          setAutoCompleteActive(false);
        }
      },
      'Shift+Tab': () => {
        if (code.slice(cursorOffset - INDENT.length, cursorOffset) === INDENT) {
          deleteRange(cursorOffset - INDENT.length, cursorOffset);
        }
      },
      Tab: () => {
        if (hasCompletionItems) {
          complete();
        } else {
          docExec.insertText(INDENT);
        }
      },
    },
    active
  );

  useEffect(() => {
    activeFile.content = code;
    fileSaver.saveFiles(files);
  }, [activeFile, files, code]);

  useLayoutEffect(() => {
    onChange(activeFile.content);
  }, [activeFile, onChange]);

  useLayoutEffect(() => {
    setHighlightedCode(highlightCode(code));
    setLineCount((code.match(/\n/g)?.length || 0) + 1);
    (textAreaElementRef.current as HTMLTextAreaElement).scrollTop = 1e10;
  }, [code]);

  useLayoutEffect(() => {
    const textAreaElement = textAreaElementRef.current;

    if (textAreaElement !== null) {
      const { selectionEnd, selectionStart } = textAreaElement;

      if (selectionEnd === selectionStart && selectionStart !== cursorOffset) {
        textAreaElement.selectionStart = cursorOffset;
        textAreaElement.selectionEnd = cursorOffset;
      }
    }
  }, [cursorOffset]);

  useLayoutEffect(() => {
    if (codeElementRef.current !== null) {
      codeElementRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop]);

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
      ...files.map((file) => parseInt(file.name.slice(5, -3) || '0', 10))
    );
    const name = `local${maxIndex + 1}.js`;
    setActiveFileName(name);
    fileManager.push({ name, content: '' });
  }

  function disableAutoCompletion(): void {
    if (autoCompleteActive) {
      setAutoCompleteActive(false);
    }
  }

  function format(): void {
    try {
      const formatted = formatCode(code, cursorOffset);
      onChange(formatted.code);
      setCursorOffset(formatted.cursorOffset);
    } catch (error) {
      console.error(error);
    }
  }

  function handleChange(event: ChangeEvent): void {
    const { value } = event.target as HTMLTextAreaElement;

    onChange(value);

    if (value.length > code.length) {
      const diff = value
        .replace(code.slice(0, cursorOffset), '')
        .replace(code.slice(cursorOffset), '');
      const autoCloseChar = getAutoCloseChar(diff);
      const allowAutoComplete = isCodePortionEnd(code, cursorOffset);

      if (autoCloseChar !== undefined && allowAutoComplete) {
        docExec.insertText(autoCloseChar);
        setCursorOffset(cursorOffset + 1);
      } else if (
        isIntoAutoCloseGroup(code, cursorOffset) &&
        isAutoCloseChar(diff)
      ) {
        docExec.forwardDelete();
      }

      if (allowAutoComplete && !autoCompleteActive) {
        setAutoCompleteActive(true);
      }
    } else {
      disableAutoCompletion();
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
    const newCursorOffset = (target as HTMLTextAreaElement).selectionStart;

    if (!isCodePortionEnd(code, newCursorOffset)) {
      setAutoCompleteActive(false);
    }
    setCursorOffset(newCursorOffset);
  }

  function deleteRange(start: number, end: number): void {
    if (textAreaElementRef.current !== null) {
      textAreaElementRef.current.setSelectionRange(start, end);
      docExec.delete();
    }
  }

  function isThereSelection(): boolean {
    if (textAreaElementRef.current !== null) {
      const { selectionEnd, selectionStart } = textAreaElementRef.current;
      return selectionEnd !== selectionStart;
    }
    return false;
  }

  async function open(file?: File): Promise<void> {
    try {
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

  return (
    <div className={cn(styles.editor, className)}>
      <Tabs className={styles.tabs} label="Files">
        {files.map(({ name }, index) => (
          <Tab
            key={name}
            onClick={() => setActiveFileName(name)}
            selected={name === activeFileName}
          >
            {name}
            {index > 0 && (
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
      <div
        className={styles.code}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
        ref={codeElementRef}
      />
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
        value={code}
      />
      {displayDragOverlay && (
        <div className={styles.dragAndDropOverlay}>Drop to open</div>
      )}
      <Toolbar className={styles.toolbar}>
        <ToolButton
          icon={faPlus}
          onClick={createFile}
          title={
            <>
              New<kbd>Ctrl</kbd>+<kbd>N</kbd>
            </>
          }
        />
        <ToolButton
          icon={faFolderOpen}
          // tslint:disable-next-line:no-unnecessary-callback-wrapper
          onClick={() => open()}
          title={
            <>
              Open<kbd>Ctrl</kbd>+<kbd>O</kbd>
            </>
          }
        />
        <ToolButton
          disabled={code.length === 0}
          icon={faStream}
          onClick={format}
          title={
            <>
              Format<kbd>Ctrl</kbd>+<kbd>S</kbd>
            </>
          }
        />
        <ToolButton
          disabled={code.length === 0}
          icon={faCamera}
          onClick={() => exportAsImage(code, highlightedCode)}
          title="Export as image"
        />
      </Toolbar>
    </div>
  );
};

interface Props {
  className?: string;
  code: string;
  onChange(code: string): void;
}
