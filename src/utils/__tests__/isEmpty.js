import { isEmpty, } from '../isEmpty'

describe('isEmpty', () => {
  test('It returns true for empty array, object, map, set or strings', () => {
    expect(isEmpty([])).toBeTruthy()
    expect(isEmpty('')).toBeTruthy()
    expect(isEmpty({})).toBeTruthy()
    expect(isEmpty(new Map())).toBeTruthy()
    expect(isEmpty(new Set())).toBeTruthy()
  })

  test('It returns false for anything other than empty array, object, map, set or strings', () => {
    const map = new Map([ [ 'foo', 1, ], ])
    const set = new Set([ [ 'foo', 1, ], ])
    expect(isEmpty({ foo: 1, })).toBeFalsy()
    expect(isEmpty([ 1, 2, ])).toBeFalsy()
    expect(isEmpty('foo')).toBeFalsy()
    expect(isEmpty('     ')).toBeFalsy()
    expect(isEmpty(null)).toBeFalsy()
    expect(isEmpty()).toBeFalsy()
    expect(isEmpty(0)).toBeFalsy()
    expect(isEmpty(false)).toBeFalsy()
    expect(isEmpty(map)).toBeFalsy()
    expect(isEmpty(set)).toBeFalsy()
    expect(isEmpty(Symbol('foo'))).toBeFalsy()
    expect(isEmpty(Symbol(''))).toBeFalsy()
  })

  test('It returns false for Errors', () => {
    const err = new Error('Error message')
    expect(Object.values(err).length).toBe(0)
    expect(isEmpty(new Error('Error message'))).toBeFalsy()
  })
})
