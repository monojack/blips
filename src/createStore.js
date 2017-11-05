import { execute, subscribe, parse, visit, } from 'graphql'
import { makeExecutableSchema, } from 'graphql-tools'
import { PubSub, withFilter, } from 'graphql-subscriptions'

import { get, post, put, patch, remove, toObservable, } from './utils'

export default (schemaDefs, initialStore, enhancers) => {
  let _data = initialStore
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

  const _get = id => resource => get(id)(_data[resource])

  const _post = payload => resource => {
    const [ modified, collection, ] = post(payload)(_data[resource])
    _data[resource] = collection
    return modified
  }

  const _put = (id, payload) => resource => {
    const [ modified, collection, ] = put(id, payload)(_data[resource])
    _data[resource] = collection
    return modified
  }

  const _patch = (id, payload) => resource => {
    const [ modified, collection, ] = patch(id, payload)(_data[resource])
    _data[resource] = collection
    return modified
  }

  const _delete = id => resource => {
    const [ modified, collection, ] = remove(id)(_data[resource])
    _data[resource] = collection
    return modified
  }

  const context = {
    store: {
      data: _data,
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
    get data () {
      return _data
    },
    get schema () {
      return _schema
    },
    query: _query,
    mutate: _mutate,
    subscribe: _subscribe,
    parse,
    visit,
  }
}
