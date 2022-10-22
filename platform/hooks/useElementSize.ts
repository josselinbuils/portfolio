import type { RefObject } from 'react';
import { useLayoutEffect, useState } from 'react';

export function useElementSize(elementRef: RefObject<HTMLElement>): number[] {
  const [size, setSize] = useState([0, 0]);

  useLayoutEffect(() => {
    if (elementRef.current === null) {
      return;
    }
    const observer = new ResizeObserver(([{ contentRect }]) => {
      setSize([Math.round(contentRect.width), Math.round(contentRect.height)]);
    });
    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [elementRef]);

  return size;
}
