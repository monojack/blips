import { Kind, } from 'graphql'

export function isOperationDefinition (definition) {
  return Boolean(definition.kind === Kind.OPERATION_DEFINITION)
}
