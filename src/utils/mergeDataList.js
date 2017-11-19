import { isEmpty, } from './isEmpty'
import { when, } from './when'

export function mergeDataList (list) {
  const merged = list.reduce((obj, data) => {
    return {
      ...obj,
      ...data,
    }
  }, {})

  return when(isEmpty, () => {})(merged)
}
