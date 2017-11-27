import { isNil, } from '../isNil'

describe('isNil', () => {
  test('It returns true for null or undefined', () => {
    expect(isNil(null)).toBeTruthy()
    expect(isNil()).toBeTruthy()
  })

  test('It returns false for anything other than null or undefined', () => {
    expect(isNil(true)).toBeFalsy()
    expect(isNil(false)).toBeFalsy()
    expect(isNil(1)).toBeFalsy()
    expect(isNil(0)).toBeFalsy()
    expect(isNil('')).toBeFalsy()
    expect(isNil('   ')).toBeFalsy()
    expect(isNil({})).toBeFalsy()
    expect(isNil([])).toBeFalsy()
    expect(isNil(Symbol('foo'))).toBeFalsy()
    expect(isNil(new Map())).toBeFalsy()
    expect(isNil(new Set())).toBeFalsy()
  })
})
