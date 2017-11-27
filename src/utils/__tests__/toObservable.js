import { toObservable, } from '../toObservable'
import { PubSub, } from 'graphql-subscriptions'

describe('toObservable', () => {
  const newTick = () =>
    new Promise(resolve => {
      pubsub.publish('TICK', 'foo')
      process.nextTick(resolve)
    })

  let pubsub
  let asyncIterator

  beforeEach(() => {
    pubsub = new PubSub()
    asyncIterator = pubsub.asyncIterator('TICK')
  })

  afterEach(() => {
    asyncIterator.return()
  })

  test('It returns an observable', () => {
    const obs = toObservable()
    expect(obs.constructor.name).toBe('Observable')
  })

  test('When creating an observable from an async iterator, it emits with every yield', async () => {
    expect.assertions(2)

    const callback = jest.fn()
    const obs = toObservable(asyncIterator)
    obs.subscribe(callback)

    await newTick()
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('foo')
  })

  test('It will remove the listener on .unsubscribe()', async () => {
    expect.assertions(3)

    const callback = jest.fn()
    const obs = toObservable(asyncIterator)
    const sub = obs.subscribe(callback)

    await newTick()
    expect(callback).toHaveBeenCalledTimes(1)

    sub.unsubscribe()
    await newTick()

    expect(await asyncIterator.next()).toEqual({ value: undefined, done: true, })
    expect(callback).toHaveBeenCalledTimes(1)
  })
})
