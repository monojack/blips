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

export const anotherTodosSubscription = `
  subscription anotherTodosSubscription {
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

// Utils tests

export const fragmentsAndOperations = `
  fragment TodoFields on Todo {
    id
    label
    completed
  }
  query allTodosQuery {
    allTodos {
      ...TodoFields
    }
  }
  mutation createTodoMutation($label: String!) {
    createTodo {
      ...TodoFields
    }
  }
  fragment UserFields on User {
    id
    firstName
    lastName
  }
  subscription allUsersSubscription {
    allUsers {
      ...UserFields
    }
  }
`

export const singleFieldSubscriptionsError = `
  subscription {
    allUsers {
      id
    }
    allTodos {
      id
    }
  }
  subscription {
    allUsers {
      id
    }
  }
  subscription allSubscriptions {
    allUsers {
      id
    }
    allTodos {
      id
    }
  }
  query allTodosSubscription {
    allTodos {
      id
      label
    }
  }
`

export const loneAnonymousOperationError = `
  {
    allTodos {
      id
    }
  }
  {
    allUsers {
      id
    }
  }
`

export const uniqueFragmentNamesError = `
  mutation createTodoMutation($label: String!) {
    createTodo(label: $label) {
      id
      label
      completed
    }
  }
  fragment Fields on Todo {
    id
    label
  }
  query allTodosQuery {
    allTodos {
      ...Fields
    }
  }
  fragment Fields on User {
    id
    firstName
  }
  query allUsersQuery {
    allUsers {
      ...Fields
    }
  }
`
