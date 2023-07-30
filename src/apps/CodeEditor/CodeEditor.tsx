import { faCamera } from '@fortawesome/free-solid-svg-icons/faCamera';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons/faCircleInfo';
import { faFileCirclePlus } from '@fortawesome/free-solid-svg-icons/faFileCirclePlus';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons/faFolderOpen';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import cn from 'classnames';
import { useEffect, useRef, useState } from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { useMenu } from '@/platform/components/Menu/useMenu';
import { Window } from '@/platform/components/Window/Window';
import { type WindowComponent } from '@/platform/components/Window/WindowComponent';
import { useDragAndDrop } from '@/platform/hooks/useDragAndDrop';
import { useKeyMap } from '@/platform/hooks/useKeyMap';
import { useList } from '@/platform/hooks/useList';
import { useMemState } from '@/platform/hooks/useMemState';
import styles from './CodeEditor.module.scss';
import { Console } from './components/Console/Console';
import { Editor } from './components/Editor/Editor';
import { Shortcut } from './components/Shortcut/Shortcut';
import { StatusBar } from './components/StatusBar/StatusBar';
import { Tab } from './components/Tab/Tab';
import { Tabs } from './components/Tabs/Tabs';
import { PopoverToolButton } from './components/ToolButton/PopoverToolButton';
import { ToolButton } from './components/ToolButton/ToolButton';
import { Toolbar } from './components/Toolbar/Toolbar';
import { SUPPORTED_LANGUAGES } from './constants';
import { type EditorFile } from './interfaces/EditorFile';
import { type SupportedLanguage } from './interfaces/SupportedLanguage';
import { fileSaver } from './utils/fileSaver';
import { getExtensionFromLanguage } from './utils/getExtensionFromLanguage';
import { highlightCode } from './utils/highlightCode/highlightCode';
import { showShortcuts } from './utils/showShortcuts';

