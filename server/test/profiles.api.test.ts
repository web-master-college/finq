import { mkdtempSync, rmSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { closeDatabase } from '../src/db.js'

const databaseDirectory = mkdtempSync(path.join(tmpdir(), 'finq-api-'))
process.env.DATABASE_PATH = path.join(databaseDirectory, 'profiles.sqlite')

type ProfileInput = {
  id: string
  title: string
  firstName: string
  lastName: string
  gender: string
  country: string
  phone: string
  email: string
  age: number
  birthYear: number
  streetNumber: number
  streetName: string
  city: string
  state: string
  postcode: string
  thumbnailUrl: string
  largeImageUrl: string
}

function profile(id: string, overrides: Partial<ProfileInput> = {}): ProfileInput {
  return {
    id,
    title: 'Ms',
    firstName: 'Ada',
    lastName: 'Lovelace',
    gender: 'female',
    country: 'United Kingdom',
    phone: '01632 960000',
    email: 'ada@example.com',
    age: 36,
    birthYear: 1990,
    streetNumber: 12,
    streetName: 'Queen Street',
    city: 'London',
    state: 'England',
    postcode: 'EC1A',
    thumbnailUrl: 'https://example.com/ada-thumb.jpg',
    largeImageUrl: 'https://example.com/ada.jpg',
    ...overrides,
  }
}

let server: Server | undefined
let baseUrl = ''

beforeAll(async () => {
  const { app } = await import('../src/app.js')
  server = createServer(app)
  await new Promise<void>((resolve) => {
    server?.listen(0, '127.0.0.1', () => resolve())
  })
  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Test server did not bind to a port')
  }
  baseUrl = `http://127.0.0.1:${address.port}`
})

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => (error ? reject(error) : resolve()))
    })
  }
  closeDatabase()
  rmSync(databaseDirectory, { recursive: true, force: true })
})

async function send(
  pathname: string,
  init?: RequestInit,
): Promise<{ status: number; body: unknown }> {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...init?.headers,
    },
  })
  const text = await response.text()
  return { status: response.status, body: text ? (JSON.parse(text) as unknown) : null }
}

describe('profile API', () => {
  it('creates a profile and persists it', async () => {
    const input = profile('eec47389-f03a-4aa2-bad3-9db8eca82a85')

    const created = await send('/api/profiles', { method: 'POST', body: JSON.stringify(input) })
    const listed = await send('/api/profiles')
    const fetched = await send(`/api/profiles/${input.id}`)

    expect(created.status).toBe(201)
    expect(created.body).toEqual(input)
    expect(listed.status).toBe(200)
    expect(listed.body).toContainEqual(input)
    expect(fetched.status).toBe(200)
    expect(fetched.body).toEqual(input)
  })

  it('returns 404 when a profile does not exist', async () => {
    const response = await send('/api/profiles/48f35deb-562e-4ea6-a1af-37b33b684eb1')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Profile not found' })
  })

  it('updates a profile name and keeps the change', async () => {
    const input = profile('5e46b49b-48f3-4d51-a557-2157faa1b7a4', { email: 'grace@example.com' })
    await send('/api/profiles', { method: 'POST', body: JSON.stringify(input) })

    const updated = await send(`/api/profiles/${input.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ firstName: 'Grace', lastName: 'Hopper' }),
    })
    const fetched = await send(`/api/profiles/${input.id}`)

    expect(updated.status).toBe(200)
    expect(updated.body).toEqual({ ...input, firstName: 'Grace', lastName: 'Hopper' })
    expect(fetched.body).toEqual({ ...input, firstName: 'Grace', lastName: 'Hopper' })
  })

  it('returns 404 when updating a profile that does not exist', async () => {
    const response = await send('/api/profiles/af6e1238-eaca-4f23-a7fd-9a4761439df5', {
      method: 'PATCH',
      body: JSON.stringify({ firstName: 'Grace' }),
    })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Profile not found' })
  })

  it('deletes a profile so it can no longer be retrieved', async () => {
    const input = profile('30a3bcbd-1120-40d9-98c6-f8176e596bbe', { email: 'delete@example.com' })
    await send('/api/profiles', { method: 'POST', body: JSON.stringify(input) })

    const deleted = await send(`/api/profiles/${input.id}`, { method: 'DELETE' })
    const fetched = await send(`/api/profiles/${input.id}`)

    expect(deleted.status).toBe(204)
    expect(deleted.body).toBeNull()
    expect(fetched.status).toBe(404)
  })

  it('returns 404 when deleting a profile that does not exist', async () => {
    const response = await send('/api/profiles/ff1b81e0-3a17-404a-8da1-01ae3808f0ae', {
      method: 'DELETE',
    })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Profile not found' })
  })

  it('returns 400 for an incomplete profile', async () => {
    const response = await send('/api/profiles', { method: 'POST', body: JSON.stringify({}) })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Invalid input' })
  })

  it('returns 400 for an invalid profile', async () => {
    const input = profile('ecddb743-9780-44a9-87b0-514f6bcab58e', {
      email: 'not-an-email',
      thumbnailUrl: 'ftp://example.com/ada.jpg',
    })
    const response = await send('/api/profiles', { method: 'POST', body: JSON.stringify(input) })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Invalid input' })
  })

  it('returns 400 for an invalid name update', async () => {
    const input = profile('a9f6bd1b-b0d1-4a66-9fc6-891e49291a2c', { email: 'patch@example.com' })
    await send('/api/profiles', { method: 'POST', body: JSON.stringify(input) })

    const response = await send(`/api/profiles/${input.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ firstName: '   ' }),
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Invalid input' })
  })

  it('returns 409 when a profile id already exists', async () => {
    const input = profile('910d0855-7941-4bac-8f21-1b06d850dcd2', { email: 'conflict@example.com' })
    const created = await send('/api/profiles', { method: 'POST', body: JSON.stringify(input) })
    const conflict = await send('/api/profiles', { method: 'POST', body: JSON.stringify(input) })

    expect(created.status).toBe(201)
    expect(conflict.status).toBe(409)
    expect(conflict.body).toEqual({ error: 'Profile already exists' })
  })
})
