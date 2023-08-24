import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faAdjust } from '@fortawesome/free-solid-svg-icons/faAdjust';
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons/faArrowsAlt';
import { faArrowsAltV } from '@fortawesome/free-solid-svg-icons/faArrowsAltV';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons/faSyncAlt';
import cn from 'classnames';
import { type FC } from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { MouseButton } from '@/platform/constants';
import { type MouseTool } from '../../interfaces/MouseTool';
import { type Viewport } from '../../models/Viewport';
import styles from './LeftToolbar.module.scss';

const mouseTools: {
  condition?: (viewport: Viewport) => boolean;
  icon: IconDefinition;
  tool: MouseTool;
}[] = [
  {
    condition: (viewport: Viewport) =>
      viewport.dataset.frames.length > 1 && !viewport.is3D(),
    icon: faArrowsAltV,
    tool: 'Paging',
  },
  {
    condition: (viewport: Viewport) =>
      viewport.dataset.is3D && viewport.viewType !== 'Native',
    icon: faSyncAlt,
    tool: 'Rotate',
  },
  {
    condition: (viewport: Viewport) => !viewport.is3D(),
    icon: faAdjust,
    tool: 'Windowing',
  },
  {
    icon: faArrowsAlt,
    tool: 'Pan',
  },
  {
    icon: faSearch,
    tool: 'Zoom',
  },
];

export interface LeftToolbarProps {
  activeLeftTool: MouseTool;
  activeRightTool: MouseTool;
  viewport: Viewport;
  onToolSelected(tool: MouseTool, button: MouseButton): void;
}

export const LeftToolbar: FC<LeftToolbarProps> = ({
  activeLeftTool,
  activeRightTool,
  onToolSelected,
  viewport,
}) => (
  <div className={styles.toolbar}>
    {mouseTools.map(({ condition, icon, tool }) =>
      !condition || condition(viewport) ? (
        <button
          className={cn(styles.mouseTool, {
            [styles.activeLeft]: activeLeftTool === tool,
            [styles.activeRight]: activeRightTool === tool,
          })}
          key={tool}
          onClick={() => onToolSelected(tool, MouseButton.Left)}
          onContextMenu={(event) => {
            event.preventDefault();
            onToolSelected(tool, MouseButton.Right);
          }}
          type="button"
        >
          <FontAwesomeIcon icon={icon} />
        </button>
      ) : null,
    )}
  </div>
);
