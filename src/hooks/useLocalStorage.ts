import { useCallback, useEffect, useState } from "react";

function readValue<T>(key: string, initialValue: T) {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : initialValue;
  } catch {
    return initialValue;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [state, setState] = useState(() => ({ key, value: readValue(key, initialValue) }));

  // A different signed-in user gets their own persisted state, never the
  // previous user's cart or wishlist.
  if (state.key !== key) setState({ key, value: readValue(key, initialValue) });
  const value = state.key === key ? state.value : readValue(key, initialValue);
  const setValue = useCallback((update: React.SetStateAction<T>) => {
    setState((current) => ({
      key,
      value: typeof update === "function" ? (update as (previous: T) => T)(current.key === key ? current.value : readValue(key, initialValue)) : update,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // initialValue intentionally omitted — primitive default, won't change

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage unavailable (private browsing, quota) — fail silently
    }
  }, [key, value]);

  return [value, setValue] as const;
}
