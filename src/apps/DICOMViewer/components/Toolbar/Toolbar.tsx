import {
  faAdjust,
  faArrowsAlt,
  faArrowsAltV,
  faSearch,
  faSyncAlt
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import React, { FC } from 'react';
import { MouseButton } from '~/platform/constants';
import { MouseTool, ViewType } from '../../constants';
import { Viewport } from '../../models';
import styles from './Toolbar.module.scss';

const tools = [
  {
    condition: (viewport: Viewport) => viewport.dataset.frames.length > 1,
    icon: faArrowsAltV,
    tool: MouseTool.Paging
  },
  {
    condition: (viewport: Viewport) =>
      viewport.dataset.is3D && viewport.viewType !== ViewType.Native,
    icon: faSyncAlt,
    tool: MouseTool.Rotate
  },
  {
    icon: faAdjust,
    tool: MouseTool.Windowing
  },
  {
    icon: faArrowsAlt,
    tool: MouseTool.Pan
  },
  {
    icon: faSearch,
    tool: MouseTool.Zoom
  }
];

export const Toolbar: FC<Props> = ({
  activeLeftTool,
  activeRightTool,
  onToolSelected,
  viewport
}) => (
  <div className={styles.toolbar}>
    {tools.map(({ condition, icon, tool }) =>
      !condition || condition(viewport) ? (
        <button
          className={cn(styles.tool, {
            [styles.activeLeft]: activeLeftTool === tool,
            [styles.activeRight]: activeRightTool === tool
          })}
          key={tool}
          onClick={() => onToolSelected(tool, MouseButton.Left)}
          onContextMenu={event => {
            event.preventDefault();
            onToolSelected(tool, MouseButton.Right);
          }}
        >
          <FontAwesomeIcon icon={icon} />
        </button>
      ) : null
    )}
  </div>
);

interface Props {
  activeLeftTool: MouseTool;
  activeRightTool: MouseTool;
  viewport: Viewport;
  onToolSelected(tool: MouseTool, button: MouseButton): void;
}
