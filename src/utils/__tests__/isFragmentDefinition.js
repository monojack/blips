import { parse, } from 'graphql'
import { isFragmentDefinition, } from '../isFragmentDefinition'
import { fragmentsAndOperations as query, } from '../../__mocks__/operations'

describe('isFragmentDefinition', () => {
  test('It returns a list containg only the operation definitions', () => {
    const { definitions, } = parse(query)

    expect(isFragmentDefinition(definitions[0])).toBeTruthy()
    expect(isFragmentDefinition(definitions[1])).toBeFalsy()
    expect(isFragmentDefinition(definitions[2])).toBeFalsy()
    expect(isFragmentDefinition(definitions[3])).toBeTruthy()
    expect(isFragmentDefinition(definitions[4])).toBeFalsy()
  })
})
