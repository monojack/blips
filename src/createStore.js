import { execute, subscribe, parse, } from 'graphql'
import { makeExecutableSchema, } from 'graphql-tools'
import { PubSub, withFilter, } from 'graphql-subscriptions'

import { get, post, put, patch, remove, toObservable, } from './utils'

export default (schemaDefs, initialStore, enhancers) => {
  let _state = initialStore
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

  const _get = id => collection => get(id)(_state[collection])

  const _post = payload => collection => {
    const [ modified, nextCollection, ] = post(payload)(_state[collection])
    _state[collection] = nextCollection
    return modified
  }

  const _put = (id, payload) => collection => {
    const [ modified, nextCollection, ] = put(id, payload)(_state[collection])
    _state[collection] = nextCollection
    return modified
  }

  const _patch = (id, payload) => collection => {
    const [ modified, nextCollection, ] = patch(id, payload)(_state[collection])
    _state[collection] = nextCollection
    return modified
  }

  const _delete = id => collection => {
    const [ modified, nextCollection, ] = remove(id)(_state[collection])
    _state[collection] = nextCollection
    return modified
  }

  const context = {
    store: {
      get state () {
        return _state
      },
      get: _get,
      post: _post,
      put: _put,
      patch: _patch,
      delete: _delete,
    },
  }

  const _query = (literal, variableValues, operationName) => {
    const documentAST = typeof literal === 'string' ? parse(literal) : literal
    return execute(_schema, documentAST, {}, context, variableValues, operationName)
  }

  const _mutate = (literal, variableValues, operationName) => {
    const documentAST = typeof literal === 'string' ? parse(literal) : literal
    return execute(_schema, documentAST, {}, context, variableValues, operationName)
  }

  const _subscribe = async (literal, variableValues, operationName) => {
    const documentAST = typeof literal === 'string' ? parse(literal) : literal
    const iterator = await subscribe(_schema, documentAST, {}, context, variableValues, operationName)
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
