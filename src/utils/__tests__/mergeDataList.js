import { mergeDataList, } from '../mergeDataList'

const resetList = () => [
  {
    allTodos: [],
  },
  {
    allUsers: [],
  },
]

let list = resetList()

describe('mergeDataList', () => {
  test('It merges a list of `data` objects into a single object', () => {
    expect(mergeDataList(list)).toEqual({ allTodos: [], allUsers: [], })
  })

  test('It replaces any existing props', () => {
    list.push({ allTodos: [ 1, 2, ], })
    expect(mergeDataList(list)).toEqual({ allTodos: [ 1, 2, ], allUsers: [], })

    list.push({ allUsers: 'John', })
    expect(mergeDataList(list)).toEqual({ allTodos: [ 1, 2, ], allUsers: 'John', })
  })

  test('It handles null values correctly', () => {
    list = resetList()

    list.push(null)
    expect(list).toContain(null)
    expect(mergeDataList(list)).toEqual({ allTodos: [], allUsers: [], })
  })

  test('It handles sparse lists', () => {
    // eslint-disable-next-line
    list = [{ allTodos: [] }, , { allUsers: [] }]
    list.push({ allComments: [], })

    expect(list[1]).toBeUndefined()
    expect(mergeDataList(list)).toEqual({
      allTodos: [],
      allUsers: [],
      allComments: [],
    })
  })

  test('It merges only objects', () => {
    // eslint-disable-next-line
    list = [
      { allComments: [], },
      'Foo',
      { allTodos: [], },
      [ 1, 2, ],,
      null,
      1,
      false,
    ]
    expect(mergeDataList(list)).toEqual({ allComments: [], allTodos: [], })
  })

  test('It returns nothing if the merged object is empty', () => {
    expect(mergeDataList([ null, {}, ])).toBeUndefined()
    expect(mergeDataList([ {}, ])).toBeUndefined()
    expect(mergeDataList([])).toBeUndefined()
  })
})
