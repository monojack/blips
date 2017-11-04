import uuid from 'uuid/v4'
import isArray from 'lodash/isArray'
import isNil from 'lodash/isNil'
import omit from 'lodash/omit'

export const get = id => resource =>
  isNil(id) ? resource : isArray(resource) ? getFromArray(id)(resource) : getFromObject(id)(resource)

export const post = payload => resource =>
  isArray(resource) ? postToArray(payload)(resource) : postToObject(payload)(resource)

export const put = (id, payload) => resource =>
  isArray(resource) ? putInArray(id, payload)(resource) : putInObject(id, payload)(resource)

export const patch = (id, payload) => resource =>
  isArray(resource) ? patchInArray(id, payload)(resource) : patchInObject(id, payload)(resource)

export const remove = id => resource =>
  isArray(resource) ? removeFromArray(id)(resource) : removeFromObject(id)(resource)

/**
 * HELPERS
 */

const merge = payload => collection => (isArray(collection) ? [ ...collection, payload, ] : { ...collection, ...payload, })

// GET
const getFromObject = id => collection => collection[id]

const getFromArray = id => collection => collection.find(item => item.id === id || item._id === id)

// POST
const postToObject = payload => collection => ({
  ...collection,
  [payload.id || payload._id || uuid()]: payload,
})

const postToArray = payload => collection => [
  ...collection,
  { ...payload, ...((payload.id || payload._id) && { id: uuid(), }), },
]

// PUT
const putInObject = (id, payload) => collection => ({
  ...collection,
  [id]: payload,
})

const putInArray = (id, payload) => collection => {
  const idx = collection.findIndex(item => item.id === id || item._id === id)
  return [ ...collection.slice(0, idx), payload, ...collection.slice(idx + 1), ]
}

// PATCH
const patchInObject = (id, payload) => collection => ({
  ...collection,
  [id]: merge(payload)(collection[id]),
})

const patchInArray = (id, payload) => collection => {
  const idx = collection.findIndex(item => item.id === id || item._id === id)
  return [ ...collection.slice(0, idx), merge(payload)(collection[idx]), ...collection.slice(idx + 1), ]
}

// DELETE
const removeFromArray = id => collection => {
  const idx = collection.findIndex(item => item.id === id || item._id === id)
  return [ ...collection.slice(0, idx), ...collection.slice(idx + 1), ]
}

const removeFromObject = id => collection => omit([ id, ])(collection)
