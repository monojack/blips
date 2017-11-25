import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'blips'
import { Provider } from 'react-blips'

import './index.css'
import { App } from './containers'
import registerServiceWorker from './registerServiceWorker'

import typeDefs from './schema/types'
import resolvers from './schema/resolvers'

// initial state
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
const store = createStore({ typeDefs, resolvers }, initialState, {
  networkInterface: {
    endpoint: 'http://159.203.96.223/graphql',
    headers: new window.Headers({ 'content-type': 'application/json' }),
  },
})

ReactDOM.render(
  <Provider {...{ store }}>
    <App />
  </Provider>,
  document.getElementById('root')
)
registerServiceWorker()
