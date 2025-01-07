import { HttpResponseError } from '@/app'
import type { HttpInstance } from '@/app/http'
import { createHttp } from '@/app/http'
import { server } from '__mocks__/services'
import { HttpResponse, http as rest } from 'msw'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test
} from 'vitest'

describe('Http file', () => {
  let http: HttpInstance

  beforeAll(() => {
    server.listen()
  })

  beforeEach(() => {
    http = createHttp({ baseURL: 'https://buscacode.com' })
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  test('should import correctly', () => {
    expect(createHttp).toBeDefined()
  })

  test('should be created an http instance', () => {
    expect(http.get).toBeDefined()
    expect(http.post).toBeDefined()
    expect(http.put).toBeDefined()
    expect(http.patch).toBeDefined()
    expect(http.delete).toBeDefined()
  })

  test('should get a response from get', async () => {
    const response = await http.get('/user')
    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.id).toBeDefined()
  })

  test('should get a response only with authorization header', async () => {
    server.use(
      rest.get('https://buscacode.com/api/resource', ({ request }) => {
        const token = request.headers.get('Authorization-token')

        if (token !== 'Bearer token') {
          return HttpResponse.json(
            { message: 'Not Authenticated' },
            { status: 401 }
          )
        }
        return HttpResponse.json({ resource: 'the resource' })
      })
    )

    let response: Response | undefined
    try {
      response = await http.get('/api/resource', {
        headers: {
          'authorization-token': 'Bearer token'
        }
      })
    } catch (error) {
      if (error instanceof HttpResponseError) {
        response = error.response
      }
    }
    if (response === undefined) throw Error('Without Response')
    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.message).not.toBe('Not Authenticated')
    expect(data.resource).toBe('the resource')

    http = createHttp({ baseURL: 'https://buscacode.com/api' })
    let response2: Response | undefined
    try {
      response2 = await http.get('/resource')
    } catch (error) {
      if (error instanceof HttpResponseError) {
        response2 = error.response
      }
    }

    if (response2 === undefined) throw Error('Without Response')
    const data2 = await response2.json()
    expect(response2.ok).toBe(false)
    expect(response2.status).toBe(401)
    expect(response2.statusText).toBe('Unauthorized')
    expect(data2.message).toBe('Not Authenticated')
  })

  test('should abort a request', async () => {
    server.use(
      rest.get('https://buscacode.com/api/wait', async ({ request }) => {
        const url = new URL(request.url)
        const time = Number(url.searchParams.get('time'))
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(null)
          }, time)
        })
        return HttpResponse.json({ message: 'the end' })
      })
    )

    const controller = new AbortController()
    const signal = controller.signal

    setTimeout(() => {
      controller.abort()
    }, 100)

    let response: Response | undefined
    let capturedError: Error | undefined
    try {
      response = await http.get('/api/wait?time=4000', { signal })
    } catch (error) {
      capturedError = error as Error
      if (error instanceof HttpResponseError) {
        response = error.response
      }
    }

    expect(response).toBeUndefined()
    expect(capturedError).toBeDefined()
    expect(capturedError?.name).toBe('AbortError')
  })

  test('should recibe a response from post', async () => {
    server.use(
      rest.post('https://buscacode.com/api/greetings', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ body })
      })
    )

    const response = await http.post('/api/greetings', { name: 'John Doe' })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.body).toStrictEqual({ name: 'John Doe' })
  })

  test('should post and recibe a success response only with access token and path id', async () => {
    server.use(
      rest.post(
        'https://buscacode.com/api/user/:userId/pet',
        ({ request, params }) => {
          const token = request.headers.get('Authorization-token')

          if (token !== 'Bearer token') {
            return HttpResponse.json(
              { message: 'Not Authenticated' },
              { status: 401 }
            )
          }

          const userId = Number(params.userId)
          if (userId !== 1) {
            return HttpResponse.json(
              { message: 'Bad user id' },
              { status: 400 }
            )
          }

          return HttpResponse.json({ userId })
        }
      )
    )

    let response: Response | undefined
    try {
      response = await http.post(
        '/api/user/1/pet',
        {
          name: 'ばつ',
          type: '猫'
        },
        {
          headers: {
            'authorization-token': 'Bearer token'
          }
        }
      )
    } catch (error) {
      if (error instanceof HttpResponseError) {
        response = error.response
      }
    }
    if (response === undefined) throw Error('Without Response')
    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.userId).toBe(1)

    response = undefined
    try {
      response = await http.post('https://buscacode.com/api/user/2/pet', null, {
        headers: {
          'authorization-token': 'Bearer token'
        }
      })
    } catch (error) {
      if (error instanceof HttpResponseError) {
        response = error.response
      }
    }

    if (response === undefined) throw Error('Without Response')
    const data2 = await response.json()
    expect(response.ok).toBe(false)
    expect(response.status).toBe(400)
    expect(response.statusText).toBe('Bad Request')
    expect(data2.message).toBe('Bad user id')

    response = undefined
    try {
      response = await http.post('https://buscacode.com/api/user/2/pet', null, {
        headers: {
          'authorization-token': 'Bearer 123'
        }
      })
    } catch (error) {
      if (error instanceof HttpResponseError) {
        response = error.response
      }
    }

    if (response === undefined) throw Error('Without Response')
    const data3 = await response.json()
    expect(response.ok).toBe(false)
    expect(response.status).toBe(401)
    expect(response.statusText).toBe('Unauthorized')
    expect(data3.message).toBe('Not Authenticated')
  })
})
