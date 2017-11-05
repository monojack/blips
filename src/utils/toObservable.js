import { Observable, } from 'rxjs'

export const toObservable = iterator => {
  return Observable.create(async observer => {
    const stop = iterator.return
    try {
      for await (const tick of iterator) {
        observer.next(tick)
      }
    } catch (e) {
      observer.error(e)
    }
    return stop
  })
}
