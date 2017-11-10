import uuid from 'uuid'

// If you need to set-up subscriptions, you will have to return a function.
// It's first argument is an object containing the `PubSub` instance of the store and the `withFilter` helper.
// See https://github.com/apollographql/graphql-subscriptions - to learn more about `PubSub` and `withFilter`
//
// If you don't want subscriptions, you don't need to access to `pubsub` or `withFilter`
// so you can export just an object

// Read http://graphql.org/learn/execution/#root-fields-resolvers
// if you have no idea about what resolvers are

export default ({ pubsub, withFilter }) => ({
  Todo: {
    // transform _id to id
    id: ({ id, _id }, args, context) => _id || id,
  },
  Query: {
    allTodos: (_, args, { store }) => {
      return Object.values(store.get('todos'))
    },
  },
  Mutation: {
    createTodo: (_, { label, completed = false }, { store }) => {
      const id = uuid()
      const modified = store.post(
        'todos',
        {
          _id: id,
          label,
          completed,
        },
        id
      )
      pubsub.publish('TODO_CREATED')
      return modified
    },
    updateTodo: (_, { id, label, completed }, { store }) => {
      const modified = store.patch(
        'todos',
        {
          label,
          completed,
        },
        id
      )
      pubsub.publish('TODO_UPDATED', { id })
      return modified
    },
    deleteTodo: (_, { id }, { store }) => {
      const modified = store.delete('todos', id)
      pubsub.publish('TODO_DELETED')
      return modified
    },
  },
  Subscription: {
    allTodos: {
      resolve: (_, args, { store }) => Object.values(store.get('todos')),
      subscribe: () => pubsub.asyncIterator(['TODO_UPDATED', 'TODO_CREATED', 'TODO_DELETED']),
    },
  },
})
