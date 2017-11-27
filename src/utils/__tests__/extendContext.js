/* eslint-disable no-console */
import {
  extendContext,
  buildPropExistsWarning,
  STORE_EXTEND_WARNING,
} from '../extendContext'

/**
 * Merges two context objects
 * @param  {Object} defaultContext Object to be extended
 * @param  {Object} context        Object to be merged with the defaultContext
 * @return {Object}                Extended context
 */

const defaultContext = {
  store: {
    a: {},
    b: {},
  },
}

describe('extendContext', () => {
  test('It returns the defaultContext if no context object provided', () => {
    expect(extendContext(defaultContext)).toEqual(defaultContext)
    expect(extendContext(defaultContext, null)).toEqual(defaultContext)
  })

  test('It returns the defaultContext if the context is not an object', () => {
    expect(extendContext(defaultContext, 'foo')).toEqual(defaultContext)
    expect(extendContext(defaultContext, 1)).toEqual(defaultContext)
    expect(extendContext(defaultContext, false)).toEqual(defaultContext)
  })

  test('It returns the defaultContext if the context is an array', () => {
    expect(extendContext(defaultContext, [])).toEqual(defaultContext)
    expect(extendContext(defaultContext, [ 1, 2, ])).toEqual(defaultContext)
  })

  test('It returns the defaultContext if the context is a Map', () => {
    const context = new Map([ [ 'c', {}, ], [ 'd', {}, ], ])
    expect(extendContext(defaultContext, context)).toEqual(defaultContext)
  })

  test('It returns the defaultContext if trying to extend only the `store` prop and logs a warning', () => {
    const context = { store: {}, }
    const warnMock = jest.fn()
    console.warn = warnMock

    expect(extendContext(defaultContext, context)).toEqual(defaultContext)
    expect(warnMock).toHaveBeenCalledTimes(1)
    expect(warnMock).toHaveBeenCalledWith(STORE_EXTEND_WARNING)
  })

  test('It extends the defaultContext but logs a warning if trying to replace an existing prop, other than `store`', () => {
    const defaultC = {
      ...defaultContext,
      user: {
        firstName: 'John',
      },
    }

    const expected = {
      ...defaultC,
      user: {
        firstName: 'Marc',
      },
    }

    const context = { user: { firstName: 'Marc', }, }
    const warnMock = jest.fn()
    console.warn = warnMock

    expect(extendContext(defaultC, context)).toEqual(expected)
    expect(warnMock).toHaveBeenCalledTimes(1)
    expect(warnMock).toHaveBeenCalledWith(buildPropExistsWarning('user'))
  })

  test('It extends the defaultContext correctly', () => {
    const context = {
      user: {
        lastName: 'Doe',
      },
      foo: 'foo',
      bar: {},
    }

    const expected = {
      store: {
        a: {},
        b: {},
      },
      user: {
        lastName: 'Doe',
      },
      foo: 'foo',
      bar: {},
    }
    expect(extendContext(defaultContext, context)).toEqual(expected)
  })
})
