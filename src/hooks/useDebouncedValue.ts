"use client";

import { useEffect, useState } from "react";

/** El valor, pero recién cuando deja de cambiar durante `delayMs` (búsquedas mientras se escribe). */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
