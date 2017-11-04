import { Observable, } from 'rxjs'

export const toObservable = iterator => {
  return Observable.create(observer => {
    const stop = iterator.return
    ;(async () => {
      try {
        for await (const tick of iterator) {
          observer.next(tick)
        }
      } catch (tick) {
        observer.throw(tick)
      }
    })()
    return stop
  })
}
