import { Observable, } from 'rxjs/Observable'

export function toObservable (iterator) {
  return Observable.create(observer => {
    ;(async () => {
      try {
        for await (const tick of iterator) {
          observer.next(tick)
        }
      } catch (e) {
        iterator.return()
        observer.error(e)
      }
    })()
    return iterator.return
  })
}
