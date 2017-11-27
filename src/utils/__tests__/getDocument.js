import { getDocument, } from '../getDocument'
import { Kind, } from 'graphql'

const query = `
  query allTodosQuery {
    allTodos {
      id
      label
      completed
    }
  }
`

const documentAST = {
  definitions: [],
  kind: 'Document',
  loc: { start: 0, end: 87, },
}

const foo = {
  bar: 1,
  baz: 2,
}

describe('getDocument', () => {
  test('It returns the parsed source if it`s a string', () => {
    expect(getDocument(query)).toEqual(
      expect.objectContaining({
        kind: Kind.DOCUMENT,
      })
    )
  })

  test('It returns the same object if one provided', () => {
    expect(getDocument(documentAST)).toEqual(documentAST)
    expect(getDocument(foo)).toEqual(foo)
  })
})
