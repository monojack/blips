export function isEmpty (value) {
  if (typeof value === 'string') return !value
  if (value && typeof value === 'object') return !Object.values(value).length
  return false
}
