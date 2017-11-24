// This module handles creating and adding elements to the DOM.
// It doesn't teach you how to use Blips, it just creates and renders the todo list.

export const renderTodos = (todos, container) => {
  const ul = document.createElement('UL')
  ul.className = 'todo-list'

  for (const todo of todos) {
    ul.appendChild(createLi(todo))
  }

  container.innerHTML = ''
  container.appendChild(ul)
}

export const renderTodoCount = (todos, container) => {
  const remainingTodos = todos.filter(({ completed, }) => !completed)
  const remainingTodosCount = remainingTodos.length
  const isSingular = remainingTodosCount === 1

  container.innerHTML = `<strong>${remainingTodosCount}</strong> ${
    isSingular ? 'item' : 'items'
  } left`
}

const createLi = todo => {
  const li = document.createElement('LI')
  li.dataset.key = todo.id
  li.className = todo.completed ? 'completed' : ''

  const view = document.createElement('DIV')
  view.className = 'view'

  const input = document.createElement('INPUT')
  input.id = `input-${todo.id}`
  input.type = 'checkbox'
  input.className = 'toggle'

  const label = document.createElement('LABEL')
  label.htmlFor = input.id

  const button = document.createElement('BUTTON')
  button.className = 'destroy'

  input.checked = todo.completed
  input.dataset.id = todo.id

  label.textContent = todo.label

  button.dataset.id = todo.id

  view.appendChild(input)
  view.appendChild(label)
  view.appendChild(button)

  li.appendChild(view)

  return li
}
