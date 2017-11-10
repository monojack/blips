/* eslint-disable global-require */

// babel-polyfill
require('babel-polyfill')

// promise polyfill
if (typeof Promise === 'undefined') {
  require('promise/lib/rejection-tracking').enable()
  window.Promise = require('promise/lib/es6-extensions.js')
}

// fetch() polyfill for making API calls.
require('whatwg-fetch')

// Object.assign() polyfill
Object.assign = require('object-assign')
