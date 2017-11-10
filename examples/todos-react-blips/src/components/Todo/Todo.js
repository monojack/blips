import React from 'react'
import { object, func } from 'prop-types'

const Todo = ({ todo, onToggle, onRemove }) => (
  <li
    key={todo.id}
    className={todo.completed ? 'completed' : ''}
    onClick={e => onToggle(e, todo.id, !todo.completed)}
  >
    <div className="view">
      <input
        className="toggle"
        type="checkbox"
        onChange={e => {
          e.preventDefault()
          onToggle(e, todo.id, !todo.completed)
        }}
        checked={todo.completed}
      />
      <label>{todo.label}</label>
      <button
        className="destroy"
        onClick={e => {
          e.stopPropagation()
          onRemove(e, todo.id)
        }}
      />
    </div>
  </li>
)

Todo.propTypes = {
  todo: object.isRequired,
  onToggle: func,
  onRemove: func,
}

Todo.defaultProps = {
  onToggle: () => {},
  onRemove: () => {},
}

export default Todo
