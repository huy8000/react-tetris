export function cn(...args) {
  const classes = [];
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === 'string') classes.push(arg);
    else if (Array.isArray(arg)) classes.push(cn(...arg));
    else if (typeof arg === 'object') {
      for (const [k, v] of Object.entries(arg)) {
        if (v) classes.push(k);
      }
    }
  }
  return classes.join(' ');
}
