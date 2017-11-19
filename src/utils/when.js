export function when (condition, transform) {
  return function (value) {
    let bool = Boolean(condition)

    if (typeof condition === 'function') {
      bool = condition(value)
    }

    return bool ? transform(value) : value
  }
}
