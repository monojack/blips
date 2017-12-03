import { GraphQLSchema, } from 'graphql'
import {
  BlipsClient,
  createStore,
  NO_SUBSCRIPTION_ERROR,
  LONE_SUBSCRIPTION_OPERATION_ERROR,
  FETCH_NOT_CONFIGURED_ERROR,
  CREATESTORE_DEPRECATION_WARNING,
} from '../BlipsClient'

import typeDefs from '../__mocks__/typeDefs'
import resolvers from '../__mocks__/resolvers'
import initialState from '../__mocks__/initialState'
import * as operations from '../__mocks__/operations'

function fetchNotConfiguredFn (client) {
  return () => {
    return client.fetch(`
    query fakeListQuery {
      FakeList(length: 3) {
        label: sentence
        completed: boolean
        id
      }
    }
  `)
  }
}

describe('BlipsClient and createBlipsClient', () => {
  const storeObject = expect.objectContaining({
    query: expect.any(Function),
    mutate: expect.any(Function),
    subscribe: expect.any(Function),
    fetch: expect.any(Function),
    state: expect.any(Object),
    schema: expect.any(GraphQLSchema),
  })
  let client

  beforeEach(() => {
    client = new BlipsClient({ typeDefs, resolvers, }, initialState, {
      fetch: {
        uri: 'http://159.203.96.223/graphql',
      },
    })
  })

  afterEach(() => {
    client = null
  })

  test('"BlipsClient" and "createStore" return client objects', () => {
    // eslint-disable-next-line
    console && (console.warn = () => {})

    const store = createStore({ typeDefs, resolvers, }, initialState, {
      fetch: {
        uri: 'http://159.203.96.223/graphql',
      },
    })
    expect(store).toEqual(storeObject)
    expect(client).toEqual(storeObject)
    expect(Object.keys(client)).toHaveLength(6)
    expect(Object.keys(client).sort()).toMatchObject([
      'fetch',
      'mutate',
      'query',
      'schema',
      'state',
      'subscribe',
    ])
  })

  test('The "creteStore" methds logs a deprecation warning', () => {
    const warnMock = jest.fn()
    // eslint-disable-next-line
    console && (console.warn = warnMock)

    createStore({ typeDefs, resolvers, }, initialState, {
      fetch: {
        uri: 'http://159.203.96.223/graphql',
      },
    })

    expect(warnMock).toHaveBeenCalledTimes(1)
    expect(warnMock).toHaveBeenCalledWith(CREATESTORE_DEPRECATION_WARNING)
  })

  test('"client.state" getter returns the state object', () => {
    expect(client.state).toEqual(initialState)
  })

  test('"client.schema" getter returns the schema', () => {
    expect(client.schema).toBeInstanceOf(GraphQLSchema)
  })

  test('The client methods return a promises', async () => {
    expect.assertions(4)
    expect(client.query(operations.allTodosQuery)).toEqual(expect.any(Promise))

    expect(client.mutate(operations.createTodoMutation)).toEqual(
      expect.any(Promise)
    )

    expect(client.subscribe(operations.allTodosSubscription)).toEqual(
      expect.any(Promise)
    )

    const promise = client.fetch(`
      query fakeListQuery {
        FakeList(length: 3) {
          label: sentence
          completed: boolean
          id
        }
      }
    `)

    promise.catch(() => {})
    expect(promise).toEqual(expect.any(Promise))
  })

  test('client.fetch throws an error if fetch is not configured', () => {
    const _client = new BlipsClient({ typeDefs, resolvers, })

    expect(fetchNotConfiguredFn(_client)).toThrow(FETCH_NOT_CONFIGURED_ERROR)
  })

  test('Only one subscription operation is allowed per query', async () => {
    const response = await client.subscribe(
      operations.allTodosSubscription + operations.anotherTodosSubscription
    )

    expect(response).toEqual({
      errors: [ { message: LONE_SUBSCRIPTION_OPERATION_ERROR, }, ],
    })
  })

  test('Throws an error if `client.subscribe` is called without a subscription operation', async () => {
    expect.assertions(1)
    const response = await client.subscribe(operations.createTodoMutation)

    expect(response).toEqual({
      errors: [ { message: NO_SUBSCRIPTION_ERROR, }, ],
    })
  })
})
