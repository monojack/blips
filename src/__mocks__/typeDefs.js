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
