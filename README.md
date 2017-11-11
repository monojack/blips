# <a href='https://github.com/monojack/blips'><img src='https://raw.githubusercontent.com/monojack/blips/master/logo/blips-logo-dark-text.png' height='100'></a>

State container for JavaScript applications

[![Build Status](https://travis-ci.org/monojack/blips.svg?branch=master)](https://travis-ci.org/monojack/blips)

## The concept
**Blips** exposes a simple, GraphQL-like API for managing your application state, which is contained inside a single *store*.

The store can only be changed through **_mutations_**, you can read from it through **_queries_** and can also listen for changes with **_subscriptions_**.

## The why?
I developed **Blips** because I wanted to use **GraphQL** with every project, regardless of what the API server looks like. So if my application is consuming a simple API (whatever kind), I can still have a *store* that manages the application state and write queries/mutations that would resolve with making requests to that API.

## The basics

The following examples assume some familiarity with GraphQL. If you haven't used it before, or you have no idea about what it is, you should visit graphql.org and read about GraphQL in detail.

### Installation

```bash
npm install blips
```

### Creating the store

Creating a store requires type definitions, resolvers and an optional object containing the initial state.

##### typeDefs
```js
// types.js

export default `
  type Todo {
    id: String!
    label: String!
    completed: Boolean!
  }

  type Query {
    allTodos: [Todo]!
    todo(id: String!): Todo!
  }

  type Mutation {
    createTodo(id: String!, label: String!, completed: Boolean)
  }
`
```

The `types.js` file contains 3 definitions:
  - a basic `Todo` object type containing three fields: `id`, `label`, `completed`.
  - the root `Query` type
  - the root `Mutation` type

The `!` marks the field as required. See [graphql.org](http://graphql.org/learn/schema/#type-system) to read more about the type system.


##### resolvers
```js
// resolvers.js

export default {
  Query: {
    allTodos: (obj, args, { store }) => store.state.todos || []
  },
  Mutation: {
    createTodo: (obj, { id, label, completed = false }, { store: { state: { todos } } }) => {
      const newTodo = { id, label, completed }
      todos = [ ...todos, newTodo ]
      return newTodo
    }
  }
}
```

The `resolvers.js` file provides definitions for `allTodos` query and the `createTodo` mutation. Each resolver function accepts three arguments:
  - `obj`: The previous object.
  - `args`: The arguments provided to the field in the GraphQL query.
  - `context`: Provides access to important information like the currently logged in user, or the store itself.

See [graphql.org](http://graphql.org/learn/execution/#root-fields-resolvers) to read more about resolvers.



##### store

```js
// index.js

import { createStore } from 'blips'
import resolvers from './resolvers'
import typeDefs from './types'

const initialState = {
  todos: {
    '3c4a086e-2151-4b54-acb2-13044ea553c1': {
      id: '3c4a086e-2151-4b54-acb2-13044ea553c1',
      label: 'Buy milk',
      completed: false
    },
  }
}
const schemaDef = { typeDefs, resolvers }

// createStore({ typeDefs [, resolvers] } [, initialState] [, options] )
const store = createStore(schemaDef, initialState)
```
You create a store by calling the `createStore` function provided by `blips` and passing it your schema definitions (`{ typeDefs, resolvers }`) and an optional initial state. In addition to the `schemaDefs` and `initialState`, the `createStore` method also accepts `options` as the last and optional argument. `options` is used for tapping into the initial setup.

For now, you can use `options` to extend the context provided to resolvers ( _`const store = createStore(schemaDefs, initialState, { context: { user: { ...loggedUser } } })`_), but any PR is welcome if you come up with good ideas.

The returned store instance has the following API:
  - `state`: getter for your entire state.
  - `schema`: getter for your generated schema.
  - `store`: provides access to the state object and a couple of CRUD methods for managing it, provided through [state-clerk](https://github.com/monojack/state-clerk).
  - `query`: method for executing queries.
  - `mutate`: method for executing mutations.
  - `subscribe`: method for registering subscriptions.
  - `fetch`: method for sending queries to an actual GraphQL API. _*coming soon*_

### Operations and Execution

You define operations in the form of GraphQL queries, mutations or subscriptions and use their respective store methods for executing them.

#### operations
```js
// operations.js

export const todoQuery = `
  query todoQuery {
    todo {
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
```
Read more about [queries and mutations](http://graphql.org/learn/queries)

#### execution

```js

import { todoQuery, createTodoMutation } from 'blips'

store.query(todoQuery, { variables: { id: '3c4a086e-2151-4b54-acb2-13044ea553c1' } }).then(res => {
  console.log(res)
  // {
  //   data: {
  //     todo: {
  //       label: 'Buy milk',
  //       completed: false
  //     }
  //   }
  // }
})

store.mutate(createTodoMutation, { variables: { id: '4ecca858-67f8-491e-94cc-48b262061819', label: 'Learn Blips' } }).then(res => {
  console.log(res)
  // {
  //   data: {
  //     createTodo: {
  //       id: '4ecca858-67f8-491e-94cc-48b262061819',
  //       label: 'Learn Blips',
  //       completed: false
  //     }
  //   }
  // }
})
```

If you've used Redux before you can think of execution methods as dispatchers. All executors may receive three arguments:
  - `operation`: can be in the form of documents or documentASTs
  - `variables`: object containing the values for field arguments
  - `context`: object containing any additional data that you might want to pass to the resolvers, like the currently logged in user, tokens etc. (This will extend the default context)

All executors return promises that eventually resolve/reject with an object containing a `data` prop which holds the requested data. If, for some reason, the operation was not successful, the `data` prop will hold an `error` object instead of the requested field.

Managing your state in an asynchronous way might seem scary but unless you're actually fetching data from a web service, hitting an API or performing database queries, your data will be available with the next tick.
This behaviour also comes with a few benefits:
  - it forces you to introduce checks and error handlers which will eventually result in (I think) better code.
  - you can write abstractions or helpers for managing your data and they will apply everywhere.
  - it's much easier if you decide to switch from caching some of your state locally to exclusively fetching it from an external service.

Plus, using `async/await` will still make your code look synchronous and badass.


### Subscriptions

1. [GraphQL subscriptions RFC](https://github.com/facebook/graphql/blob/master/rfcs/Subscriptions.md)
2. [Proposal for GraphQL Subscriptions by Apollo](https://dev-blog.apollodata.com/a-proposal-for-graphql-subscriptions-1d89b1934c18)

In addition to polling queries or scheduling them to execute at different moments throughout your application life-cycle to keep your data up-to-date, you can also subscribe to changes through GraphQL subscriptions:

```js
const allTodosSubscription = `
  subscription allTodosSubscription {
    allTodos {
      id
      label
      completed
    }
  }
`

const allTodosObservable = await store.subscribe(allTodosSubscription)
const sub = allTodosObservable.subscribe(
  res => {
    // { data: { allTodos: [ ... ] } }
  },
  err => {
    // { data: { error: { ... } } }
  }
)

// remember to dispose of any unused subscriptions
// sub.unsubscribe()
```

**Blips** uses [Apollo's graphql-subscriptions](https://github.com/apollographql/graphql-subscriptions) **PubSub** implementation, where any query or mutation would `publish` data over a specific topic and have your subscription resolvers subscribe to one or more topics.

In order to use subscriptions with **Blips**, you need to have access to the store's `PubSub` instance. We can achieve that by passing a `resolvers` function instead of an object to `createStore`. This function accepts as first argument an object containing the `PubSub` instance and the [`withFilter`](https://github.com/apollographql/graphql-subscriptions#filters) method.


#### simple subscriptions
```js
// resolvers.js

export default ({ pubsub, withFilter }) => ({
  Query: { ... },
  Subscription: {
    allTodos: {
      resolve: (obj, args, { store }) => store.state.todos || [],
      subscribe: () => pubsub.asyncIterator([ 'TODO_UPDATED', 'TODO_CREATED', 'TODO_DELETED', ]),
    }
  }
  Mutation: {
    createTodo: (obj, { id, label, completed = false }, { store: { state: { todos } } }) => {
      const newTodo = { id, label, completed }
      todos = [ ...todos, newTodo ]

      pubsub.publish('TODO_CREATED')
      return newTodo
    }
  }
})
```
In the above example, the `createTodoMutation` publishes over `TODO_CREATED` as soon as the todos get updated with the new entry. It doesn't need to publish any data because the `allTodos` subscription will return all the todos and it's `resolve` method will do just that.


#### filters

> When publishing data to subscribers, we need to make sure that each subscribers get only the data it needs.

> To do so, we can use withFilter helper from this package, which wraps AsyncIterator with a filter function, and let you control each publication for each user.

```js
// types.js

export default {
  ...
  type Subscription {
    todo(id: String!): Todo!
  }
  ...
}

// resolvers.js

export default ({pubsub, withFilter}) => ({
  Query: { ... },
  Subscription: {
    todo: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('TODO_UPDATED'),
        (payload, variables) => payload && payload.todo.id === variables.id
      )
    }
  },
  Mutation: {
    updateTodo: (obj, { id, label, completed }, { store }) => {
      const modified = store.patch(id, {
        label,
        completed,
      })('todos')
      pubsub.publish('TODO_UPDATED', { todo: modified })
      return modified
    }
  }
})
```

The `updateTodoMutation` will publish the updated todo over the `TODO_UPDATED` topic. If we have subscriptions registered for each todo, only those who's ID variable match to the updated todo's ID will emit.

Head over to [graphql-subscriptions](https://github.com/apollographql/graphql-subscriptions) for a more detailed documentation on how to use this PubSub implementation.



#### extending context
You can extend the context provided to the resolvers in two ways:

**1.** When creating the store, by passing a `context` object through the `options` argument. This will extend the default context will be available to all your resolvers:
```js
const store = createStore({ typeDefs, resolvers }, initialState, { context: { foo: 'bar' } })
```

**2.** Through the `options` argument of every executor, which will make it available only for that execution context:
> `store.query(allBookmarksQuery, { context: { user: loggedUser } })`

example:
```js
// types
const typeDefs = `
  type Bookmarks {
    id: Int!,
    post: Post!,
    user: User!
  }

  type Query {
    allBookmarks: [Bookmark]!
  }
`

// resolvers
const resolvers = {
  Query: {
    allBookmarks: (object, args, { store, user }) => {
      // using identifier { user_id: user.id } to return only the current user's bookmarks
      return store.get('bookmarks', { user_id: user.id })
      // Returns:
      // [
      //   { id: 1, post_id: 11, user_id: 23 },
      //   { id: 3, post_id: 155, user_id: 23 }
      // ]
    }
  }
}

// initial state
const initialState = {
  bookmarks: [
    { id: 1, post_id: 11, user_id: 23 },
    { id: 2, post_id: 356, user_id: 77 },
    { id: 3, post_id: 155, user_id: 23 }
  ]
}

const store = createStore({ typeDefs, resolvers }, initialState)

const allBookmarksQuery = `
  query allBookmarksQuery {
    allBookmarks {
      id
      post
      user
    }
  }
`
const myBookmarks = store.query(allBookmarksQuery, { context: { user: loggedUser } })
```

### Fetching data

Your access is not limited to the default context, nor limited to working with only the local state. Resolvers can completely ignore any context and just make async requests to external API servers.

#### REST API

```js
const resolvers = {
  Mutation: {
    createTodo: async () =>
      await fetch('api/v1/todos', {
        method: 'post',
        body: JSON.stringify(args)
      }).then(res => res.json())
  }
}

const createTodoMutation = `
  mutation createTodoMutation($label: String!, completed: Boolean) {
    createTodo(label: $label, completed) {
      id
      label
      completed
    }
  }
`

const newTodo = await store.mutate(createTodoMutation, { variables: { label: 'Buy milk' } })

```

#### GraphQL API   _*coming soon*_

```js
import { createStore } from 'blips'
import resolvers from './resolvers'
import typeDefs from './types'

const initialState = {}

const store = createStore({ typeDefs, resolvers }, initialState, { endpoint: 'http://localhost:3000/graphql' })

const allTodosQuery = `
  query allTodosQuery($first: Int) {
    allTodos(first: $first) {
      id
      label
      completed
    }
  }
`

const todos = await store.fetch(allTodosQuery, { first: 10 })
```

## The kudos

- Props to the awesome developers at Facebook for giving us [GraphQL](http://graphql.org/)
- Props to the guys at [Apollo](https://www.apollographql.com/) for their awesome work. Using `apollo-client` is what inspired me to start working on this library, and they also provide some of the tools it depends on.
