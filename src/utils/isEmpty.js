import { isType, } from './isType'

export function isEmpty (value) {
  if (typeof value === 'string') return !value
  if (isType('object', value)) return !Object.values(value).length
  if (isType('array', value)) return !value.length
  if (isType('Map', value)) return !value.size
  if (isType('Set', value)) return !value.size
  return false
}
