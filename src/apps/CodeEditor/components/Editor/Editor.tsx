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
import { useAutoCompletion, useHistory } from './hooks';
import { Completion } from './hooks/useAutoCompletion';
import { Change, Diff, EditorFile } from './interfaces';
import {
  autoEditChange,
  docExec,
  exportAsImage,
  fileSaver,
  formatCode,
  getDiff,
  getLineBeforeCursor,
  getLineIndent,
  highlightCode,
  isCodePortionEnd,
  isIntoAutoCloseGroup,
  isIntoBrackets,
  isOpenBracket,
  openFile,
  spliceString,
} from './utils';
import { canFormat } from './utils/formatCode';

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
    active: autoCompleteActive,
    code,
    cursorOffset,
    lineIndent: getLineIndent(code, cursorOffset),
    menuClassName: styles.autoCompletionMenu,
    onCompletion: applyAutoCompletion,
    textAreaElement: textAreaElementRef.current as HTMLTextAreaElement,
  });
  const { pushHistory } = useHistory({ redo, undo });
  const activeFile = files.find(
    ({ name }) => name === activeFileName
  ) as EditorFile;

  const applyChange = useCallback(
    (change: Partial<Change>): void => {
      const { cursorOffsetAfter, diffObj, newCode } = change;

      if (newCode !== undefined) {
        onChange(newCode);
      }
      if (cursorOffsetAfter !== undefined) {
        setCursorOffset(cursorOffsetAfter);
      }
      if (diffObj !== undefined) {
        pushHistory({ ...diffObj, cursorOffsetAfter });
      }
    },
    [onChange, pushHistory]
  );

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
      'Control+N,Meta+N': createFile,
      'Control+O,Meta+O': () => {
        open();
      },
      'Control+S,Meta+S': () => {
        format();
      },
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
          insertText(
            `\n${indentSpaces}${additionalSpaces}\n${indentSpaces}`,
            cursorOffset + indent + 3
          );
        } else {
          insertText(`\n${indentSpaces}${additionalSpaces}`);
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
          insertText(INDENT);
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
    applyChange({
      newCode: activeFile.content,
      cursorOffsetAfter: 0,
    });
  }, [activeFile, applyChange]);

  useLayoutEffect(() => {
    highlightCode(code, activeFile.language).then((highlighted) => {
      setHighlightedCode(highlighted);
      ((textAreaElementRef.current as unknown) as HTMLTextAreaElement).scrollTop = 1e10;
    });
  }, [activeFile.language, code]);

  useLayoutEffect(() => {
    const newLineCount = (code.match(/\n/g)?.length || 0) + 1;

    if (newLineCount !== lineCount) {
      setLineCount(newLineCount);
    }
  }, [code, lineCount]);

  useLayoutEffect(() => {
    const textAreaElement = textAreaElementRef.current;

    if (textAreaElement !== null) {
      const { selectionStart } = textAreaElement;

      if (!isThereSelection() && selectionStart !== cursorOffset) {
        textAreaElement.selectionStart = cursorOffset;
        textAreaElement.selectionEnd = cursorOffset;
      }
    }
  }, [code, cursorOffset]);

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
    fileManager.push({ content: '', name, language: 'javascript' });
    setActiveFileName(name);
  }

  function disableAutoCompletion(): void {
    if (autoCompleteActive) {
      setAutoCompleteActive(false);
    }
  }

  async function format(): Promise<void> {
    try {
      const { language } = activeFile;
      const formatted = await formatCode(code, cursorOffset, language);

      if (formatted.code !== code) {
        pushHistory([
          getDiff(code, ''),
          {
            ...getDiff('', formatted.code),
            cursorOffsetAfter: formatted.cursorOffset,
          },
        ]);
        onChange(formatted.code);
        setCursorOffset(formatted.cursorOffset);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function insertText(
    text: string,
    newCursorOffset?: number,
    offset: number = cursorOffset,
    baseCode: string = code
  ): void {
    const newCode = spliceString(baseCode, offset, 0, text);

    applyChange({
      newCode,
      diffObj: getDiff(baseCode, newCode),
      cursorOffsetAfter: newCursorOffset || offset + text.length,
    });
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    const newCode = event.target.value;
    const diffObj = getDiff(code, newCode);
    let change: Change | undefined = {
      cursorOffsetAfter: diffObj.endOffset,
      diffObj,
      newCode,
    };

    if (diffObj.type === '+') {
      const allowAutoComplete = isCodePortionEnd(code, cursorOffset);

      if (allowAutoComplete && !autoCompleteActive) {
        setAutoCompleteActive(true);
      }
      change = autoEditChange(code, cursorOffset, change);
    } else {
      disableAutoCompletion();
    }

    if (change !== undefined) {
      applyChange(change);
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

    if (cursorOffset !== newCursorOffset) {
      setCursorOffset(newCursorOffset);
    }
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

  function redo(diffObj: Diff): void {
    const { cursorOffsetAfter, endOffset, diff, startOffset, type } = diffObj;

    applyChange({
      newCode:
        type === '+'
          ? spliceString(code, startOffset, 0, diff)
          : spliceString(code, endOffset, diff.length),
      cursorOffsetAfter: cursorOffsetAfter || endOffset,
    });
  }

  function undo(diffObj: Diff, cursorOffsetBefore?: number): void {
    const { endOffset, diff, startOffset, type } = diffObj;

    applyChange({
      newCode:
        type === '+'
          ? spliceString(code, startOffset, diff.length)
          : spliceString(code, endOffset, 0, diff),
      cursorOffsetAfter: cursorOffsetBefore || startOffset,
    });
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
          disabled={code.length === 0 || !canFormat(activeFile.language)}
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
