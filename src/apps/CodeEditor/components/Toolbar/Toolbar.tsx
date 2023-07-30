import cn from 'classnames';
import { Children, cloneElement, type FC, type JSX } from 'preact/compat';
import styles from './Toolbar.module.scss';

export interface ToolbarProps {
  children: JSX.Element | JSX.Element[];
  className?: string;
}

export const Toolbar: FC<ToolbarProps> = ({ children, className }) => (
  <div className={cn(styles.toolbar, className)}>
    {Children.map(children, (child: JSX.Element) =>
      cloneElement(child, {
        className: cn(child.props.className, styles.toolButton),
      }),
    )}
  </div>
);
