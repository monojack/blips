import { parse, } from 'graphql'

export function getDocument (sourceOrDocument) {
  return typeof sourceOrDocument === 'string'
    ? parse(sourceOrDocument)
    : sourceOrDocument
}
