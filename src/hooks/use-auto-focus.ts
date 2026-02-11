import { useEffect, useRef } from "react";

export function useAutoFocus<T extends HTMLElement>(open: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => ref.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);
  return ref;
}
