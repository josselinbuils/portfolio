import { faPlusSquare } from '@fortawesome/free-regular-svg-icons/faPlusSquare';
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons/faLongArrowAltRight';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import { type FC } from 'preact/compat';
import { type LUTComponent } from '@/apps/DICOMViewer/interfaces/LUTComponent';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { ColorPicker } from './ColorPicker/ColorPicker';
import styles from './LUTComponentList.module.scss';

export interface LUTComponentListProps {
  lutComponents: LUTComponent[];
  onLUTComponentAdd(): void;
  onLUTComponentColorChange(componentId: string, color: number[]): void;
  onLUTComponentDelete(componentId: string): void;
}

export const LUTComponentList: FC<LUTComponentListProps> = ({
  lutComponents,
  onLUTComponentAdd,
  onLUTComponentColorChange,
  onLUTComponentDelete,
}) => (
  <ul className={styles.container}>
    {lutComponents.map(({ color, id, end, start }) => (
      <li key={id}>
        <ColorPicker
          color={color}
          onColorChange={(newColor) => onLUTComponentColorChange(id, newColor)}
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

function formatNumber(num: number): string {
  return `00${num}`.slice(-3);
}
