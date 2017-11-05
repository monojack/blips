# Blips
State container for your JavaScript apps


### The basics
**Blips** exposes a simple, GraphQL-like API for managing your application state, which is contained inside a single *store*.

The store can be changed only through **_mutations_**, you can read from it through **_queries_** and can also listen for changes with **_subscriptions_**.

### The why?
I developed **Blips** because I wanted to use **GraphQL** with every project, regardless of what the API server looks like. So if my aplication is consuming a simple API (whatever kind), I can still have a *store* that manages the application state and write queries/mutations that would resolve with making requests to that API. E.g.:

> Disclaimer: The following snippet is pulled out of context so it might not make sense to everybody.

```js
const resolvers = {
  Mutation: {
    createTodo: async (_, args, context) =>
      await fetch('api/v1/todos', {
        method: 'post',
        body: JSON.stringify(args)
      }).then(res => res.json())
  }
}

const createTodoMutation = `
  mutation createTodoMutation($label: String!) {
    createTodo(label: $label) {
      id
      label
      completed
    }
  }
`

// wth is store ?!!?!!111
store.mutate(createTodoMutation, { label: 'Buy milk' })
  .then(res => {
    // do something with res
  })
```

### The code (examples)

> Disclaimer: The folder structure in the following example does not represent a requirement or guideline. It's just how I use it.

You can play with this code by cloning the repository and running the project in `examples/todos-vanillajs`.
More coming soon.

```js
// types.js

export default `
  type Todo {
    id: String!
    label: String!
    completed: Boolean
  }

  type Query {
    allTodos: [Todo]!
  }

  type Mutation {
    createTodo(label: String!, completed: Boolean): Todo!
    updateTodo(id: String!, label: String, completed: Boolean): Todo!
    deleteTodo(id: String!): Todo!
  }

  type Subscription {
    allTodos: [Todo]!
  }
`
```

```js
// resolvers.js
import uuid from 'uuid'

export default ({ pubsub, withFilter, }) => ({
  Todo: {
    id: ({ id, _id, }, args, context) => _id || id,
  },
  Query: {
    allTodos: (_, args, { store, }) => store.get(null)('todos'),
  },
  Mutation: {
    createTodo: (_, { label, completed = false, }, { store, }) => {
      const id = uuid()
      const modified = store.post({
        _id: id,
        label,
        completed,
      })('todos')
      pubsub.publish('TODO_CREATED')
      return modified
    },
    updateTodo: (_, { id, label, completed, }, { store, }) => {
      const modified = store.patch(id, {
        label,
        completed,
      })('todos')
      pubsub.publish('TODO_UPDATED', { id, })
      return modified
    },
    deleteTodo: (_, { id, }, { store, }) => {
      const modified = store.delete(id)('todos')
      pubsub.publish('TODO_DELETED')
      return modified
    },
  },
  Subscription: {
    allTodos: {
      resolve: (_, args, { store, }) => store.get(null)('todos'),
      subscribe: () => pubsub.asyncIterator([ 'TODO_UPDATED', 'TODO_CREATED', 'TODO_DELETED', ]),
    },
  },
})

```

```js
// operations.js
export const allTodosQuery = `
  query allTodosQuery {
    allTodos {
      id
      label
      completed
    }
  }
`

export const allTodosSubscription = `
  subscription allTodosSubscription {
    allTodos {
      id
      label
      completed
    }
  }
`

export const createTodoMutation = `
  mutation createTodoMutation($label: String!, $completed: Boolean) {
    createTodo(label: $label, completed: $completed) {
      id
      label
      completed
    }
  }
`

export const updateTodoMutation = `
  mutation updateTodoMutation($id: String!, $label: String, $completed: Boolean) {
    updateTodo(id: $id, label: $label, completed: $completed) {
      id
      label
      completed
    }
  }
`

export const deleteTodoMutation = `
  mutation deleteTodoMutation($id: String!) {
    deleteTodo(id: $id) {
      id
      label
      completed
    }
  }
`

```

```js
// index.js

import { createStore } from 'blips'
import typeDefs from './types'
import resolvers from './resolvers'
import { allTodosSubscription } from './operations'


const initialState = {
  todos: {
    '3c4a086e-2151-4b54-acb2-13044ea553c1': {
      _id: '3c4a086e-2151-4b54-acb2-13044ea553c1',
      label: 'Buy milk',
      completed: false
    },
    '4ecca858-67f8-491e-94cc-48b262061819': {
      _id: '4ecca858-67f8-491e-94cc-48b262061819',
      label: 'Learn Blips',
      completed: true
    }
  }
}

const store = createStore({typeDefs, resolvers}, initialState)


const allTodosObservable = await store.subscribe(allTodosSubscription)
const sub = allTodosObservable.subscribe({data: {allTodos: todos}} => console.log(todos))

// dispose mechanism works as expected
sub.unsubscribe()

```
