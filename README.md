# <a href='https://github.com/monojack/blips'>

<img src='https://raw.githubusercontent.com/monojack/blips/master/logo/blips-logo-dark-text.png' height='100'>

</a>

Client for managing application state with GraphQL operations.

[![Build Status](https://travis-ci.org/monojack/blips.svg?branch=master)](https://travis-ci.org/monojack/blips)
[![npm version](https://img.shields.io/npm/v/blips.svg)](https://www.npmjs.com/package/blips)
[![npm downloads](https://img.shields.io/npm/dm/blips.svg)](https://www.npmjs.com/package/blips)

## Table of contents

* [The concept](#the-concept)
* [The why?](#the-why)
* [The basics](#the-basics)
  * [installation](#installation)
  * [the client instance](#the-client-instance)
  * [operations and execution](#operations-and-execution)
  * [subscriptions](#subscriptions)
  * [fetching data](#fetching-data)
  * [extending the context](#extending-the-context)
  * [use with React](#use-with-react)
* [The tips](#the-tips)
* [The kudos](#the-kudos)

## The concept

**Blips** exposes a simple interface for managing your application state with
GraphQL.

The state is contained inside a single _store_ object. It can only be changed
through **_mutations_**, you can read from it through **_queries_** and can also
listen for changes with **_subscriptions_**.

## The why?

I developed **Blips** because I wanted to use **GraphQL** with every project,
regardless of what the API server looks like. So if my application is consuming
a simple API (whatever kind), I can still have a _store_ that manages the
application state and write queries/mutations that would resolve with making
requests to that API.

## The basics

The following examples assume some familiarity with GraphQL. If you haven't used
it before, or you have no idea about what it is, you should visit graphql.org
and read about GraphQL in detail.

### Installation

```bash
npm install blips graphql
```

### The client instance

> new BlipsClient({ typeDefs [, resolvers] } [, initialState] [, config] )

Creating a client requires type definitions, optional resolvers, optional
initial state and an optional configuration object.

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

* a basic `Todo` object type containing three fields: `id`, `label`,
  `completed`.
* the root `Query` type
* the root `Mutation` type

The `!` marks the field as required. See
[graphql.org](http://graphql.org/learn/schema/#type-system) to read more about
the type system.

##### resolvers

```js
// resolvers.js

export default {
  Query: {
    allTodos: (obj, args, { store }) => store.state.todos || [],
  },
  Mutation: {
    createTodo: (
      obj,
      { id, label, completed = false },
      { store: { state: { todos } } }
    ) => {
      const newTodo = { id, label, completed }
      todos = [...todos, newTodo]
      return newTodo
    },
  },
}
```

The `resolvers.js` file provides definitions for `allTodos` query and the
`createTodo` mutation. Each resolver function accepts three arguments:

* `obj`: The previous object.
* `args`: The arguments provided to the field in the GraphQL query.
* `context`: Provides access to important information like the currently logged
  in user, or the store itself.

See [graphql.org](http://graphql.org/learn/execution/#root-fields-resolvers) to
read more about resolvers.

##### client

```js
// index.js

import { BlipsClient } from 'blips'
import resolvers from './resolvers'
import typeDefs from './types'

const initialState = {
  todos: {
    '3c4a086e-2151-4b54-acb2-13044ea553c1': {
      id: '3c4a086e-2151-4b54-acb2-13044ea553c1',
      label: 'Buy milk',
      completed: false,
    },
  },
}
const schemaDef = { typeDefs, resolvers }

// new BlipsClient({ typeDefs [, resolvers] } [, initialState] [, config] )
const client = new BlipsClient(schemaDef, initialState)
```

You create a new client by providing your schema definitions (`{ typeDefs,
resolvers }`) and an optional initial state. In addition to the `schemaDefs` and
`initialState`, you can also privide a `configuration` object as the last and
optional argument. The `configuration` parameter is used for tapping into the
initial setup to define default variables or context properties and to configure
the `fetch` method.

The client object has the following API:

* `state`: getter for your entire state.
* `schema`: getter for your generated schema.
  [state-clerk](https://github.com/monojack/state-clerk).
* `query`: method for executing queries.
* `mutate`: method for executing mutations.
* `subscribe`: method for registering subscriptions.
* `fetch`: method for sending queries to a real GraphQL API.

### Operations and Execution

You define operations in the form of GraphQL queries, mutations or subscriptions
and use the client methods for executing them.

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
import { todoQuery, createTodoMutation } from './operations'

client
  .query(todoQuery, {
    variables: { id: '3c4a086e-2151-4b54-acb2-13044ea553c1' },
  })
  .then(res => {
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

client
  .mutate(createTodoMutation, {
    variables: {
      id: '4ecca858-67f8-491e-94cc-48b262061819',
      label: 'Learn Blips',
    },
  })
  .then(res => {
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

If you've used Redux before you can think of execution methods as dispatchers.
All executors may receive three arguments:

* `operation`: can be in the form of source or documentAST
* `options`: object containing:
  * `variables`: the operation variables
  * `context`: object containing any additional data that you want to pass to
    the resolvers, like the currently logged in user, tokens etc. (This will
    extend the default context)

All executors return promises that eventually resolve with an object containing
a `data` prop which holds the requested data. If, for some reason, the operation
was not successful, the `data` prop will hold an `error` object instead of the
requested field.

Managing your state in an asynchronous way might seem scary but unless you're
actually fetching data from a web service, hitting an API or performing database
queries, your data will be available with the next tick. This behaviour also
comes with a few benefits:

* it forces you to introduce checks and error handlers which will eventually
  result in better code.
* you can write abstractions or helpers for managing your data and they will
  apply everywhere.
* it's much easier if you decide to switch from caching some of your state
  locally to exclusively fetching it from an external service.

Plus, using `async/await` will still make your code look synchronous and badass.

### Subscriptions

1. [GraphQL subscriptions
   RFC](https://github.com/facebook/graphql/blob/master/rfcs/Subscriptions.md)
2. [Proposal for GraphQL Subscriptions by
   Apollo](https://dev-blog.apollodata.com/a-proposal-for-graphql-subscriptions-1d89b1934c18)

In addition to polling queries or scheduling them to execute at different
moments throughout your application life-cycle to keep your data up-to-date, you
can also subscribe to changes through GraphQL subscriptions:

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

const asyncIterator = await client.subscribe(allTodosSubscription)

/* Either use for-await-of */
try {
  for await (const tick of asyncIterator) {
    console.log(tick);
    // { data: { allTodos: [ ... ] } }
  }
} catch (e) {
  // { data: { error: { ... } } }
}


/* or transform the iterator into an observable and subscribe to it */
const sub = asyncIterator.toObservable().subscribe(
  next => {
    // { data: { allTodos: [ ... ] } }
  },
  error => {
    // { data: { error: { ... } } }
  }
)

// remember to dispose of any unused subscriptions
// sub.unsubscribe()
```

**Blips** uses [Apollo's
graphql-subscriptions](https://github.com/apollographql/graphql-subscriptions)
**PubSub** implementation, where any query or mutation would `publish` data over
a specific topic while your subscription resolvers subscribe to one or more
topics.

In order to use subscriptions with **Blips**, you need to have access to the
client's `PubSub` instance. We can achieve that by passing a `resolvers`
function instead of an object when creating the client instance. This function
accepts as first argument an object containing the `PubSub` instance and the
[`withFilter`](https://github.com/apollographql/graphql-subscriptions#filters)
method.

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

In the above example, the `createTodoMutation` publishes over `TODO_CREATED` as
soon as the todos get updated with the new entry. It doesn't need to publish any
data because the `allTodos` subscription will return all the todos and it's
`resolve` method will do just that.

#### filters

> When publishing data to subscribers, we need to make sure that each
> subscribers get only the data it needs.

> To do so, we can use withFilter helper from this package, which wraps
> AsyncIterator with a filter function, and let you control each publication for
> each user.

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

The `updateTodoMutation` will publish the updated todo over the `TODO_UPDATED`
topic. If we have subscriptions registered for each todo, only those who's ID
variable match to the updated todo's ID will emit.

Head over to
[graphql-subscriptions](https://github.com/apollographql/graphql-subscriptions)
for a more detailed documentation on how to use this PubSub implementation.

### Fetching data

Your access is not limited to the default context, nor limited to working with
only the local state. Resolvers can completely ignore any context and just make
async requests to external API servers.

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

const newTodo = await client.mutate(createTodoMutation, { variables: { label: 'Buy milk' } })
```

#### GraphQL API

```js
import { BlipsClient } from 'blips'
import resolvers from './resolvers'
import typeDefs from './types'

const initialState = {}

const client = new BlipsClient({ typeDefs, resolvers }, initialState, { fetch: { uri: 'http://localhost:3000/graphql' } })

const allTodosQuery = `
  query allTodosQuery($first: Int) {
    allTodos(first: $first) {
      id
      label
      completed
    }
  }
`
// client.fetch(query [, options] [, operationName] )
const todos = await client.fetch(allTodosQuery, { variables: { first: 10 } })
```

### Extending the context

You can extend the context provided to the resolvers in two ways:

**1.** When creating the client instance, by passing a `context` object through
the `options` argument. This will extend the default context will be available
to all your resolvers:

```js
const client = new BlipsClient({ typeDefs, resolvers }, initialState, {
  context: { foo: 'bar' },
})
```

**2.** Through the `options` argument of every executor, which will make it
available only for that execution context:

> `client.query(allBookmarksQuery, { context: { user: loggedUser } })`

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
    },
  },
}

// initial state
const initialState = {
  bookmarks: [
    { id: 1, post_id: 11, user_id: 23 },
    { id: 2, post_id: 356, user_id: 77 },
    { id: 3, post_id: 155, user_id: 23 },
  ],
}

const client = new BlipsClient({ typeDefs, resolvers }, initialState)

const allBookmarksQuery = `
  query allBookmarksQuery {
    allBookmarks {
      id
      post
      user
    }
  }
`
const myBookmarks = client.query(allBookmarksQuery, {
  context: { user: loggedUser },
})
```

### Use with React

This _basics_ guide contains examples of using **Blips** with vanilla JS. The
preferred way to use with **React** is with
[react-blips](https://github.com/monojack/react-blips). Read the documentation
there and/or check out the `*-react-blips`
[examples](https://github.com/monojack/blips/tree/master/examples) to get an
idea of how it works.

## The tips

### [dataloader](https://github.com/facebook/dataloader)

Since this is `GraphQL`, some of your operations may result in multiple queries
for the same resource. Imagine the following scenario:

```js
const state = {
  comments: {
    '3c4a086e-2151-4b54-acb2-13044ea553c1': {
      id: '3c4a086e-2151-4b54-acb2-13044ea553c1',
      message: 'Nice job!',
      created: 1510737448000,
      user_id: 'b1e7ed4d-7baa-4209-8ef3-0ccea2b420b0'
    },
    'f0ff08d2-9ea4-48b3-a77f-6b1517b5c827': {
      id: 'f0ff08d2-9ea4-48b3-a77f-6b1517b5c827',
      message: 'Great read!',
      created: 1510737617221,
      user_id: 'b1e7ed4d-7baa-4209-8ef3-0ccea2b420b0'
    },
  },
  users: {
    'b1e7ed4d-7baa-4209-8ef3-0ccea2b420b0'; {
      id: 'b1e7ed4d-7baa-4209-8ef3-0ccea2b420b0',
      firstName: 'John',
      lastName: 'Doe',
      comments: ['3c4a086e-2151-4b54-acb2-13044ea553c1', 'f0ff08d2-9ea4-48b3-a77f-6b1517b5c827']
      // ...
    }
  }
}

const types = `
  ...
  type Comment {
    id: String!
    message: String!
    user: User!
    created: Int!
  }
  ...
`

const resolvers = {
  // ...
  Query: {
    userCommentsQuery: (obj, { uid }, { store }) => store.get('comments', { user_id: uid }),
  },

  Comment: {
    user: ({ user_id }, args, { store }) => store.get('users', user_id),
  },
  // ...
}

const userCommentsQuery = `
  query userCommentsQuery($uid: String!) {
    userComments(uid: $uid) {
      idea
      message
      created
      user {
        id
        firstName
        photo
      }
    }
  }
`
```

We have a `comments` collection where each of the comments contain a `user_id`
field that is a reference to it's poster. When `userCommentsQuery` is executed,
the `user` field resolver for the comment will be called twice, even though it
will return the same user. That is bad design for a graphql _server_ (querying
the database multiple times for the same resource), but it doesn't apply when
managing the client state. If you were to not add a resolver for the `Comment`'s
`user` field, you would get the list of comments and then map over it to expand
the user data. That would still result in querying the store for the same
resource multiple times.

Now, because **Blips** manages all state asynchronously, we can use
**dataloader** to batch and cache our resolvers, and that is a nice win and
another benefit of managing your state asynchronously!

### [graphql-tag](https://www.apollographql.com/docs/react/recipes/webpack.html)

With `graphql-tag` you can write your queries and type definitions in
`.graphql|gql` files rather than `.js` that export template literals. All you
need to do is [add the loader to your webpack
config](https://www.apollographql.com/docs/react/recipes/webpack.html).

### mergers

You can further split your queries and/or type definitions in multiple modules
and use a package that will merge them before creating the client instance. See
[merge-graphql-schemas](https://github.com/okgrow/merge-graphql-schemas) or
[gql-merge](https://www.npmjs.com/package/gql-merge)

## The kudos

* Props to the awesome developers at Facebook for giving us
  [GraphQL](http://graphql.org/)
* Props to the guys at [Apollo](https://www.apollographql.com/) for their
  awesome work. Using `apollo-client` is what inspired me to start working on
  this library, and they also provide some of the tools it depends on.
