import { GraphQLError, } from 'graphql'
import { promiseBatch, } from '../promiseBatch'

const resetList = () => [
  Promise.resolve({ data: { allUsers: [], }, }),
  Promise.resolve({ data: { allTodos: [], }, }),
]

let list = resetList()

describe('promiseBatch', () => {
  test('Given a list of promises, it returns an object with merged `data` and `errors` props', async () => {
    expect.assertions(1)
    const data = await promiseBatch(list)

    expect(data).toEqual({ data: { allUsers: [], allTodos: [], }, })
  })

  test('If one of the promises rejects, the error is found under the `errors` prop', async () => {
    expect.assertions(1)
    list.push(Promise.reject(new GraphQLError('GraphQL error')))
    list.push(
      Promise.reject(
        new GraphQLError('allComments error', null, null, null, [ 'allComments', ])
      )
    )
    list.push(Promise.reject(new Error('Generic error')))

    const data = await promiseBatch(list)

    expect(data).toEqual({
      data: { allUsers: [], allTodos: [], },
      errors: {
        GraphQLError: [ { message: 'GraphQL error', }, ],
        Errors: [ expect.objectContaining({ message: 'Generic error', }), ],
        allComments: [ { message: 'allComments error', path: [ 'allComments', ], }, ],
      },
    })
  })

  test('If one of the promises resolves with anything other than an object, it will not be present in the returned object', async () => {
    expect.assertions(1)
    list = resetList()

    list.push(Promise.resolve('Foo'))
    list.push(Promise.resolve(null))
    list.push(Promise.resolve(1))
    list.push(Promise.resolve(false))
    list.push(Promise.resolve([ 1, ]))

    const data = await promiseBatch(list)

    expect(data).toEqual({
      data: { allUsers: [], allTodos: [], },
    })
  })
})
