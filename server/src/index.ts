import express, { type ErrorRequestHandler } from 'express'

const app = express()
const port = 3000

app.disable('x-powered-by')
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.use((_request, response) => {
  response.status(404).json({ error: 'Not found' })
})

function isMalformedJson(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    error.type === 'entity.parse.failed'
  )
}

function readErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined
  }

  const candidate =
    'status' in error && typeof error.status === 'number'
      ? error.status
      : 'statusCode' in error && typeof error.statusCode === 'number'
        ? error.statusCode
        : undefined

  if (candidate === undefined || !Number.isInteger(candidate)) {
    return undefined
  }

  if (candidate < 400 || candidate > 599) {
    return undefined
  }

  return candidate
}

const handleError: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error)

  if (response.headersSent) {
    return
  }

  const status = isMalformedJson(error) ? 400 : (readErrorStatus(error) ?? 500)

  response.status(status).json({
    error: status >= 500 ? 'Internal server error' : 'Bad request',
  })
}

app.use(handleError)

const server = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})

server.on('error', (error) => {
  console.error(error)
  process.exit(1)
})
