import { useLayoutEffect, useState } from 'react';
import { MOBILE_BREAKPOINT_PX } from '../constants';

export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState(isMobileScreen());

  useLayoutEffect(() => {
    function resizeListener(): void {
      const newIsMobile = isMobileScreen();

      if (isMobile !== newIsMobile) {
        setIsMobile(newIsMobile);
      }
    }

    window.addEventListener('resize', resizeListener);

    return () => window.removeEventListener('resize', resizeListener);
  }, [isMobile]);

  return isMobile;
}

function isMobileScreen(): boolean {
  return window.innerWidth <= MOBILE_BREAKPOINT_PX;
}