const CodeEditor: WindowComponent = ({
  active,
  windowRef,
  ...injectedWindowProps
}) => {
  const [files, fileManager] = useList<EditorFile>(fileSaver.loadFiles);
  const [activeFilename, previouslyActiveFilename, setActiveFilename] =
    useMemState<string>(files[0].name);
  const [code, setCode] = useState('');
  const [cursorPosition, setCursorPosition] = useState({
    offset: 0,
    x: 0,
    y: 0,
  });
  const [consoleHeight, setConsoleHeight] = useState('35%');
  const { showMenu, menuElement } = useMenu();
  const consoleElementRef = useRef<HTMLDivElement>(null);
  const resizeStartHandler = useDragAndDrop(onResizeStart);

  const activeFile = files.find(
    ({ name }) => name === activeFilename,
  ) as EditorFile;

  const newFileMenuItems = SUPPORTED_LANGUAGES.map(({ language, label }) => ({
    onClick: () => createFile(language),
    title: label,
  }));

  useEffect(() => {
    activeFile.content = code;
    fileSaver.saveFiles(files);
  }, [activeFile, code, files, activeFile.shared]);

  useKeyMap({
    'CtrlCmd+O': () => open(undefined),
    'CtrlCmd+P': openNewFileMenu,
  });

  function closeFile(name: string): void {
    const fileToClose = files.find((file) => file.name === name) as EditorFile;

    if (activeFile.name === name) {
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

  function createFile(language: SupportedLanguage): void {
    const maxIndex = Math.max(
      ...files.map((file) =>
        parseInt(
          file.name.startsWith('local') ? file.name.slice(5, -3) || '0' : '-1',
          10,
        ),
      ),
    );

    const name = `local${
      maxIndex > -1 ? maxIndex + 1 : ''
    }.${getExtensionFromLanguage(language)}`;

    fileManager.push({
      content: '',
      language,
      name,
      shared: false,
    });
    setActiveFilename(name);
  }

  async function downloadCodeSnippetAsPng(): Promise<void> {
    const { downloadAsPng } = await import(
      './utils/exportAsImage/exportAsImage'
    );
    await downloadAsPng(code, highlightCode(code, activeFile.language));
  }

  async function downloadCodeSnippetAsSvg(): Promise<void> {
    const { downloadAsSvg } = await import(
      './utils/exportAsImage/exportAsImage'
    );
    await downloadAsSvg(code, highlightCode(code, activeFile.language));
  }

  function onResizeStart(
    downEvent: PointerEvent,
  ): ((moveEvent: PointerEvent) => void) | void {
    if (consoleElementRef.current === null) {
      return;
    }

    const consoleStartHeightPx = consoleElementRef.current.clientHeight;
    const consoleStartHeightPercent = parseInt(consoleHeight, 10);
    const startY = downEvent.clientY;

    return (moveEvent: PointerEvent) => {
      const deltaHeight = (startY - moveEvent.clientY) / consoleStartHeightPx;
      const newHeightPercent = consoleStartHeightPercent * (1 + deltaHeight);
      const newHeightBounded = Math.min(Math.max(newHeightPercent, 0), 100);

      return setConsoleHeight(`${Math.round(newHeightBounded * 100) / 100}%`);
    };
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

  async function openCodeSnippetAsPng(): Promise<void> {
    const { openAsPng } = await import('./utils/exportAsImage/exportAsImage');
    await openAsPng(code, highlightCode(code, activeFile.language));
  }

  function openNewFileMenu(): void {
    const windowElement = windowRef.current?.windowRef.current;

    if (!windowElement) {
      return;
    }

    const { height, width, x, y } = windowElement.getBoundingClientRect();

    showMenu({
      className: cn(styles.menu, styles.newFileMenu), // TODO fix me
      items: newFileMenuItems,
      makeFirstItemActive: true,
      position: {
        x: Math.round(x + width / 2),
        y: Math.round(y + height / 3),
      },
    });
  }

  return (
    <Window
      active={active}
      className={styles.codeEditorWindow}
      minHeight={675}
      minWidth={900}
      ref={windowRef}
      title="CodeEditor"
      titleClassName={styles.codeEditorTitleBar}
      {...injectedWindowProps}
    >
      <div className={styles.codeEditor}>
        <div className={styles.editor}>
          <Toolbar className={styles.toolbar}>
            <PopoverToolButton
              icon={faFileCirclePlus}
              menu={{ items: newFileMenuItems }}
              title={
                <>
                  New&nbsp;
                  <Shortcut keys={['CtrlCmd', 'P']} />
                </>
              }
            />
            <ToolButton
              icon={faFolderOpen}
              onClick={() => open()}
              title={
                <>
                  Open&nbsp;
                  <Shortcut keys={['CtrlCmd', 'O']} />
                </>
              }
            />
            <PopoverToolButton
              disabled={code.length === 0}
              icon={faCamera}
              menu={{
                items: (
                  [
                    ['Open', openCodeSnippetAsPng],
                    ['Download as PNG', downloadCodeSnippetAsPng],
                    ['Download as SVG', downloadCodeSnippetAsSvg],
                  ] as const
                ).map(([title, onClick]) => ({ onClick, title })),
              }}
              title="Export as image"
            />
            <ToolButton
              icon={faCircleInfo}
              onClick={showShortcuts}
              title="Show shortcuts"
            />
          </Toolbar>
          <Tabs className={styles.tabs}>
            {files.map(({ name }, index) => (
              <Tab
                key={name}
                onClick={() => setActiveFilename(name)}
                selected={name === activeFile.name}
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
          <Editor
            activeFile={activeFile}
            className={styles.editor}
            code={code}
            onChange={setCode}
            onCursorPositionUpdate={setCursorPosition}
          />
        </div>
        <div className={styles.resizeBar} onPointerDown={resizeStartHandler} />
        <Console
          active={active}
          className={styles.console}
          codeToExec={code}
          height={consoleHeight}
          ref={consoleElementRef}
        >
          {!!activeFile.SideComponent && <activeFile.SideComponent />}
        </Console>
        <StatusBar
          className={styles.statusBar}
          cursorPosition={cursorPosition}
        />
      </div>
      {menuElement}
    </Window>
  );
};

export default CodeEditor;
