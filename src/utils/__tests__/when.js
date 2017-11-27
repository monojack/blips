import { when, } from '../when'
import { isNil, } from '../isNil'

const addNumber = y => x => x + y
const concatString = y => x => `${x}${y}`
const isNotNil = x => !isNil(x)

describe('when', () => {
  test('It returns the data argument if the condition is falsy', () => {
    expect(when(0, addNumber(2), 3)).toEqual(3)
    expect(when(false, concatString('bar'), 'foo')).toEqual('foo')
  })

  test('It applies the transformation to the data and returns it if the condition is truthy', () => {
    expect(when(1, addNumber(2), 3)).toEqual(5)
    expect(when(true, concatString('bar'), 'foo')).toEqual('foobar')
  })

  test('If the predicate is a function, it calls it with the data argument to resolve as the condition', () => {
    expect(when(x => typeof x === 'number', addNumber(2), '3')).toEqual('3')
    expect(when(x => typeof x === 'number', addNumber(2), 3)).toEqual(5)
    expect(when(isNotNil, concatString('bar'), 'foo')).toEqual('foobar')
    expect(when(isNotNil, concatString('bar'), null)).toBeNull()
  })

  test('If the transformation is not a function and the predicate/condition is true, it returns it instead', () => {
    expect(when(isNotNil, 'foobar', 'foo')).toEqual('foobar')
    expect(when(isNil, 'foobar', 'foo')).toEqual('foo')
  })
})
