import { isEmpty, } from './isEmpty'
import { isNil, } from './isNil'
import { isType, } from './isType'
import { when, } from './when'

export function mergeDataList (list) {
  const merged = list.reduce((obj, data) => {
    return isType('object', data) && !isNil(data)
      ? {
        ...obj,
        ...data,
      }
      : obj
  }, {})

  return when(isEmpty, () => {}, merged)
}
