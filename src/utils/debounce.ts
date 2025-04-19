export function debounce<T>(
  func: (arg: T) => void,
  wait: number
): (arg: T) => void {
  let timeout: NodeJS.Timeout | undefined;

  return (arg: T) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(arg);
    }, wait);
  };
}
