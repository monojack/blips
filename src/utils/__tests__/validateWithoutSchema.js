import { parse, GraphQLError, } from 'graphql'
import * as rules from '../rules'
import { getOperationName, } from '../getOperationName'
import { validateWithoutSchema, } from '../validateWithoutSchema'
import {
  fragmentsAndOperations,
  singleFieldSubscriptionsError,
  uniqueFragmentNamesError,
} from '../../__mocks__/operations'

describe('validateWithoutSchema', () => {
  test('It returns no errors if ast is valid', () => {
    const doc = parse(fragmentsAndOperations)
    expect(validateWithoutSchema(doc)).toEqual([])
  })

  test('It returns a list of all the errors encountered while parsing the provided document', () => {
    const doc = parse(singleFieldSubscriptionsError + uniqueFragmentNamesError)
    expect(validateWithoutSchema(doc)).toEqual([
      new GraphQLError(rules.anonOperationNotAloneMessage()),
      new GraphQLError(rules.anonOperationNotAloneMessage()),
      new GraphQLError(
        rules.singleFieldOnlyMessage(getOperationName(doc.definitions[2]))
      ),
      new GraphQLError(
        rules.duplicateFragmentNameMessage(getOperationName(doc.definitions[7]))
      ),
    ])
  })
})
