import { Kind, } from 'graphql'

export function isFragmentDefinition (definition) {
  return Boolean(definition.kind === Kind.FRAGMENT_DEFINITION)
}
