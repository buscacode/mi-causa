import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const handlers = [
  http.get('https://buscacode.com/user', () => {
    return HttpResponse.json({
      id: 123,
      firstName: 'Wilder',
      lastName: 'Trujillo'
    })
  }),
  http.patch('https://buscacode.com/user', async ({ request }) => {
    const token = request.headers.get('Authorization-token')

    if (token !== 'Bearer token') {
      return HttpResponse.json(
        { message: 'Not Authenticated' },
        { status: 401 }
      )
    }

    const body = (await request.json()) as Record<string, string>

    return HttpResponse.json({
      body: {
        id: 123,
        firstName: 'Wilder',
        lastName: 'Trujillo',
        ...body
      },
      authorization: token
    })
  }),
  http.get('https://wildertrujillo.com/api/user', () => {
    return HttpResponse.json({
      id: 123,
      firstName: 'Wilder',
      lastName: 'Trujillo'
    })
  })
]

export const server = setupServer(...handlers)
