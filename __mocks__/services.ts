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
  http.get('https://wildertrujillo.com/api/user', () => {
    return HttpResponse.json({
      id: 123,
      firstName: 'Wilder',
      lastName: 'Trujillo'
    })
  })
]

export const server = setupServer(...handlers)
