import { FC, useMemo } from 'react';
import { Selection } from '~/apps/CodeEditor/interfaces/Selection';
import { getOffsetPosition } from '../../utils/getOffsetPosition';

import styles from './LineHighlight.module.scss';

interface Props {
  parent: HTMLTextAreaElement;
  selection: Selection;
}

export const LineHighlight: FC<Props> = ({ parent, selection }) => {
  const position = useMemo(
    () => getOffsetPosition(parent, selection[0]),
    [selection, parent]
  );
  return <div className={styles.lineHighlight} style={{ top: position.y }} />;
};
