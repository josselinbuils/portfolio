import cn from 'classnames';
import {
  type FC,
  type JSX,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'preact/compat';
import { type Selection } from '@/apps/CodeEditor/interfaces/Selection';
import { getLineNumber } from '../../utils/getLineNumber';
import { getTextWidth } from '../../utils/getTextWidth';
import styles from './LineNumbers.module.scss';

interface Props {
  className?: string;
  code: string;
  editorWidth: number;
  scrollTop: number;
  selection: Selection;
}

export const LineNumbers: FC<Props> = ({
  className,
  code,
  editorWidth,
  scrollTop,
  selection,
}) => {
  const lineNumbers = useMemo(
    () => computeLineNumbers(code, selection, editorWidth),
    [code, editorWidth, selection],
  );
  const lineNumbersElementRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (lineNumbersElementRef.current !== null) {
      lineNumbersElementRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop]);

  return (
    <div
      className={cn(styles.lineNumbers, className)}
      ref={lineNumbersElementRef}
    >
      {lineNumbers}
    </div>
  );
};

function computeLineNumbers(
  code: string,
  selection: Selection,
  editorWidth: number,
): JSX.Element[] {
  const activeLine = getLineNumber(code, selection[0]) + 1;
  const lines = code.split('\n');
  const numbers: JSX.Element[] = [];

  for (let lineNumber = 1; lineNumber <= lines.length; lineNumber++) {
    const lineWidth = getTextWidth(
      lines[lineNumber - 1],
      `13px 'JetBrainsMono'`,
    );
    const lineHeight = editorWidth > 0 ? Math.ceil(lineWidth / editorWidth) : 1;

    numbers.push(
      lineNumber === activeLine ? (
        <span className={styles.activeLine} key={`${lineNumber}-current`}>
          {lineNumber}
        </span>
      ) : (
        <span key={lineNumber}>{lineNumber}</span>
      ),
      ...Array.from({ length: lineHeight - 1 }, (i) => (
        <span key={`${lineNumber}-empty-${i}`}> </span>
      )),
    );
  }
  return numbers;
}
