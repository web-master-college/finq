import { describe, expect, it } from 'vitest'
import { filterProfiles, mapRandomUserResponse } from './profiles'
import type { Profile } from '../types/profile'

function profile(overrides: Partial<Profile>): Profile {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    title: 'Ms',
    firstName: 'Ada',
    lastName: 'Lovelace',
    gender: 'female',
    country: 'Ireland',
    phone: '01632 960000',
    email: 'ada@example.com',
    age: 36,
    birthYear: 1990,
    streetNumber: 12,
    streetName: 'Queen Street',
    city: 'Dublin',
    state: 'Leinster',
    postcode: 'D02',
    thumbnailUrl: 'https://example.com/ada-thumb.jpg',
    largeImageUrl: 'https://example.com/ada.jpg',
    ...overrides,
  }
}

function randomUser(index: number): Record<string, unknown> {
  return {
    gender: 'female',
    name: { title: 'Ms', first: 'Ada', last: 'Lovelace' },
    location: {
      street: { number: index === 1 ? '24' : 12, name: 'Queen Street' },
      city: 'London',
      state: 'England',
      country: 'United Kingdom',
      postcode: index === 2 ? 90210 : 'EC1A',
    },
    email: `ada${index}@example.com`,
    phone: '01632 960000',
    login: { uuid: `8c2f6a10-4b7e-4d2a-8f31-9a0b1c2d3e4${index.toString(16)}` },
    dob: { date: '1990-06-15T00:00:00.000Z', age: 36 },
    picture: {
      thumbnail: 'https://example.com/ada-thumb.jpg',
      large: 'https://example.com/ada.jpg',
    },
  }
}

const savedProfiles = [
  profile({
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    firstName: 'José',
    lastName: 'García',
    country: 'México',
    email: 'jose@example.com',
  }),
  profile({
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    title: 'Mr',
    firstName: 'Ada',
    lastName: 'Lovelace',
    country: 'Ireland',
    email: 'ada@example.com',
  }),
]

describe('mapRandomUserResponse', () => {
  it('maps a Random User result onto a profile', () => {
    const profiles = mapRandomUserResponse({ results: [randomUser(0)] })

    expect(profiles).toEqual([
      {
        id: '8c2f6a10-4b7e-4d2a-8f31-9a0b1c2d3e40',
        title: 'Ms',
        firstName: 'Ada',
        lastName: 'Lovelace',
        gender: 'female',
        country: 'United Kingdom',
        phone: '01632 960000',
        email: 'ada0@example.com',
        age: 36,
        birthYear: 1990,
        streetNumber: 12,
        streetName: 'Queen Street',
        city: 'London',
        state: 'England',
        postcode: 'EC1A',
        thumbnailUrl: 'https://example.com/ada-thumb.jpg',
        largeImageUrl: 'https://example.com/ada.jpg',
      },
    ])
  })

  it('accepts a batch of exactly 10 profiles', () => {
    const profiles = mapRandomUserResponse({
      results: Array.from({ length: 10 }, (_, index) => randomUser(index)),
    })

    expect(profiles).toHaveLength(10)
    expect(profiles?.[1]?.streetNumber).toBe(24)
    expect(profiles?.[2]?.postcode).toBe('90210')
    expect(profiles?.map((item) => item.birthYear)).toEqual(Array(10).fill(1990))
  })

  it('rejects a malformed response', () => {
    expect(mapRandomUserResponse(null)).toBeUndefined()
    expect(mapRandomUserResponse({})).toBeUndefined()
    expect(mapRandomUserResponse({ results: 'ten' })).toBeUndefined()
  })

  it('rejects a result that is missing a required field', () => {
    const result = randomUser(0)
    delete result.email

    expect(mapRandomUserResponse({ results: [result] })).toBeUndefined()
  })

  it('rejects a batch when one profile is invalid', () => {
    const results = Array.from({ length: 10 }, (_, index) => randomUser(index))
    results[4] = { gender: 'female' }

    expect(mapRandomUserResponse({ results })).toBeUndefined()
  })
})

describe('filterProfiles', () => {
  it('matches a first name, last name, or country', () => {
    expect(filterProfiles(savedProfiles, 'José').map((item) => item.firstName)).toEqual(['José'])
    expect(filterProfiles(savedProfiles, 'Lovelace').map((item) => item.lastName)).toEqual([
      'Lovelace',
    ])
    expect(filterProfiles(savedProfiles, 'Ireland').map((item) => item.country)).toEqual([
      'Ireland',
    ])
  })

  it('matches without case or accents', () => {
    expect(filterProfiles(savedProfiles, 'ada').map((item) => item.firstName)).toEqual(['Ada'])
    expect(filterProfiles(savedProfiles, 'jose').map((item) => item.firstName)).toEqual(['José'])
    expect(filterProfiles(savedProfiles, 'mexico').map((item) => item.country)).toEqual(['México'])
    expect(filterProfiles(savedProfiles, 'GARCÍA').map((item) => item.lastName)).toEqual(['García'])
  })

  it('returns every profile for an empty search and none when nothing matches', () => {
    expect(filterProfiles(savedProfiles, '')).toEqual(savedProfiles)
    expect(filterProfiles(savedProfiles, '   ')).toEqual(savedProfiles)
    expect(filterProfiles(savedProfiles, 'nowhere')).toEqual([])
  })
})
