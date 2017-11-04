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
store.mutate(createTodoMutation, { variables: { label: 'Buy milk' } })
  .then(res => {
    // do something with res
  })
```

### The code

> Disclaimer: The code folder structure in the following example does not represent a requirement or guideline. It's just how I use it.

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

  type Mutations {
    createTodo: Todo!
    updateTodo: Todo!
  }

  type Subscription {
    allTodos: [Todo]!
  }
`

```

```js
// resolvers.js

export default (pubsub, withFilter) => ({
  Todo: {
    // transform _id to id
    id: ({ id, _id }, args, context) => _id || id,
  },

  Query: {
    allTodos: allTodos: (_, args, {store}) => store.get('todos')
  },

  Mutation: {
    createTodo: (_, { label, completed = false }, { store }) => {
      const id = uuid()
      const newTodo = {
        _id: id,
        label,
        completed
      }

      const newTodos = store.post(newTodo)('todos')
      pubsub.publish('todoCreated')

      return newTodo
    },
    updateTodo: (_, {id, label, completed}, {store}) => {
      const newTodo = store.patch(id, {
        label,
        completed
      })('todos')
      pubsub.publish('todoUpdated', { id })

      return newTodo
    }
  }

  Subscription: {
    allTodos: {
      subscribe: () => pubsub.asyncIterator(['todoCreated', 'todoUpdated'])
    },
    todo: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('todoUpdated'),
        (args, variables) => {
          return args.id === variables.id
        }
      )
    },
  }
})
```

```js
// operations.js

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
  mutation createTodoMutation(label: String!, completed: Boolean) {
    createTodo(label: $label, completed: $completed) {
      id
      label
      completed
    }
  }
`

export const updateTodoMutation = `
  mutation updateTodoMutation(id: String!, label: String, completed: Boolean) {
    updateTodo(id: $id, label: $label, completed: $completed) {
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
const sub = allTodosObservable.subscribe(todos => console.log(todos))

// dispose mechanism works as expected
sub.unsubscribe()

```
