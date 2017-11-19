import { mergeResponseList, } from './mergeResponseList'

export function promiseBatch (promises) {
  return new Promise((resolve, reject) => {
    Promise.all(promises).then(
      res => resolve(mergeResponseList(res)),
      err => reject(err)
    )
  })
}
