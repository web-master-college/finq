import { createPinia, setActivePinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Profile } from '../types/profile'
import { useProfilesStore } from './profiles'

const profile: Profile = {
  id: '8c2f6a10-4b7e-4d2a-8f31-9a0b1c2d3e4f',
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
}

describe('loadSavedProfile when the backend is unavailable', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps a fetched profile viewable and unsaved when the lookup fails', async () => {
    setActivePinia(createPinia())
    const store = useProfilesStore()
    store.fetchedProfiles = [profile]

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      }),
    )
    await expect(store.loadSavedProfile(profile.id)).resolves.toBe('ready')

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ error: 'unavailable' }, { status: 500 })),
    )
    await expect(store.loadSavedProfile(profile.id)).resolves.toBe('ready')

    expect(store.isProfileSaved(profile.id)).toBe(false)
    expect(store.profileById(profile.id)).toEqual(profile)
  })

  it('returns an error when the lookup fails and no fetched copy exists', async () => {
    setActivePinia(createPinia())
    const store = useProfilesStore()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ error: 'unavailable' }, { status: 500 })),
    )

    await expect(store.loadSavedProfile(profile.id)).resolves.toBe('error')
    expect(store.isProfileSaved(profile.id)).toBe(false)
    expect(store.profileById(profile.id)).toBeUndefined()
  })
})
