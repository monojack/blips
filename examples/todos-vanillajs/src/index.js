import { createStore, } from 'blips'

import './index.css'

import typeDefs from './schema/types'
import resolvers from './schema/resolvers'
import {
  allTodosQuery,
  allTodosSubscription,
  createTodoMutation,
  updateTodoMutation,
  deleteTodoMutation,
} from './operations'
import { renderTodos, renderTodoCount, } from './renderer'

// initial data
const initialState = {
  todos: {
    '3c4a086e-2151-4b54-acb2-13044ea553c1': {
      _id: '3c4a086e-2151-4b54-acb2-13044ea553c1',
      label: 'Buy milk',
      completed: false,
    },
    '4ecca858-67f8-491e-94cc-48b262061819': {
      _id: '4ecca858-67f8-491e-94cc-48b262061819',
      label: 'Learn Blips',
      completed: true,
    },
  },
}

// create the store
const store = createStore({ typeDefs, resolvers, }, initialState, {
  context: { user: { firstName: 'Anouk', }, },
})

// renders the list of todos and the todo count
const render = todos => {
  renderTodos(todos, document.querySelector('.main'))
  renderTodoCount(todos, document.querySelector('.todo-count'))
}

// init function:
// gets the initial list of todos to render and then it subscribes to all todos
const init = async () => {
  // get initial allTodos
  const { data: { allTodos: todos, }, } = await store.query(allTodosQuery)
  render(todos)

  // subscribe to allTodos
  const asyncIterable = await store.subscribe(allTodosSubscription)
  asyncIterable.toObservable().subscribe(({ data: { allTodos, }, }) => {
    render(allTodos)
  })
}

// creating new todos:
// use store.mutate with the `createTodoMutation` to add a new todo
document.querySelector('.new-todo').addEventListener('keyup', async e => {
  // if key !== Enter
  if (e.keyCode !== 13) return

  // reset the input value after the mutation
  await store.mutate(createTodoMutation, {
    variables: { label: e.target.value, },
    context: { foo: 'meeeeeeeeh', },
  })
  e.target.value = ''
})

// list click handlers using event delegation

// toggle handler
const handleToggle = async e => {
  // prevent default behaviour because the checkox should be un/checked programatically
  e.preventDefault()
  const { target: { dataset: { id, }, checked, }, } = e

  // use store.mutate with `updateTodoMutation` to update the completion state of the todo.
  // `updateTodoMutation` should patch the todo, so we don't need to send the entire payload
  id &&
    store.mutate(updateTodoMutation, { variables: { id, completed: checked, }, })
}

// remove handler
const handleRemove = e => {
  const { target: { dataset: { id, }, }, } = e

  // use store.mutate with `deleteTodoMutation` to remove a todo
  id && store.mutate(deleteTodoMutation, { variables: { id, }, })
}

// use this to trigger different handlers based on the target element tagName:
// clicking on `input` and `label` will toggle the completion state of the todo.
// clicking on `button` will remove the todo.
const clickHandlerMap = {
  INPUT: handleToggle,
  BUTTON: handleRemove,
}

// list-wrapper click handler
const handleListClick = e => {
  // get the correct handler for the clicked element
  const fn = clickHandlerMap[e.target.tagName]
  // call it
  fn && fn(e)
}

// set click event listener on the list-wrapper
document.querySelector('.main').addEventListener('click', handleListClick)

// init!
init()
