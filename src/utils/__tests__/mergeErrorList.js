import { GraphQLError, } from 'graphql'

import { mergeErrorList, } from '../mergeErrorList'

const resetList = () => [
  new GraphQLError('Error 1'),
  new GraphQLError('Error 2'),
  new GraphQLError('No "users" collection found', null, null, null, [
    'allUsers',
  ]),
]

const resetExpected = () => ({
  GraphQLError: [ { message: 'Error 1', }, { message: 'Error 2', }, ],
  allUsers: [ { message: 'No "users" collection found', path: [ 'allUsers', ], }, ],
})

let list = resetList()
let expected = resetExpected()

describe('mergeErrorList', () => {
  test('It merges errors of the same type', () => {
    expect(mergeErrorList(list)).toEqual(expected)
  })

  test('It handles null entries correctly', () => {
    list.push(null)

    expect(list).toContain(null)
    expect(mergeErrorList(list)).toEqual(expected)
  })

  test('It handles sparse lists correctly', () => {
    list = resetList()
    // eslint-disable-next-line
    const sparseList = list.concat([, , ,])

    expect(sparseList.length).toEqual(6)
    expect(mergeErrorList(list)).toEqual(expected)
  })

  test('It merges anything that is not an object under the `Errors` prop', () => {
    list = resetList()
    const newList = list.concat([ [ 1, 2, ], null, 1, false, 'Error message', ])

    expect(mergeErrorList(newList)).toEqual({
      ...expected,
      Errors: [ [ 1, 2, ], 1, false, 'Error message', ],
    })
  })

  test('It returns nothing if the merged object is empty', () => {
    expect(mergeErrorList([ null, ])).toBeUndefined()
    expect(mergeErrorList([ null, {}, ])).toBeUndefined()
  })
})
