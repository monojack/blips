import { typeOf, } from '../typeOf'

describe('typeOf', () => {
  test('It returns the correct type', () => {
    expect(typeOf(null)).toEqual('Null')
    expect(typeOf()).toEqual('Undefined')
    expect(typeOf({})).toEqual('Object')
    expect(typeOf([])).toEqual('Array')
    expect(typeOf(false)).toEqual('Boolean')
    expect(typeOf(Symbol('foo'))).toEqual('Symbol')
    expect(typeOf(new Map())).toEqual('Map')
    expect(typeOf({})).toEqual('Object')
    expect(typeOf(1)).toEqual('Number')
    expect(typeOf('foo')).toEqual('String')
    expect(typeOf(new Error('message'))).toEqual('Error')
  })
})
