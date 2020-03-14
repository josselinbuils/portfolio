import { useEffect, useState } from 'react';

export function useAnimation(): [number | undefined, (delay: number) => void] {
  const [duration, setDuration] = useState<number>();

  useEffect(() => {
    if (duration !== undefined) {
      const timeout = setTimeout(() => setDuration(undefined), duration);
      return () => clearTimeout(timeout);
    }
  }, [duration]);

  return [duration, setDuration];
}
