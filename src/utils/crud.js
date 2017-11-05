import uuid from 'uuid/v4'
import isArray from 'lodash/isArray'
import isNil from 'lodash/isNil'
import omit from 'lodash/omit'
import pickBy from 'lodash/pickBy'

export const get = id => resource =>
  isArray(resource)
    ? isNil(id) ? resource : getFromArray(id)(resource)
    : isNil(id) ? Object.values(resource) : getFromObject(id)(resource)

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
const isNotNil = value => !isNil(value)

const sanitizePayload = payload => pickBy(payload, isNotNil)

const merge = payload => collection => (isArray(collection) ? [ ...collection, payload, ] : { ...collection, ...payload, })

// GET
const getFromObject = id => collection => collection[id]

const getFromArray = id => collection => collection.find(item => item.id === id || item._id === id)

// POST
const postToObject = payload => collection => {
  const _id = uuid()
  const modified = { ...payload, ...(!payload.id || (!payload._id && { _id, })), }
  return [
    modified,
    {
      ...collection,
      [payload.id || payload._id || _id]: modified,
    },
  ]
}

const postToArray = payload => collection => {
  const _id = uuid()
  const modified = { ...payload, ...(!payload.id || (!payload._id && { _id, })), }
  return [ modified, [ ...collection, modified, ], ]
}

// PUT
const putInObject = (id, payload) => collection => [
  payload,
  {
    ...collection,
    [id]: payload,
  },
]

const putInArray = (id, payload) => collection => {
  const idx = collection.findIndex(item => item.id === id || item._id === id)
  return [ payload, [ ...collection.slice(0, idx), payload, ...collection.slice(idx + 1), ], ]
}

// PATCH
const patchInObject = (id, payload) => collection => {
  const modified = merge(sanitizePayload(payload))(collection[id])
  return [
    modified,
    {
      ...collection,
      [id]: merge(sanitizePayload(payload))(collection[id]),
    },
  ]
}

const patchInArray = (id, payload) => collection => {
  const idx = collection.findIndex(item => item.id === id || item._id === id)
  const modified = merge(sanitizePayload(payload))(collection[idx])
  return [ modified, [ ...collection.slice(0, idx), modified, ...collection.slice(idx + 1), ], ]
}

// DELETE
const removeFromArray = id => collection => {
  const idx = collection.findIndex(item => item.id === id || item._id === id)
  const modified = { ...collection[idx], }
  return [ modified, [ ...collection.slice(0, idx), ...collection.slice(idx + 1), ], ]
}

const removeFromObject = id => collection => {
  const modified = { ...collection[id], }
  return [ modified, omit(collection, [ id, ]), ]
}
