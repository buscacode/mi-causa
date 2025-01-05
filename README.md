# mi-causa

Promise based Fetch wrapper.

## Node js

```js
const { http } = require('mi-causa')

const config = {
  baseURL: 'https://dummyjson.com'
}

let api = http.create(config)

api
  .get('/products')
  .then((data) => data.json())
  .then((data) => console.log(data))
```

## Typescript

```ts
import http, { type Config } from 'mi-causa'

const config: Config = {
  baseURL: 'https://dummyjson.com/'
}

let api = http.create(config)

api
  .get('/products')
  .then((data) => data.json())
  .then((data) => console.log(data))
```
