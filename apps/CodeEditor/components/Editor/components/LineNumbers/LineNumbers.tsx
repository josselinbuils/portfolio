import cn from 'classnames';
import { FC, ReactNode, useLayoutEffect, useMemo, useRef } from 'react';
import { Selection } from '~/apps/CodeEditor/interfaces/Selection';
import { getLineNumber } from '../../utils/getLineNumber';
import styles from './LineNumbers.module.scss';

interface Props {
  className?: string;
  code: string;
  lineCount: number;
  scrollTop: number;
  selection: Selection;
}

export const LineNumbers: FC<Props> = ({
  className,
  code,
  lineCount,
  scrollTop,
  selection,
}) => {
  const lineNumbers = useMemo(
    () => computeLineNumbers(lineCount, code, selection),
    [code, lineCount, selection]
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
  lineCount: number,
  code: string,
  selection: Selection
): ReactNode[] {
  const activeLine = getLineNumber(code, selection[0]) + 1;
  const numbers: ReactNode[] = [];

  for (let i = 1; i <= lineCount; i++) {
    numbers.push(
      i === activeLine ? (
        <span className={styles.activeLine} key={`${i}-current`}>
          {i}
        </span>
      ) : (
        <span key={i}>{i}</span>
      )
    );
  }
  return numbers;
}
