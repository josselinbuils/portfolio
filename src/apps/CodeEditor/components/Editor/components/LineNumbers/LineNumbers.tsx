import cn from 'classnames';
import React, { FC, useLayoutEffect, useRef, useState } from 'react';

import styles from './LineNumbers.module.scss';

export const LineNumbers: FC<Props> = ({ className, lineCount, scrollTop }) => {
  const [lineNumbers, setLineNumbers] = useState('1');
  const lineNumbersElementRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let numbers = '1';

    for (let i = 2; i <= lineCount; i++) {
      numbers = `${numbers}\n${i}`;
    }
    setLineNumbers(numbers);
  }, [lineCount]);

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

interface Props {
  className?: string;
  lineCount: number;
  scrollTop: number;
}
