import { GraphQLSchema, } from 'graphql'

import { createStore, } from '../createStore'

import typeDefs from '../__mocks__/typeDefs'
import resolvers from '../__mocks__/resolvers'
import initialState from '../__mocks__/initialState'
import * as operations from '../__mocks__/operations'

const noTypeDefsFn = () => {
  createStore({ typeDefs: ``, resolvers: {}, }, {})
}

describe('createStore', () => {
  let store

  beforeEach(() => {
    store = createStore({ typeDefs, resolvers, }, initialState, {
      networkInterface: {
        endpoint: 'http://159.203.96.223/graphql',
        headers: new window.Headers({ 'content-type': 'application/json', }),
      },
    })
  })

  afterEach(() => {
    store = null
  })
  test('It throws if no typeDefs provided', () => {
    expect(noTypeDefsFn).toThrow()
  })

  test('It returns a store object', () => {
    expect(store).toEqual(
      expect.objectContaining({
        graphql: expect.any(Function),
        query: expect.any(Function),
        mutate: expect.any(Function),
        subscribe: expect.any(Function),
        state: expect.any(Object),
        schema: expect.any(GraphQLSchema),
      })
    )
    expect(Object.keys(store)).toHaveLength(6)
    expect(Object.keys(store).sort()).toMatchObject([
      'graphql',
      'mutate',
      'query',
      'schema',
      'state',
      'subscribe',
    ])
  })

  test('The store methods return a promises', async () => {
    expect(store.query(operations.allTodosQuery)).toEqual(expect.any(Promise))

    expect(store.mutate(operations.createTodoMutation)).toEqual(
      expect.any(Promise)
    )

    expect(store.subscribe(operations.allTodosSubscription)).toEqual(
      expect.any(Promise)
    )

    expect(
      store.graphql(`
      query fakeListQuery {
        FakeList(length: 3) {
          label: sentence
          completed: boolean
          id
        }
      }
    `)
    ).toEqual(expect.any(Promise))
  })

  test('Only one subscription operation is allowed per query', async () => {
    let error
    let response

    try {
      response = await store.subscribe(
        operations.allTodosSubscription + operations.allTodosSubscription
      )
    } catch (e) {
      error = e
    }

    expect(response).toBeUndefined()
    expect(error).toBeDefined()
  })

  test('Throws an error if `store.subscribe is called without a subscription operation`', async () => {
    expect.assertions(2)
    let error
    let response

    try {
      response = await store.subscribe(operations.createTodoMutation)
    } catch (e) {
      error = e
    }

    expect(response).toBeUndefined()
    expect(error).toBeDefined()
  })
})
