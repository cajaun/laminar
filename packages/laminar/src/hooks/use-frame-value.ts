import { useRef } from "react";

type FrameValue<T> = {
  readonly value: T;
  readonly isBursting: boolean;
};

const BURST_INTERVAL_MS = 50;

export const useFrameValue = <T>(value: T): FrameValue<T> => {
  const previousValueRef = useRef(value);
  const lastInputAtRef = useRef(0);
  const rapidInputCountRef = useRef(0);

  if (value !== previousValueRef.current) {
    const now = performance.now();
    const interval = now - lastInputAtRef.current;
    lastInputAtRef.current = now;
    previousValueRef.current = value;
    rapidInputCountRef.current =
      interval > 0 && interval < BURST_INTERVAL_MS
        ? rapidInputCountRef.current + 1
        : 0;
  }

  return {
    value,
    isBursting: rapidInputCountRef.current >= 2,
  };
};
