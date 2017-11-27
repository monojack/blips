import { isEmpty, } from './isEmpty'
import { isNil, } from './isNil'
import { isType, } from './isType'
import { when, } from './when'

export function mergeErrorList (errors) {
  const merged = errors.reduce((obj, err) => {
    if (isNil(err) || isEmpty(err)) return obj
    const operationName = err.path
      ? err.path[0]
      : isType('object', err) ? err.constructor.name : 'Errors'
    return {
      ...obj,
      [operationName]: [ ...(obj[operationName] || []), err, ],
    }
  }, {})

  return when(isEmpty, () => {}, merged)
}
