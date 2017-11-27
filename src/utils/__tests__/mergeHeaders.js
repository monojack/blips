import { mergeHeaders, } from '../mergeHeaders'

const headersA = {
  'content-type': 'application/json',
}

const headersB = {
  'Accept-Charset': 'utf-8',
}

const headersC = {
  'Cache-Control': 'no-cache',
}

const headersD = {
  'content-type': 'text.html',
}

const expected = {
  'content-type': 'application/json',
  'Accept-Charset': 'utf-8',
  'Cache-Control': 'no-cache',
}

describe('mergeHeaders', () => {
  test('It merges all arguments', () => {
    expect(mergeHeaders(headersA, headersB, headersC)).toEqual(expected)
  })

  test('It merges plain objects and Headers objects', () => {
    expect(
      mergeHeaders(
        headersA,
        headersB,
        headersC,
        new window.Headers({ Accept: 'text/html', })
      )
    ).toEqual({ ...expected, accept: 'text/html', })
  })

  test('It replaces any existing keys', () => {
    expect(mergeHeaders(headersD, headersA)).toEqual({
      'content-type': 'application/json',
    })
  })

  test('It ignores arguments that are not objects', () => {
    expect(mergeHeaders(headersA, null, headersB, [ 1, 2, ], headersC)).toEqual(
      expected
    )
  })
})
