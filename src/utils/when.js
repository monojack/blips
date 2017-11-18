export function when (condition, transform) {
  return function (value) {
    return condition ? transform(value) : value
  }
}
