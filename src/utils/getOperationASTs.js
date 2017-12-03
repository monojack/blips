import { isOperationDefinition, } from './isOperationDefinition'

export function getOperationASTs ({ definitions, }) {
  return definitions.filter(isOperationDefinition)
}
