import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faAdjust } from '@fortawesome/free-solid-svg-icons/faAdjust';
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons/faArrowsAlt';
import { faArrowsUpDown } from '@fortawesome/free-solid-svg-icons/faArrowsUpDown';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons/faSyncAlt';
import cn from 'classnames';
import { type FunctionComponent } from 'preact';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { MouseButton } from '@/platform/constants';

import { type MouseTool } from '../../interfaces/MouseTool';
import { type Viewport } from '../../models/Viewport';
import classes from './LeftToolbar.module.css';

const mouseTools: {
  condition?: (viewport: Viewport) => boolean;
  icon: IconDefinition;
  tool: MouseTool;
}[] = [
  {
    condition: (viewport: Viewport) =>
      viewport.dataset.frames.length > 1 && !viewport.is3D(),
    icon: faArrowsUpDown,
    tool: 'paging',
  },
  {
    condition: (viewport: Viewport) =>
      viewport.dataset.is3D && viewport.viewType !== 'native',
    icon: faSyncAlt,
    tool: 'rotate',
  },
  {
    condition: (viewport: Viewport) => !viewport.is3D(),
    icon: faAdjust,
    tool: 'windowing',
  },
  {
    icon: faArrowsAlt,
    tool: 'pan',
  },
  {
    icon: faSearch,
    tool: 'zoom',
  },
];

export type LeftToolbarProps = {
  activeLeftTool: MouseTool;
  activeRightTool: MouseTool;
  onToolSelected(tool: MouseTool, button: MouseButton): void;
  viewport: Viewport;
};

export const LeftToolbar: FunctionComponent<LeftToolbarProps> = ({
  activeLeftTool,
  activeRightTool,
  onToolSelected,
  viewport,
}) => (
  <div className={classes.toolbar}>
    {mouseTools.map(({ condition, icon, tool }) =>
      !condition || condition(viewport) ? (
        <button
          className={cn(classes.mouseTool, {
            [classes.activeLeft]: activeLeftTool === tool,
            [classes.activeRight]: activeRightTool === tool,
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
