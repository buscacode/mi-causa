import { HttpResponseError } from '@/app'
import type { HttpInstance } from '@/index'
import { createHttp } from '@/index'
import { server } from '__mocks__/services'
import { readFileSync } from 'fs'

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

  test('should work the interceptor request', async () => {
    server.use(
      rest.put('https://buscacode.com/api/validate', async ({ request }) => {
        const body = await request.json()
        const authorization = request.headers.get('Authorization-token')
        return HttpResponse.json({ body, authorization })
      })
    )

    http = createHttp({ baseURL: 'https://buscacode.com/api' })
    const tokenController = (() => {
      let token: string | undefined

      return {
        getToken: () => token,
        setToken: (newToken: string) => {
          token = newToken
        }
      }
    })()

    const interceptor0 = http.interceptors.request.use((config) => {
      const data = config.data
      if (data !== null && typeof data !== 'string') {
        config.data = { ...data, token: 123 }
      }

      return config
    })

    const interceptor1 = http.interceptors.request.use((config) => {
      const headers = config.headers
      const token = tokenController.getToken()
      headers.set('Authorization-token', `Bearer ${token}`)
      return config
    })

    const interceptor2 = http.interceptors.request.use((config) => {
      const data = config.data
      if (data !== null && typeof data !== 'string') {
        config.data = { ...data, interceptor: 'interceptor2' }
      }

      return config
    })

    const interceptor3 = http.interceptors.response.use(null, (error) => {
      return error
    })

    expect(interceptor0).toBe(0)
    expect(interceptor1).toBe(1)
    expect(interceptor2).toBe(2)
    expect(interceptor3).toBe(0)

    const response = await http.put('/validate', { dni: 11111111 })
    const data = await response.json()

    expect(data.body.token).toBe(123)
    expect(data.authorization).toBe('Bearer undefined')

    tokenController.setToken('token')
    const response2 = await http.patch('https://buscacode.com/user', {
      dni: 22222222
    })
    const data2 = await response2.json()
    expect(data2.body.token).toBe(123)
    expect(data2.body.dni).toBe(22222222)
    expect(data2.body.interceptor).toBe('interceptor2')
    expect(data2.authorization).toBe('Bearer token')

    tokenController.setToken('abc')
    let response3: Response | undefined
    let capturedError: Error | undefined
    try {
      response3 = await http.patch('https://buscacode.com/user', {
        dni: 22222222
      })
    } catch (error) {
      capturedError = error as Error
      if (error instanceof HttpResponseError) {
        response3 = error.response
      }
    }

    if (response3 === undefined) throw Error('Without Response')
    const data3 = await response3.json()
    expect(data3.message).toBe('Not Authenticated')
    expect(capturedError).toBeDefined()
    expect(capturedError).instanceOf(HttpResponseError)

    tokenController.setToken('token')
    http.interceptors.request.eject(interceptor2)
    const response4 = await http.patch('https://buscacode.com/user', {
      dni: 22222222
    })
    const data4 = await response4.json()
    expect(data4.body.interceptor).not.toBeDefined()
    expect(data4.authorization).toBe('Bearer token')
  })

  test('should work the interceptor request with async function', async () => {
    server.use(
      rest.put(
        'https://buscacode.com/api/validate-async',
        async ({ request }) => {
          const body = await request.json()
          const authorization = request.headers.get('Authorization-token')
          return HttpResponse.json({ body, authorization })
        }
      )
    )

    http = createHttp({ baseURL: 'https://buscacode.com/api' })
    const tokenController = (() => {
      let token: string | undefined
      const wait = <T>(value: T, time = 100) =>
        new Promise<T>((resolve) => {
          setTimeout(() => resolve(value), time)
        })
      return {
        getToken: () => token,
        getAsyncToken: () => wait(token),
        setToken: (newToken: string) => {
          token = newToken
        }
      }
    })()

    const interceptor0 = http.interceptors.request.use(async (config) => {
      const headers = config.headers
      const token = await tokenController.getAsyncToken()
      headers.set('Authorization-token', `Bearer ${token}`)
      return config
    })

    expect(interceptor0).toBe(0)

    tokenController.setToken('token_123')
    const response = await http.put('/validate-async', {
      dni: 33333333
    })
    const data2 = await response.json()
    expect(data2.body.dni).toBe(33333333)
    expect(data2.authorization).toBe('Bearer token_123')

    tokenController.setToken('abc')
    let response2: Response | undefined
    let capturedError: Error | undefined
    try {
      response2 = await http.patch('https://buscacode.com/user', {
        dni: 22222222
      })
    } catch (error) {
      capturedError = error as Error
      if (error instanceof HttpResponseError) {
        response2 = error.response
      }
    }

    if (response2 === undefined) throw Error('Without Response')
    const data3 = await response2.json()
    expect(data3.message).toBe('Not Authenticated')
    expect(capturedError).toBeDefined()
    expect(capturedError).instanceOf(HttpResponseError)
  })

  test('should be able to send form data with file', async () => {
    server.use(
      rest.post('https://buscacode.com/api/file', async ({ request }) => {
        const body = await request.formData()
        const file = body.get('the_file') as File
        if (file === null)
          return HttpResponse.json({ message: 'no file' }, { status: 400 })
        return HttpResponse.json({ body: Object(body) })
      })
    )

    const filePath = './doc/overlay.png'
    const fileBuffer = readFileSync(filePath)
    /* const bobFile = new Blob([fileBuffer], {
      type: 'image/png'
    }) */
    const file = new File([fileBuffer], 'OVERLAY.png', { type: 'image/png' })

    const formData = new FormData()
    formData.append('id', '3')
    formData.append('name', 'name_data')
    formData.append('the_file', file)
    let response: Response | undefined = undefined
    let capturedError: Error | undefined

    try {
      response = await http.post('/api/file', formData)
    } catch (error) {
      capturedError = error as Error
      if (error instanceof HttpResponseError) {
        response = error.response
      }
    }

    if (response === undefined) throw Error('Without Response')
    const data = await response.json()
    expect(data).toBeDefined()
    expect(capturedError).not.toBeDefined()
  })
})
