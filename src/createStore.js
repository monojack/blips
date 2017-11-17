import { execute, subscribe, parse, } from 'graphql'
import { makeExecutableSchema, } from 'graphql-tools/dist/schemaGenerator'
import { PubSub, withFilter, } from 'graphql-subscriptions'
import Clerk from 'state-clerk'

import { toObservable, extendContext, } from './utils'

export function createStore (schemaDefs, initialState, options = {}) {
  let _state = initialState

  const clerk = new Clerk(_state)
  const pubsub = new PubSub()

  const { typeDefs = ``, resolvers = {}, } =
    typeof schemaDefs.resolvers === 'function'
      ? {
        ...schemaDefs,
        resolvers: schemaDefs.resolvers(
          { pubsub, withFilter, } // pubsub
        ),
      }
      : schemaDefs || {}

  const _schema = makeExecutableSchema({ typeDefs, resolvers, })

  const defaultContext = {
    store: {
      get state () {
        return _state
      },
      set state (data) {
        _state = data
      },
      get: clerk.get,
      post: clerk.post,
      put: clerk.put,
      patch: clerk.patch,
      delete: clerk.delete,
      getCollection: clerk.getCollection,
      addCollection: clerk.addCollection,
      removeCollection: clerk.removeCollection,
    },
  }

  const context = extendContext(defaultContext, options.context)

  const _query = (literal, { variables, context: ctx, } = {}, operationName) => {
    const documentAST = typeof literal === 'string' ? parse(literal) : literal
    if (!documentAST.definitions || documentAST.definitions.length === 1) {
      return execute(
        _schema,
        documentAST,
        {},
        extendContext(context, ctx),
        variables,
        operationName
      )
    }

    const promises = documentAST.definitions.map(operation => {
      return execute(
        _schema,
        documentAST,
        {},
        extendContext(context, ctx),
        variables,
        operation.name.value
      )
    })

    return new Promise((resolve, reject) => {
      Promise.all(promises).then(
        res => {
          const merged = res.reduce((acc, curr) => {
            return {
              ...acc,
              data: { ...(acc['data'] || {}), ...(curr['data'] || {}), },
              errors: [ ...(acc['errors'] || []), ...(curr['errors'] || []), ],
            }
          }, {})
          resolve(merged)
        },
        err => reject(err)
      )
    })
  }

  const _mutate = (
    literal,
    { variables, context: ctx, } = {},
    operationName
  ) => {
    const documentAST = typeof literal === 'string' ? parse(literal) : literal
    return execute(
      _schema,
      documentAST,
      {},
      extendContext(context, ctx),
      variables,
      operationName
    )
  }

  const _subscribe = async (
    literal,
    { variables, context: ctx, } = {},
    operationName
  ) => {
    const documentAST = typeof literal === 'string' ? parse(literal) : literal
    const iterator = await subscribe(
      _schema,
      documentAST,
      {},
      extendContext(context, ctx),
      variables,
      operationName
    )
    return toObservable(iterator)
  }

  return {
    get state () {
      return _state
    },
    get schema () {
      return _schema
    },
    query: _query,
    mutate: _mutate,
    subscribe: _subscribe,
  }
}
