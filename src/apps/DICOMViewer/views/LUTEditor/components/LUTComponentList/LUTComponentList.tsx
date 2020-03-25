import { faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import {
  faLongArrowAltRight,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';
import { LUTComponent } from '~/apps/DICOMViewer/interfaces';
import { ColorPicker } from './ColorPicker';

import styles from './LUTComponentList.module.scss';

export const LUTComponentList: FC<Props> = ({
  lutComponents,
  onLUTComponentAdd,
  onLUTComponentColorChange,
  onLUTComponentDelete
}) => (
  <ul className={styles.container}>
    {lutComponents.map(({ color, id, end, start }) => (
      <li key={id}>
        <ColorPicker
          color={color}
          onColorChange={newColor => onLUTComponentColorChange(id, newColor)}
        />
        <span className={styles.colorWindow}>
          {formatNumber(start)} <FontAwesomeIcon icon={faLongArrowAltRight} />{' '}
          {formatNumber(end)}
        </span>
        <FontAwesomeIcon
          className={styles.trashIcon}
          icon={faTrashAlt}
          onClick={() => onLUTComponentDelete(id)}
        />
      </li>
    ))}
    <li>
      <FontAwesomeIcon
        className={styles.addIcon}
        icon={faPlusSquare}
        onClick={onLUTComponentAdd}
      />
    </li>
  </ul>
);

interface Props {
  lutComponents: LUTComponent[];
  onLUTComponentAdd(): void;
  onLUTComponentColorChange(componentId: string, color: number[]): void;
  onLUTComponentDelete(componentId: string): void;
}

function formatNumber(num: number): string {
  return `00${num}`.slice(-3);
}
