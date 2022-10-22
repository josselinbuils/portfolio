import { FC, useMemo } from 'react';
import { Selection } from '~/apps/CodeEditor/interfaces/Selection';
import { getOffsetPosition } from '../../utils/getOffsetPosition';
import styles from './LineHighlight.module.scss';

interface Props {
  code: string;
  parent: HTMLTextAreaElement;
  selection: Selection;
}

export const LineHighlight: FC<Props> = ({ code, parent, selection }) => {
  const position = useMemo(
    () => getOffsetPosition(code, parent, selection[0]),
    [code, parent, selection]
  );
  return <div className={styles.lineHighlight} style={{ top: position.y }} />;
};
