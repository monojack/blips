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
