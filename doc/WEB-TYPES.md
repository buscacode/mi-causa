# INFORMACIÓN SOBRE SCHEMAS Y TYPES DE LA WEB
tipos de datos a averiguar y en futuro aplicarlos

## BODY INIT

Tiene referencia con la interface `RequestInit`

```ts
type BodyInit = ReadableStream | XMLHttpRequestBodyInit;
type XMLHttpRequestBodyInit = Blob | BufferSource | FormData | URLSearchParams | string;

type HeadersInit = string[][] | Record<string, string | ReadonlyArray<string>> | Headers
```
