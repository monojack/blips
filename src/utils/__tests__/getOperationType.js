import { parse, } from 'graphql'
import { getOperationType, } from '../getOperationType'
import { fragmentsAndOperations, } from '../../__mocks__/operations'

describe('getOperationType', () => {
  test('It returns the correct type of a definition operation', () => {
    const { definitions, } = parse(fragmentsAndOperations)

    expect(getOperationType(definitions[0])).toBeUndefined() // fragment
    expect(getOperationType(definitions[1])).toEqual('query')
    expect(getOperationType(definitions[2])).toEqual('mutation')
    expect(getOperationType(definitions[3])).toBeUndefined() // fragment
    expect(getOperationType(definitions[4])).toEqual('subscription')
  })
})
