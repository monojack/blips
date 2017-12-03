import Observable from 'zen-observable'

export function toObservable (iterator) {
  return new Observable(observer => {
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
    return () => {
      observer.complete()
      iterator.return()
    }
  })
}
