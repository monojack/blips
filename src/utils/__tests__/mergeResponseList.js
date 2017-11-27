import { GraphQLError, } from 'graphql'
import { mergeResponseList, } from '../mergeResponseList'

const list = [
  {
    data: {
      allTodos: [],
    },
    errors: [ { message: 'Foo', path: [ 'allUsers', ], }, ],
  },
  {
    data: {
      allTodos: [ 1, 2, ],
      allComments: {},
    },
    errors: [
      new GraphQLError('GraphQL error'),
      { message: 'Bar', path: [ 'allUsers', ], },
    ],
  },
  {
    foo: 'bar', // not included
    data: {
      allFoos: [],
    },
  },
  {
    data: null, // not included
    errors: [], // not included
  },
  {
    data: {}, // not included
    errors: null, // not included
  },
]

const expected = {
  data: { allTodos: [ 1, 2, ], allComments: {}, allFoos: [], },
  errors: {
    allUsers: [
      { message: 'Foo', path: [ 'allUsers', ], },
      { message: 'Bar', path: [ 'allUsers', ], },
    ],
    GraphQLError: [ { message: 'GraphQL error', }, ],
  },
}

describe('mergeResponseList', () => {
  test('It correctly merges multiple (graphql) response objects', () => {
    expect(mergeResponseList(list)).toEqual(expected)
  })

  test('It returns doesn`t return empty props', () => {
    expect(
      mergeResponseList([
        { errors: [ { message: 'Foo', path: [ 'allUsers', ], }, ], },
        {},
      ])
    ).toEqual({
      errors: { allUsers: [ { message: 'Foo', path: [ 'allUsers', ], }, ], },
    })

    expect(
      mergeResponseList([
        { data: { allUsers: [], }, },
        { data: { allComments: [], }, },
        { data: {}, },
        { errors: [], },
      ])
    ).toEqual({ data: { allUsers: [], allComments: [], }, })
  })
})
