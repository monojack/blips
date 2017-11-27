import invariant from 'invariant'
import { subscribe, graphql, } from 'graphql'
import { makeExecutableSchema, } from 'graphql-tools/dist/schemaGenerator'
import { PubSub, withFilter, } from 'graphql-subscriptions'
import Clerk from 'state-clerk'

import {
  mergeHeaders,
  toObservable,
  extendContext,
  getDocument,
  promiseBatch,
  when,
} from './utils'

export const NO_SUBSCRIPTION_ERROR = `No subscription operation defined in query`
export const MAX_SUBSCRIPTION_OPERATIONS_ALLOWED_ERROR = `Only one subscription operation is allowed per query`

export function createStore (
  schemaDefs = {},
  initialState,
  { context = {}, networkInterface = {}, } = {}
) {
  let _state = initialState

  const _clerk = new Clerk(_state)
  const _pubsub = new PubSub()

  const _computeSchemaDefs = ({ resolvers, ...defs }) => ({
    ...defs,
    resolvers: resolvers(
      { pubsub: _pubsub, withFilter, } // pubsub
    ),
  })

  const _schema = makeExecutableSchema(
    when(
      typeof schemaDefs.resolvers === 'function',
      _computeSchemaDefs,
      schemaDefs
    )
  )

  const _context = extendContext(
    {
      store: {
        get state () {
          return _state
        },
        set state (data) {
          _state = data
        },
        ..._clerk,
      },
    },
    context
  )

  const _executor = (fn, isSubscription = false) => (
    sourceOrDocument,
    { variables, context, } = {},
    operationName
  ) =>
    fn(
      _schema,
      when(isSubscription, getDocument, sourceOrDocument),
      {},
      extendContext(_context, context),
      variables,
      operationName
    )

  const _execute = operation => (source, options, operationName) => {
    if (operationName) {
      return _executor(graphql)(source, options, operationName)
    }

    const operations = getDocument(source).definitions.filter(
      definition => definition.operation === operation
    )

    return promiseBatch(
      operations.map(definition =>
        _executor(graphql)(
          source,
          options,
          definition.name && definition.name.value
        )
      )
    )
  }

  const _query = _execute('query')

  const _mutate = _execute('mutation')

  // const _mutate = _executor(graphql)

  const _subscribe = async (source, options) => {
    const document = getDocument(source)
    const operations = document.definitions.filter(
      definition => definition.operation === 'subscription'
    )

    if (operations.length < 1) {
      invariant(false, NO_SUBSCRIPTION_ERROR)
    } else if (operations.length > 1) {
      invariant(false, MAX_SUBSCRIPTION_OPERATIONS_ALLOWED_ERROR)
    }

    const iterator = await _executor(subscribe, true)(document, options)
    iterator.toObservable = () => toObservable(iterator)
    return iterator
  }
  const _graphql = (
    source,
    {
      variables,
      requestConfig: {
        endpoint = networkInterface.endpoint,
        method = 'POST',
        headers = {},
        ...requestConfig
      } = networkInterface,
    } = {},
    operationName
  ) => {
    const _method = method === 'GET' ? 'GET' : 'POST'

    const request = new window.Request(endpoint, {
      method: _method,
      headers: mergeHeaders(
        {
          'content-type': 'application/json',
        },
        headers
      ),
      ...(_method === 'POST' && {
        body: JSON.stringify({
          query: source,
          variables,
          operationName,
        }),
      }),
      ...requestConfig,
    })

    return new Promise((resolve, reject) => {
      window
        .fetch(request)
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(error => reject(error))
    })
  }

  return {
    get state () {
      return _state
    },
    get schema () {
      return _schema
    },
    mutate: _mutate,
    query: _query,
    subscribe: _subscribe,
    graphql: _graphql,
  }
}
