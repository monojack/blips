import { isEmpty, } from './isEmpty'
import { when, } from './when'

export function mergeErrorList (errors) {
  const merged = errors.reduce((obj, err) => {
    const operationName = err.path ? err.path[0] : err.constructor.name
    return {
      ...obj,
      [operationName]: [ ...(obj[operationName] || []), err, ],
    }
  }, {})

  return when(isEmpty, () => {})(merged)
}
