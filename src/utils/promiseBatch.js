import { mergeResponseList, } from './mergeResponseList'

export function promiseBatch (promises) {
  return new Promise(resolve => {
    const mockedPromises = []
    for (const promise of promises) {
      mockedPromises.push(
        new Promise(resolve => {
          promise.then(res => resolve(res), err => resolve({ errors: [ err, ], }))
        })
      )
    }
    Promise.all(mockedPromises).then(res => {
      resolve(mergeResponseList(res))
    })
  })
}
