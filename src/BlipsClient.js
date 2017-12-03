import { GraphQLError, execute, subscribe, validate, } from 'graphql'
import { makeExecutableSchema, } from 'graphql-tools/dist/schemaGenerator'
import { PubSub, withFilter, } from 'graphql-subscriptions'
import { createApolloFetch, } from 'apollo-fetch'
import Clerk from 'state-clerk'

import {
  isEmpty,
  when,
  isType,
  toObservable,
  extendContext,
  getDocument,
  promiseBatch,
  getOperationType,
  validateWithoutSchema,
} from './utils'

const loggedWarnings = {}
export const CLIENTGRAPHQL_DEPRECATION_WARNING = ` The "graphql" method is deprecated and will be removed in the 1.0 release. Use the "fetch" method instead.`
export const CREATESTORE_DEPRECATION_WARNING = `The "createStore" method is deprecated and will be removed in the 1.0 release. Use "new BlipsClient(...)" instead`
export const FETCH_NOT_CONFIGURED_ERROR = `You are trying to use "BlipsClient.fetch" without it being configured.`
export const NO_SUBSCRIPTION_ERROR = `No subscription operation defined in query`
export const LONE_SUBSCRIPTION_OPERATION_ERROR = `Only one subscription operation is allowed per query`
export const incorrectMiddlewareOrAfterwareType = (
  name = 'middleware/afterware'
) => `The fetch ${name} must be a function or an array of functions`

export function BlipsClient (
  { typeDefs, resolvers, } = {},
  initialState,
  { variables = {}, context = {}, fetch = {}, } = {}
) {
  const _pubsub = new PubSub()

  let _state
  let _schema
  let _resolvers
  let _clerk
  let _context
  let _variables
  let _apolloFetch

  function _validateDocument (sourceOrDocument) {
    let document = sourceOrDocument
    try {
      document = getDocument(sourceOrDocument)
    } catch (syntaxError) {
      return { document, errors: [ syntaxError, ], }
    }

    let errors = _schema
      ? validate(_schema, document)
      : validateWithoutSchema(document)

    return { document, ...(!isEmpty(errors) && { errors, }), }
  }

  function _runner (fn) {
    return function (
      document,
      { variables = {}, context = {}, } = {},
      operationName,
      resolveFn
    ) {
      return (0, fn)(
        _schema,
        document,
        {},
        extendContext(_context, context),
        { ..._variables, ...variables, },
        operationName,
        resolveFn
      )
    }
  }

  function _setUpMiddlewareOrAfterware (listOrFn, name) {
    if (!listOrFn) return

    if (isType('function', listOrFn)) {
      _apolloFetch.use(listOrFn)
    } else if (isType('array', listOrFn)) {
      for (const middleware of listOrFn) {
        _apolloFetch.use(middleware)
      }
    } else {
      throw new TypeError(incorrectMiddlewareOrAfterwareType(name))
    }
  }

  const _executor = _runner(execute)
  const _subscriber = _runner(subscribe)

  function _execute (operationType) {
    return (sourceOrDocument, options, operationName, resolveFn) => {
      const { document, errors, } = _validateDocument(sourceOrDocument)
      if (errors) return Promise.resolve({ errors, })

      // If an operationName is provided, go ahead and execute that
      if (operationName) {
        return _executor(document, options, operationName, resolveFn)
      }

      // If there's just one operation definition of the correct type execute it
      if (
        document.definitions.length === 1 &&
        getOperationType(document.definitions[0]) === operationType
      ) {
        return _executor(document, options, operationName, resolveFn)
      }

      // otherwise:
      const executableOperations = document.definitions.filter(
        definition => definition.operation === operationType
      )

      return promiseBatch(
        executableOperations.map(operation =>
          _executor(operationType)(
            operation,
            options,
            operation.name.value,
            resolveFn
          )
        )
      )
    }
  }

  ;(function constructor () {
    // store the initial state
    _state = { ...initialState, } || {}

    // create and store the clerk instance
    _clerk = new Clerk(_state)

    // compute and store the resolvers
    _resolvers = when(
      typeof resolvers === 'function',
      resolvers({ pubsub: _pubsub, withFilter, }),
      resolvers
    )

    // make and store the executable schema if typeDefs provided
    if (typeDefs) {
      _schema = makeExecutableSchema({
        typeDefs,
        resolvers: _resolvers,
      })
    }

    // store the default variables
    _variables = variables

    // compute and store the default context
    _context = extendContext(
      {
        // add store to the context.
        // it will not be replaced by any `store` props passed through the default options
        store: {
          ..._clerk,
        },
      },
      context
    )

    // create apolloFetch
    if (fetch.uri) {
      _apolloFetch = createApolloFetch({ uri: fetch.uri, })

      // set up middleware and afterware
      _setUpMiddlewareOrAfterware(fetch.middleware, 'middleware')
      _setUpMiddlewareOrAfterware(fetch.afterware, 'afterware')
    }
  })()

  return {
    /**
     * returns the state object
     * @return {Object}
     */
    get state () {
      return _state
    },

    /**
     * returns the schema
     * @return {GraphQLSchema}
     */
    get schema () {
      return _schema
    },

    query: _execute('query'),

    mutate: _execute('mutation'),

    subscribe: async (sourceOrDocument, options, operationName, resolveFn) => {
      const { document, errors, } = _validateDocument(sourceOrDocument)
      if (errors) return Promise.resolve({ errors, })

      const operations = document.definitions.filter(
        definition => definition.operation === 'subscription'
      )

      if (operations.length < 1) {
        return Promise.resolve({
          errors: [ new GraphQLError(NO_SUBSCRIPTION_ERROR), ],
        })
      } else if (operations.length > 1) {
        return Promise.resolve({
          errors: [ new GraphQLError(LONE_SUBSCRIPTION_OPERATION_ERROR), ],
        })
      }

      const iterator = await _subscriber(
        document,
        options,
        operationName,
        resolveFn
      )
      iterator.toObservable = () => toObservable(iterator)
      return iterator
    },

    fetch: (query, { variables = {}, } = {}, operationName) => {
      if (!_apolloFetch || !isType('function', _apolloFetch)) {
        throw new Error(FETCH_NOT_CONFIGURED_ERROR)
      }

      return _apolloFetch({ query, variables, operationName, })
    },
    graphql: (query, { variables = {}, } = {}, operationName) => {
      if (!loggedWarnings[CLIENTGRAPHQL_DEPRECATION_WARNING]) {
        // eslint-disable-next-line
        console.warn(CLIENTGRAPHQL_DEPRECATION_WARNING)
        loggedWarnings[CLIENTGRAPHQL_DEPRECATION_WARNING] = true
      }
      if (!_apolloFetch || !isType('function', _apolloFetch)) {
        throw new Error(FETCH_NOT_CONFIGURED_ERROR)
      }

      return _apolloFetch({ query, variables, operationName, })
    },
  }
}

export function createStore (...args) {
  if (!loggedWarnings[CREATESTORE_DEPRECATION_WARNING]) {
    // eslint-disable-next-line
    console.warn(CREATESTORE_DEPRECATION_WARNING)
    loggedWarnings[CREATESTORE_DEPRECATION_WARNING] = true
  }
  return new BlipsClient(...args)
}
