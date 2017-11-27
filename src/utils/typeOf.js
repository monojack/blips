export function typeOf (value) {
  return Object.prototype.toString.call(value).slice(8, -1)
}
