# mi-causa

Promise based Fetch wrapper.

## Node js

```js
const { createHttp } = require('mi-causa')

/** @type {import('mi-causa').Config} */
const config = {
  baseURL: 'https://dummyjson.com'
}

const http = createHttp(config)

http
  .get('/posts/1')
  .then((response) => response.json())
  .then((data) => {
    console.log(data)
  })
```

## Typescript

```ts
import { createHttp, type Config } from 'mi-causa'

const config: Config = {
  baseURL: 'https://dummyjson.com/'
}

let api = createHttp(config)

api
  .get('/products')
  .then((data) => data.json())
  .then((data) => console.log(data))
```
