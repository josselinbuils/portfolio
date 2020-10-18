import React, { useState } from 'react';
import { useKeyMap } from '~/platform/hooks/useKeyMap';

export function useToolbar(): {
  toolbarProps: ToolbarProps;
  getToolProps(toolId: string): ToolProps;
} {
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [toolIds] = useState<string[]>([]);

  useKeyMap(
    {
      ArrowDown: () =>
        setActiveIndex(activeIndex < toolIds.length - 1 ? activeIndex + 1 : 0),
      ArrowUp: () =>
        setActiveIndex(activeIndex > 0 ? activeIndex - 1 : toolIds.length - 1),
    },
    focused
  );

  return {
    getToolProps: (toolId: string): ToolProps => {
      if (toolIds.includes(toolId)) {
        // New rendering of the toolbar component
        toolIds.length = 0;
      }
      toolIds.push(toolId);

      setTimeout(() => {
        if (activeIndex >= toolIds.length) {
          setActiveIndex(toolIds.length - 1);
        }
      }, 0);

      return {
        onMouseEnter: () => setActiveIndex(toolIds.indexOf(toolId)),
        toolbarButtonActive: focused && toolIds.indexOf(toolId) === activeIndex,
      };
    },
    toolbarProps: {
      // childrenArray[activeIndex] can be undefined if a child disappears
      'aria-activedescendant': focused ? toolIds?.[activeIndex] : undefined,
      onBlur: () => setFocused(false),
      onFocus: () => setFocused(true),
      role: 'toolbar',
      tabIndex: 0,
    },
  };
}

interface ToolProps {
  toolbarButtonActive: boolean;
  onMouseEnter(event: React.MouseEvent): void;
}

interface ToolbarProps {
  'aria-activedescendant': string | undefined;
  onBlur(): void;
  onFocus(): void;
  role: string;
  tabIndex: number;
}
