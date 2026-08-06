// src/input/debounce.ts
/**
 * Generic debounce utility.
 * Returns a debounced version of the provided function that delays invoking
 * until after `wait` milliseconds have elapsed since the last time the debounced function was invoked.
 * The debounced function retains the same `this` context and arguments.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounced = function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(this, args);
    }, wait);
  } as unknown as ((...args: Parameters<T>) => void) & { cancel: () => void };
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  return debounced;
}

