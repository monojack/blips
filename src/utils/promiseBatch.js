import { mergeDataList, } from './mergeDataList'
export function promiseBatch (promises) {
  return new Promise((resolve, reject) => {
    Promise.all(promises).then(
      res => resolve(mergeDataList(res)),
      err => reject(err)
    )
  })
}
