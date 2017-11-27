export function when (condition, transform, data) {
  let bool = Boolean(condition)

  if (typeof condition === 'function') {
    bool = Boolean(condition(data))
  }

  return bool
    ? typeof transform === 'function' ? transform(data) : transform
    : data
}
