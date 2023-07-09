import { useEventListener } from '@josselinbuils/hooks/useEventListener';
import { useKeyMap } from '@josselinbuils/hooks/useKeyMap';
import type { RefObject } from 'react';
import { createRef, useEffect, useRef, useState } from 'react';

export function useToolbar(
  orientation: 'horizontal' | 'vertical' = 'horizontal',
): {
  toolbarProps: ToolbarProps;
  getToolProps<T extends HTMLElement>(toolId: string): ToolProps<T>;
  isToolActive(toolId: string): boolean;
} {
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [toolIds] = useState<string[]>([]);
  const [toolRefs] = useState<{ [id: string]: RefObject<HTMLElement> }>({});
  const isKeyboardFocusRef = useRef(false);
  const isHorizontal = orientation === 'horizontal';

  toolIds.length = 0;

  useEffect(() => {
    toolRefs[toolIds[activeIndex]]?.current?.focus();
  }, [activeIndex, toolIds, toolRefs]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeIndex >= toolIds.length) {
      setActiveIndex(toolIds.length - 1);
    }
  });

  useKeyMap(
    {
      [isHorizontal ? 'ArrowLeft' : 'ArrowUp']: () =>
        setActiveIndex(activeIndex > 0 ? activeIndex - 1 : toolIds.length - 1),
      [isHorizontal ? 'ArrowRight' : 'ArrowDown']: () =>
        setActiveIndex(activeIndex < toolIds.length - 1 ? activeIndex + 1 : 0),
    },
    focused,
  );

  useEventListener('mousedown', () => {
    isKeyboardFocusRef.current = false;

    if (focused) {
      setFocused(false);
    }
  });

  useEventListener('keydown', () => {
    isKeyboardFocusRef.current = true;
  });

  function addToolId(toolId: string): void {
    if (toolRefs[toolId] === undefined) {
      toolRefs[toolId] = createRef();
    }
    if (!toolIds.includes(toolId)) {
      toolIds.push(toolId);
    }
  }

  return {
    getToolProps: <T extends HTMLElement>(toolId: string): ToolProps<T> => {
      addToolId(toolId);

      return {
        ref: toolRefs[toolId] as RefObject<T>,
        tabIndex: toolIds.indexOf(toolId) === activeIndex ? 0 : -1,
      };
    },
    isToolActive: (toolId: string): boolean => {
      addToolId(toolId);
      return focused && toolIds.indexOf(toolId) === activeIndex;
    },
    toolbarProps: {
      className: focused ? 'keyboardFocused' : undefined,
      onBlur: () => {
        if (focused) {
          setFocused(false);
        }
      },
      onFocus: () => {
        if (isKeyboardFocusRef.current) {
          setFocused(true);
        }
      },
      role: 'toolbar',
    },
  };
}

interface ToolProps<T extends HTMLElement> {
  ref: RefObject<T>;
  tabIndex: number;
}

interface ToolbarProps {
  className: string | undefined;
  role: string;
  onBlur(): void;
  onFocus(): void;
}
