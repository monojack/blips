import React from 'react'
import { array } from 'prop-types'

import { Todo } from '../'

const TodoList = ({ todos, onClick, onRemove, onToggle }) => {
  return (
    <ul className="todo-list">
      {todos.map(todo => <Todo {...{ todo, onToggle, onRemove, onClick }} key={todo.id} />)}
    </ul>
  )
}

TodoList.propTypes = {
  todos: array.isRequired,
}

TodoList.defaultProps = {
  onClick: () => {},
  onRemove: () => {},
  onToggle: () => {},
}

export default TodoList
