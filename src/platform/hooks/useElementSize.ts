import { type RefObject, useLayoutEffect, useState } from 'preact/compat';

export function useElementSize(elementRef: RefObject<HTMLElement>): number[] {
  const [size, setSize] = useState([0, 0]);

  useLayoutEffect(() => {
    if (elementRef.current === null) {
      return;
    }
    const observer = new ResizeObserver(() => {
      const clientRect = elementRef.current?.getBoundingClientRect();

      if (clientRect !== undefined) {
        const { height, width } = clientRect;
        setSize([Math.round(width), Math.round(height)]);
      }
    });
    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [elementRef]);

  return size;
}
