/**
 * Debounces a function, ensuring that it is only called after a specified delay.
 *
 * @param fn - The function to debounce.
 * @param wait - The delay in milliseconds before the function is called.
 * @returns A new function that debounces the original function.
 */
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;

  return function (this: any, ...args: Parameters<T>): void {
    const context = this;

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn.apply(context, args);
    }, wait);
  };
}

/**
 * Similar to debounce, but instead of waiting a specified amount of time before triggering the
 * callback function, the calbback gets triggerd immediately and then we apply a delay after which
 * the callback can be called again. Basically, this allows us to press a button and get instant feedback,
 * but prevent rapid button presses from triggering the same event multiple times.
 *
 * @param fn - The function to debounce.
 * @param wait - The delay in milliseconds before the function is called after the initial immediate call.
 * @returns A new function that debounces the original function.
 */
function immediateDebounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  let canCall = true;

  return function (this: any, ...args: Parameters<T>): void {
    const context = this;

    if (canCall) {
      fn.apply(context, args);
      canCall = false;
    }

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      canCall = true;
    }, wait);
  };
}

export { debounce, immediateDebounce };
