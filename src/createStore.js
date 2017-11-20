import invariant from 'invariant'
import { subscribe, graphql, } from 'graphql'
import { makeExecutableSchema, } from 'graphql-tools/dist/schemaGenerator'
import { PubSub, withFilter, } from 'graphql-subscriptions'
import Clerk from 'state-clerk'

import {
  toObservable,
  extendContext,
  getDocument,
  promiseBatch,
  when,
} from './utils'

export function createStore (schemaDefs = {}, initialState, options = {}) {
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
    when(typeof schemaDefs.resolvers === 'function', _computeSchemaDefs)(
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
    options.context
  )

  const _executor = (fn, isSubscription = false) => (
    sourceOrDocument,
    { variables, context, } = {},
    operationName
  ) =>
    fn(
      _schema,
      when(isSubscription, getDocument)(sourceOrDocument),
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
        _executor(graphql)(source, options, definition.name.value)
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
      invariant(false, `No subscription operation defined in query`)
    } else if (operations.length > 1) {
      invariant(false, `Only one subscription operation is allowed per query`)
    }

    const iterator = await _executor(subscribe, true)(document, options)
    iterator.toObservable = () => toObservable(iterator)
    return iterator
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
  }
}
