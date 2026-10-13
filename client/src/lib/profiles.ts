import type { Profile } from '../types/profile'

export function profileFullName(profile: Profile): string {
  return `${profile.title} ${profile.firstName} ${profile.lastName}`
}

function normalizeSearchText(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

export function filterProfiles(profiles: Profile[], query: string): Profile[] {
  const term = normalizeSearchText(query.trim())
  if (!term) {
    return profiles
  }

  return profiles.filter((profile) => {
    const name = normalizeSearchText(profileFullName(profile))
    const country = normalizeSearchText(profile.country)
    return name.includes(term) || country.includes(term)
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function requiredText(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function addressText(value: unknown): string {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

function integer(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) ? value : undefined
}

function streetNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
    return value
  }

  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    return Number(value.trim())
  }

  return undefined
}

function postcode(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  if (typeof value === 'string') {
    return value.trim()
  }

  if (value === null || value === undefined) {
    return ''
  }

  return undefined
}

function httpUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return /^https?:\/\//i.test(trimmed) ? trimmed : undefined
}

function birthYear(value: unknown): number | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.getUTCFullYear()
}

export function parseProfile(value: unknown): Profile | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const id = requiredText(value.id)
  const title = requiredText(value.title)
  const firstName = requiredText(value.firstName)
  const lastName = requiredText(value.lastName)
  const gender = requiredText(value.gender)
  const phone = requiredText(value.phone)
  const email = requiredText(value.email)
  const age = integer(value.age)
  const year = integer(value.birthYear)
  const number = streetNumber(value.streetNumber)
  const thumbnailUrl = httpUrl(value.thumbnailUrl)
  const largeImageUrl = httpUrl(value.largeImageUrl)
  const code = typeof value.postcode === 'string' ? value.postcode : undefined

  if (
    !id ||
    !title ||
    !firstName ||
    !lastName ||
    !gender ||
    !phone ||
    !email ||
    age === undefined ||
    year === undefined ||
    number === undefined ||
    !thumbnailUrl ||
    !largeImageUrl ||
    code === undefined ||
    typeof value.country !== 'string' ||
    typeof value.streetName !== 'string' ||
    typeof value.city !== 'string' ||
    typeof value.state !== 'string'
  ) {
    return undefined
  }

  return {
    id,
    title,
    firstName,
    lastName,
    gender,
    country: value.country,
    phone,
    email,
    age,
    birthYear: year,
    streetNumber: number,
    streetName: value.streetName,
    city: value.city,
    state: value.state,
    postcode: code,
    thumbnailUrl,
    largeImageUrl,
  }
}

export function parseProfileList(value: unknown): Profile[] | undefined {
  if (!Array.isArray(value)) {
    return undefined
  }

  const profiles: Profile[] = []
  for (const item of value) {
    const profile = parseProfile(item)
    if (!profile) {
      return undefined
    }
    profiles.push(profile)
  }

  return profiles
}

function mapRandomUser(value: unknown): Profile | undefined {
  if (!isRecord(value) || !isRecord(value.name) || !isRecord(value.location)) {
    return undefined
  }

  const street = value.location.street
  const login = value.login
  const dob = value.dob
  const picture = value.picture
  if (!isRecord(street) || !isRecord(login) || !isRecord(dob) || !isRecord(picture)) {
    return undefined
  }

  const id = requiredText(login.uuid)
  const title = requiredText(value.name.title)
  const firstName = requiredText(value.name.first)
  const lastName = requiredText(value.name.last)
  const gender = requiredText(value.gender)
  const phone = requiredText(value.phone)
  const email = requiredText(value.email)
  const age = integer(dob.age)
  const year = birthYear(dob.date)
  const number = streetNumber(street.number)
  const thumbnailUrl = httpUrl(picture.thumbnail)
  const largeImageUrl = httpUrl(picture.large)
  const code = postcode(value.location.postcode)

  if (
    !id ||
    !title ||
    !firstName ||
    !lastName ||
    !gender ||
    !phone ||
    !email ||
    age === undefined ||
    year === undefined ||
    number === undefined ||
    !thumbnailUrl ||
    !largeImageUrl ||
    code === undefined
  ) {
    return undefined
  }

  return {
    id,
    title,
    firstName,
    lastName,
    gender,
    country: addressText(value.location.country),
    phone,
    email,
    age,
    birthYear: year,
    streetNumber: number,
    streetName: addressText(street.name),
    city: addressText(value.location.city),
    state: addressText(value.location.state),
    postcode: code,
    thumbnailUrl,
    largeImageUrl,
  }
}

export function mapRandomUserResponse(value: unknown): Profile[] | undefined {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    return undefined
  }

  const profiles: Profile[] = []
  for (const result of value.results) {
    const profile = mapRandomUser(result)
    if (!profile) {
      return undefined
    }
    profiles.push(profile)
  }

  return profiles
}
