import express, { type ErrorRequestHandler } from 'express'
import {
  deleteProfile,
  getProfile,
  initializeDatabase,
  insertProfile,
  listProfiles,
  updateProfileNames,
} from './db.js'
import { profileNameUpdateSchema, profileSchema } from './profileSchema.js'

export const app = express()

app.disable('x-powered-by')
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.get('/api/profiles', (_request, response) => {
  response.json(listProfiles())
})

app.get('/api/profiles/:id', (request, response) => {
  const profile = getProfile(request.params.id)
  if (!profile) {
    response.status(404).json({ error: 'Profile not found' })
    return
  }

  response.json(profile)
})

app.post('/api/profiles', (request, response) => {
  const parsed = profileSchema.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ error: 'Invalid input' })
    return
  }

  if (insertProfile(parsed.data) === 'conflict') {
    response.status(409).json({ error: 'Profile already exists' })
    return
  }

  response.status(201).json(parsed.data)
})

app.patch('/api/profiles/:id', (request, response) => {
  const parsed = profileNameUpdateSchema.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ error: 'Invalid input' })
    return
  }

  const profile = updateProfileNames(request.params.id, parsed.data)
  if (!profile) {
    response.status(404).json({ error: 'Profile not found' })
    return
  }

  response.json(profile)
})

app.delete('/api/profiles/:id', (request, response) => {
  if (!deleteProfile(request.params.id)) {
    response.status(404).json({ error: 'Profile not found' })
    return
  }

  response.status(204).send()
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

initializeDatabase()
