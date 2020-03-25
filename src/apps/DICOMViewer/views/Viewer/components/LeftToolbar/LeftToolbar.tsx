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
import { MouseTool, ViewType } from '~/apps/DICOMViewer/constants';
import { Viewport } from '~/apps/DICOMViewer/models';
import { MouseButton } from '~/platform/constants';

import styles from './LeftToolbar.module.scss';

const mouseTools = [
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

export const LeftToolbar: FC<Props> = ({
  activeLeftTool,
  activeRightTool,
  onToolSelected,
  viewport
}) => (
  <div className={styles.toolbar}>
    {mouseTools.map(({ condition, icon, tool }) =>
      !condition || condition(viewport) ? (
        <button
          className={cn(styles.mouseTool, {
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
