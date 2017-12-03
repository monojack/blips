import { getOperationASTs, } from './getOperationASTs'

import {
  loneAnonymousOperation,
  uniqueFragmentNames,
  singleFieldSubscriptions,
} from './rules'

export function validateWithoutSchema (document) {
  const operationCount = getOperationASTs(document).length
  const knownFragmentNames = Object.create(null)

  let errors = []

  for (const node of document.definitions) {
    const err =
      loneAnonymousOperation(node, operationCount) ||
      uniqueFragmentNames(node, knownFragmentNames) ||
      singleFieldSubscriptions(node)

    err && errors.push(err)
  }

  return errors
}
