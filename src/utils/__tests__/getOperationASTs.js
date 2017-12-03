import { parse, } from 'graphql'
import { getOperationASTs, } from '../getOperationASTs'
import { fragmentsAndOperations as query, } from '../../__mocks__/operations'

describe('getOperationASTs', () => {
  test('It returns a list containg only the operation definitions', () => {
    const doc = parse(query)
    let expected = doc.definitions.slice(1)
    expected = [ ...expected.slice(0, 2), ...expected.slice(3), ]

    expect(getOperationASTs(doc)).toEqual(expected)
  })
})
