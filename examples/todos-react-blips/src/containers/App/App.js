import React, { Component } from 'react'
import { graphql } from 'react-blips'

import { TodoList } from '../../components'

import {
  allTodosQuery,
  allTodosSubscription,
  createTodoMutation,
  updateTodoMutation,
  deleteTodoMutation,
} from './operations'

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
    await createTodoMutation({ variables: { label: e.target.value } })

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

  render() {
    const { data: { loading, error, allTodos = [] } } = this.props
    const todosRemaining = allTodos.filter(todo => !todo.completed)
    return (
      <section className="todoapp">
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
          {!loading &&
            !error && (
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
      </section>
    )
  }
}

export default graphql(
  allTodosQuery,
  allTodosSubscription,
  createTodoMutation,
  updateTodoMutation,
  deleteTodoMutation
)(App)
