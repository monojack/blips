import { typeOf, } from './typeOf'

export function isType (type, value) {
  if (value === null) return type.toLowerCase() === 'null'
  if (typeof value === 'undefined') return type.toLowerCase() === 'undefined'

  return type.toLowerCase() === typeOf(value).toLowerCase()
}
