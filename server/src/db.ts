import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Profile, ProfileNameUpdate } from './profileSchema.js'

type ProfileRow = {
  id: string
  title: string
  first_name: string
  last_name: string
  gender: string
  country: string
  phone: string
  email: string
  age: number
  birth_year: number
  street_number: number
  street_name: string
  city: string
  state: string
  postcode: string
  thumbnail_url: string
  large_image_url: string
}

const defaultDatabasePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../data/profiles.sqlite',
)

let database: Database.Database | undefined

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    title: row.title,
    firstName: row.first_name,
    lastName: row.last_name,
    gender: row.gender,
    country: row.country,
    phone: row.phone,
    email: row.email,
    age: row.age,
    birthYear: row.birth_year,
    streetNumber: row.street_number,
    streetName: row.street_name,
    city: row.city,
    state: row.state,
    postcode: row.postcode,
    thumbnailUrl: row.thumbnail_url,
    largeImageUrl: row.large_image_url,
  }
}

function connection(): Database.Database {
  if (!database) {
    throw new Error('Database has not been initialized')
  }

  return database
}

function isPrimaryKeyConflict(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false
  }

  return error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' || error.code === 'SQLITE_CONSTRAINT_UNIQUE'
}

export function initializeDatabase(): void {
  if (database) {
    return
  }

  const databasePath = process.env.DATABASE_PATH ?? defaultDatabasePath
  mkdirSync(path.dirname(databasePath), { recursive: true })

  const opened = new Database(databasePath)
  opened.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      gender TEXT NOT NULL,
      country TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      age INTEGER NOT NULL,
      birth_year INTEGER NOT NULL,
      street_number INTEGER NOT NULL,
      street_name TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      postcode TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      large_image_url TEXT NOT NULL
    )
  `)
  database = opened
}

export function listProfiles(): Profile[] {
  const rows = connection()
    .prepare(
      `SELECT id, title, first_name, last_name, gender, country, phone, email, age, birth_year,
              street_number, street_name, city, state, postcode, thumbnail_url, large_image_url
       FROM profiles
       ORDER BY rowid`,
    )
    .all() as ProfileRow[]

  return rows.map(mapProfile)
}

export function getProfile(id: string): Profile | undefined {
  const row = connection()
    .prepare(
      `SELECT id, title, first_name, last_name, gender, country, phone, email, age, birth_year,
              street_number, street_name, city, state, postcode, thumbnail_url, large_image_url
       FROM profiles
       WHERE id = ?`,
    )
    .get(id) as ProfileRow | undefined

  return row ? mapProfile(row) : undefined
}

export function insertProfile(profile: Profile): 'created' | 'conflict' {
  try {
    connection()
      .prepare(
        `INSERT INTO profiles (
           id, title, first_name, last_name, gender, country, phone, email, age, birth_year,
           street_number, street_name, city, state, postcode, thumbnail_url, large_image_url
         ) VALUES (
           @id, @title, @firstName, @lastName, @gender, @country, @phone, @email, @age, @birthYear,
           @streetNumber, @streetName, @city, @state, @postcode, @thumbnailUrl, @largeImageUrl
         )`,
      )
      .run(profile)
    return 'created'
  } catch (error) {
    if (isPrimaryKeyConflict(error)) {
      return 'conflict'
    }

    throw error
  }
}

export function updateProfileNames(id: string, names: ProfileNameUpdate): Profile | undefined {
  const existing = getProfile(id)
  if (!existing) {
    return undefined
  }

  const firstName = names.firstName ?? existing.firstName
  const lastName = names.lastName ?? existing.lastName

  connection()
    .prepare('UPDATE profiles SET first_name = ?, last_name = ? WHERE id = ?')
    .run(firstName, lastName, id)

  return { ...existing, firstName, lastName }
}

export function deleteProfile(id: string): boolean {
  const result = connection().prepare('DELETE FROM profiles WHERE id = ?').run(id)
  return result.changes > 0
}

export function closeDatabase(): void {
  if (!database) {
    return
  }

  database.close()
  database = undefined
}
