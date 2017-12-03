import { parse, } from 'graphql'
import { getOperationName, } from '../getOperationName'
import { fragmentsAndOperations as query, } from '../../__mocks__/operations'

describe('getOperationName', () => {
  test('It returns a list containg only the operation definitions', () => {
    const { definitions, } = parse(query)

    expect(getOperationName(definitions[1])).toBe('allTodosQuery')
    expect(getOperationName(definitions[2])).toBe('createTodoMutation')
    expect(getOperationName(definitions[4])).toBe('allUsersSubscription')
  })
})
