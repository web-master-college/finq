import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mapRandomUserResponse, parseProfileList } from '../lib/profiles'
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

  return {
    fetchedProfiles,
    savedProfiles,
    fetchStatus,
    historyStatus,
    fetchError,
    historyError,
    loadFetchedProfiles,
    loadSavedProfiles,
    profileById,
  }
})
