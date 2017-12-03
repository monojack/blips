import { parse, GraphQLError, } from 'graphql'
import * as rules from '../rules'
import { getOperationName, } from '../getOperationName'
import {
  singleFieldSubscriptionsError,
  loneAnonymousOperationError,
  uniqueFragmentNamesError,
} from '../../__mocks__/operations'

describe('Error messages', () => {
  test('duplicateFragmentNameMessage returns correct error message', () => {
    expect(rules.duplicateFragmentNameMessage('foo')).toBe(
      'There can be only one fragment named "foo".'
    )
  })

  test('singleFieldOnlyMessage returns correct error message', () => {
    expect(rules.singleFieldOnlyMessage()).toEqual(
      'Anonymous Subscription must select only one top level field.'
    )
    expect(rules.singleFieldOnlyMessage('allTodosSubscription')).toEqual(
      'Subscription "allTodosSubscription" must select only one top level field.'
    )
  })
})

describe('singleFieldSubscriptions', () => {
  test('It returns a GraphQLError if subscription has multiple top level fields', () => {
    const { definitions, } = parse(singleFieldSubscriptionsError)

    expect(rules.singleFieldSubscriptions(definitions[0])).toEqual(
      new GraphQLError(rules.singleFieldOnlyMessage())
    )
    expect(rules.singleFieldSubscriptions(definitions[1])).toBeUndefined()

    expect(rules.singleFieldSubscriptions(definitions[2])).toEqual(
      new GraphQLError(
        rules.singleFieldOnlyMessage(getOperationName(definitions[2]))
      )
    )
    expect(rules.singleFieldSubscriptions(definitions[3])).toBeUndefined()
  })
})

describe('loneAnonymousOperation', () => {
  test('It returns a GraphQLError if query has multiple anonymous operations', () => {
    const { definitions, } = parse(loneAnonymousOperationError)
    const operationsCount = definitions.length

    expect(
      rules.loneAnonymousOperation(definitions[0], operationsCount)
    ).toEqual(new GraphQLError(rules.anonOperationNotAloneMessage()))

    expect(
      rules.loneAnonymousOperation(definitions[0], definitions.pop())
    ).toBeUndefined()
  })

  describe('uniqueFragmentNames', () => {
    test('It returns a GraphQLError if query has fragment definitions with the same name', () => {
      const { definitions, } = parse(uniqueFragmentNamesError)
      const knownFragmentNames = {}

      expect(
        rules.uniqueFragmentNames(definitions[0], knownFragmentNames)
      ).toBeUndefined()

      expect(
        rules.uniqueFragmentNames(definitions[1], knownFragmentNames)
      ).toBeUndefined()

      expect(
        rules.uniqueFragmentNames(definitions[3], knownFragmentNames)
      ).toEqual(
        new GraphQLError(
          rules.duplicateFragmentNameMessage(getOperationName(definitions[3]))
        )
      )
    })
  })
})
