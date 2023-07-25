import cn from 'classnames';
import { createPortal, type FC, useRef } from 'preact/compat';
import { type MenuDescriptor } from '@/platform/components/Menu/Menu';
import { useMenu } from '@/platform/components/Menu/useMenu';
import styles from './PopoverToolButton.module.scss';
import { ToolButton, type ToolButtonProps } from './ToolButton';

export interface PopoverToolButtonProps
  extends Omit<ToolButtonProps, 'onClick'> {
  menu: MenuDescriptor;
}

export const PopoverToolButton: FC<PopoverToolButtonProps> = ({
  className,
  menu,
  ...forwardedProps
}) => {
  const { isMenuDisplayed, menuDescriptor, menuElement, showMenu } = useMenu();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuPosition = menuDescriptor?.position;

  return (
    <>
      <ToolButton
        {...forwardedProps}
        className={cn(
          styles.popoverToolButton,
          { [styles.active]: isMenuDisplayed },
          className,
        )}
        onClick={() => {
          if (menu) {
            const { right: x, y } = buttonRef.current!.getBoundingClientRect();

            showMenu({
              ...menu,
              className: cn(styles.menu, menu.className),
              position: { x, y },
            });
          }
        }}
        type="button"
        {...forwardedProps}
        ref={buttonRef}
      />
      {!!menuPosition &&
        createPortal(
          <div
            className={styles.linkWithMenu}
            style={{
              left: menuPosition.x,
              top: menuPosition.y,
            }}
          />,
          document.body,
        )}
      {menuElement}
    </>
  );
};
