import { useEffect, useRef } from 'react';

export function useGameLoop(callback: (dt: number) => void) {
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000;
      const limitedDt = Math.min(deltaTime, 0.1); 
      savedCallback.current(limitedDt);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);
}
