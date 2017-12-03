import { GraphQLError, } from 'graphql'

import { isFragmentDefinition, } from './isFragmentDefinition'
import { getOperationName, } from './getOperationName'

export function singleFieldOnlyMessage (name) {
  return (
    (name ? 'Subscription "' + name + '" ' : 'Anonymous Subscription ') +
    'must select only one top level field.'
  )
}

export function anonOperationNotAloneMessage () {
  return 'This anonymous operation must be the only defined operation.'
}

export function duplicateFragmentNameMessage (fragName) {
  return 'There can be only one fragment named "' + fragName + '".'
}

/**
 * Subscriptions must only include one field.
 *
 * A GraphQL subscription is valid only if it contains a single root field.
 */
export function singleFieldSubscriptions (node) {
  if (node.operation === 'subscription') {
    if (node.selectionSet.selections.length !== 1) {
      return new GraphQLError(
        singleFieldOnlyMessage(node.name && node.name.value),
        node.selectionSet.selections.slice(1)
      )
    }
  }
}

/**
 * Lone anonymous operation
 *
 * A GraphQL document is only valid if when it contains an anonymous operation
 * (the query short-hand) that it contains only that one operation definition.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

export function loneAnonymousOperation (node, operationCount) {
  if (!node.name && operationCount > 1) {
    return new GraphQLError(anonOperationNotAloneMessage(), [ node, ])
  }
}

/**
 * Unique fragment names
 *
 * A GraphQL document is only valid if all defined fragments have unique names.
 */
export function uniqueFragmentNames (node, knownFragmentNames) {
  if (!isFragmentDefinition(node)) return

  const fragmentName = getOperationName(node)

  if (knownFragmentNames[fragmentName]) {
    return new GraphQLError(duplicateFragmentNameMessage(fragmentName), [
      knownFragmentNames[fragmentName],
      node.name,
    ])
  } else {
    knownFragmentNames[fragmentName] = node.name
  }
}
