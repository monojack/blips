import React, { Component } from 'react'
import { withOperations, graphql, compose } from 'react-blips'

import { TodoList, FakeTodosButton } from '../../components'

import { fakeTodosQuery, mergedOperationsWithFragment } from './operations'

class App extends Component {
  state = {
    value: '',
  }

  handleChange = ({ target: { value } }) => {
    this.setState({
      value,
    })
  }

  createTodo = async e => {
    const { mutations: { createTodoMutation } } = this.props
    await createTodoMutation({
      variables: { label: e.target.value },
    })

    this.setState({
      value: '',
    })
  }

  onTodoToggle = (e, id, completed) => {
    const { mutations: { updateTodoMutation } } = this.props
    updateTodoMutation({ variables: { id, completed } })
  }

  onTodoRemove = (e, id) => {
    const { mutations: { deleteTodoMutation } } = this.props
    deleteTodoMutation({ variables: { id } })
  }

  onButtonClick = async () => {
    const {
      queries: { FakeListQuery },
      mutations: { createTodoMutation },
    } = this.props
    const { data: { fakeTodos } } = await FakeListQuery()

    for (const todo of fakeTodos) {
      createTodoMutation({ variables: todo })
    }
  }

  render() {
    const { data: { loading, errors, allTodos = [] } } = this.props
    if (errors) console.log(errors)

    const todosRemaining = allTodos.filter(todo => !todo.completed)
    return [
      <section className="todoapp" key={'app-section'}>
        <header className="header">
          <h1>Todos</h1>
          <input
            className="new-todo"
            placeholder="What needs to be done?"
            autoFocus
            value={this.state.value}
            onKeyUp={e => e.keyCode === 13 && this.createTodo(e)}
            onChange={this.handleChange}
          />
        </header>
        <main className="main">
          {!loading && (
            <TodoList
              {...{ todos: allTodos }}
              onToggle={this.onTodoToggle}
              onRemove={this.onTodoRemove}
            />
          )}
        </main>
        <footer className="footer">
          <span className="todo-count">
            <strong>{todosRemaining.length || 'no'}</strong>
            {todosRemaining.length === 1 ? ' item' : ' items'} left
          </span>
        </footer>
      </section>,
      <FakeTodosButton key={'app-button'} onClick={this.onButtonClick} />,
    ]
  }
}

export default compose(
  withOperations(fakeTodosQuery, {
    options: {
      variables: { length: 3 },
    },
  }),
  graphql(mergedOperationsWithFragment)
)(App)
