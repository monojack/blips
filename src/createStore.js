import { execute, subscribe, } from 'graphql'
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

  const _executor = fn => (
    sourceOrDocument,
    { variables, context, } = {},
    operationName
  ) =>
    fn(
      _schema,
      getDocument(sourceOrDocument),
      {},
      extendContext(_context, context),
      variables,
      operationName
    )

  const _query = (source, options, operationName) => {
    const document = getDocument(source)

    return promiseBatch(
      document.definitions.map(definition =>
        _executor(execute)(document, options, definition.name.value)
      )
    )
  }

  const _mutate = _executor(execute)

  const _subscribe = async (source, options, operationName) => {
    const iterator = await _executor(subscribe)(source, options, operationName)

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
