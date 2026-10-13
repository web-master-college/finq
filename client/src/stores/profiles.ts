import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mapRandomUserResponse, parseProfile, parseProfileList } from '../lib/profiles'
import type { Profile } from '../types/profile'

const randomUserUrl = 'https://randomuser.me/api/?results=10'

export const useProfilesStore = defineStore('profiles', () => {
  const fetchedProfiles = ref<Profile[]>([])
  const savedProfiles = ref<Profile[]>([])
  const fetchStatus = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const historyStatus = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const fetchError = ref('')
  const historyError = ref('')
  let savedProfilesRequestId = 0

  async function loadFetchedProfiles(): Promise<void> {
    fetchStatus.value = 'loading'
    fetchError.value = ''

    try {
      const response = await fetch(randomUserUrl)
      if (!response.ok) {
        throw new Error('Random User request failed')
      }

      const profiles = mapRandomUserResponse(await response.json())
      if (!profiles || profiles.length !== 10) {
        throw new Error('Random User response was not usable')
      }

      fetchedProfiles.value = profiles
      fetchStatus.value = 'ready'
    } catch {
      fetchStatus.value = 'error'
      fetchError.value = 'Could not load profiles from Random User.'
    }
  }

  async function loadSavedProfiles(): Promise<void> {
    const requestId = ++savedProfilesRequestId
    historyStatus.value = 'loading'
    historyError.value = ''

    try {
      const response = await fetch('/api/profiles')
      if (!response.ok) {
        throw new Error('Saved profile request failed')
      }

      const profiles = parseProfileList(await response.json())
      if (!profiles) {
        throw new Error('Saved profile response was not usable')
      }

      if (requestId !== savedProfilesRequestId) {
        return
      }

      savedProfiles.value = profiles
      historyStatus.value = 'ready'
    } catch {
      if (requestId !== savedProfilesRequestId) {
        return
      }

      historyStatus.value = 'error'
      historyError.value = 'Could not load saved profiles.'
    }
  }

  function profileById(id: string): Profile | undefined {
    return (
      savedProfiles.value.find((profile) => profile.id === id) ??
      fetchedProfiles.value.find((profile) => profile.id === id)
    )
  }

  function isProfileSaved(id: string): boolean {
    return savedProfiles.value.some((profile) => profile.id === id)
  }

  function upsertSavedProfile(profile: Profile): void {
    const index = savedProfiles.value.findIndex((item) => item.id === profile.id)
    if (index === -1) {
      savedProfiles.value = [...savedProfiles.value, profile]
      return
    }

    const next = savedProfiles.value.slice()
    next[index] = profile
    savedProfiles.value = next
  }

  function replaceNames(
    profiles: Profile[],
    id: string,
    firstName: string,
    lastName: string,
  ): Profile[] {
    const index = profiles.findIndex((profile) => profile.id === id)
    if (index === -1) {
      return profiles
    }

    const next = profiles.slice()
    const current = next[index]
    if (!current) {
      return profiles
    }

    next[index] = { ...current, firstName, lastName }
    return next
  }

  async function readSavedProfile(id: string): Promise<Profile> {
    const response = await fetch(`/api/profiles/${encodeURIComponent(id)}`)
    if (!response.ok) {
      throw new Error('Could not load saved profile')
    }

    const profile = parseProfile(await response.json())
    if (!profile || profile.id !== id) {
      throw new Error('Could not load saved profile')
    }

    return profile
  }

  async function loadSavedProfile(id: string): Promise<'ready' | 'missing' | 'error'> {
    if (isProfileSaved(id)) {
      return 'ready'
    }

    try {
      const response = await fetch(`/api/profiles/${encodeURIComponent(id)}`)
      if (response.status === 404) {
        return profileById(id) ? 'ready' : 'missing'
      }
      if (!response.ok) {
        return profileById(id) ? 'ready' : 'error'
      }

      const profile = parseProfile(await response.json())
      if (!profile || profile.id !== id) {
        return profileById(id) ? 'ready' : 'error'
      }

      upsertSavedProfile(profile)
      return 'ready'
    } catch {
      return profileById(id) ? 'ready' : 'error'
    }
  }

  async function saveProfile(profile: Profile): Promise<void> {
    if (isProfileSaved(profile.id)) {
      return
    }

    const response = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(profile),
    })

    if (response.status === 409) {
      const saved = await readSavedProfile(profile.id)
      upsertSavedProfile(saved)
      fetchedProfiles.value = replaceNames(
        fetchedProfiles.value,
        saved.id,
        saved.firstName,
        saved.lastName,
      )
      return
    }

    if (!response.ok) {
      throw new Error('Could not save profile')
    }

    const saved = parseProfile(await response.json())
    if (!saved) {
      throw new Error('Could not save profile')
    }

    upsertSavedProfile(saved)
    fetchedProfiles.value = replaceNames(
      fetchedProfiles.value,
      saved.id,
      saved.firstName,
      saved.lastName,
    )
  }

  async function updateProfileName(id: string, firstName: string, lastName: string): Promise<void> {
    if (!isProfileSaved(id)) {
      if (!fetchedProfiles.value.some((profile) => profile.id === id)) {
        throw new Error('Profile not found')
      }

      fetchedProfiles.value = replaceNames(fetchedProfiles.value, id, firstName, lastName)
      return
    }

    const response = await fetch(`/api/profiles/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ firstName, lastName }),
    })

    if (!response.ok) {
      throw new Error('Could not update profile')
    }

    const updated = parseProfile(await response.json())
    if (!updated) {
      throw new Error('Could not update profile')
    }

    upsertSavedProfile(updated)
    fetchedProfiles.value = replaceNames(
      fetchedProfiles.value,
      id,
      updated.firstName,
      updated.lastName,
    )
  }

  async function deleteSavedProfile(id: string): Promise<void> {
    const response = await fetch(`/api/profiles/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!response.ok && response.status !== 404) {
      throw new Error('Could not delete profile')
    }

    savedProfiles.value = savedProfiles.value.filter((profile) => profile.id !== id)
  }

  return {
    fetchedProfiles,
    savedProfiles,
    fetchStatus,
    historyStatus,
    fetchError,
    historyError,
    loadFetchedProfiles,
    loadSavedProfiles,
    loadSavedProfile,
    saveProfile,
    updateProfileName,
    deleteSavedProfile,
    profileById,
    isProfileSaved,
  }
})
