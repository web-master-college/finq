// @vitest-environment happy-dom

import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { useProfilesStore } from '../stores/profiles'
import type { Profile } from '../types/profile'
import ProfileView from './ProfileView.vue'

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

const requests: Array<{ url: string; method: string }> = []

describe('ProfileView save and delete', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    Reflect.deleteProperty(window, 'confirm')
    requests.length = 0
  })

  it('requires confirmation when Delete is clicked after a successful Save', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useProfilesStore()
    store.fetchedProfiles = [profile]

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        const method = init?.method ?? 'GET'
        requests.push({ url, method })

        if (method === 'POST' && url === '/api/profiles') {
          return Response.json(profile, { status: 201 })
        }

        if (method === 'GET') {
          return Response.json({ error: 'Profile not found' }, { status: 404 })
        }

        return Response.json({ error: 'Unexpected request' }, { status: 500 })
      }),
    )
    const confirm = vi.fn(() => false)
    window.confirm = confirm

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/fetch', component: { template: '<div />' } },
        { path: '/history', component: { template: '<div />' } },
        { path: '/profile/:id', name: 'profile', component: ProfileView },
      ],
    })
    await router.push(`/profile/${profile.id}?from=fetch`)
    await router.isReady()

    const wrapper = mount(ProfileView, { global: { plugins: [pinia, router] } })
    await flushPromises()

    const actionButtons = () => wrapper.get('article').findAll('button').slice(-2)
    expect(actionButtons()[0]?.text()).toBe('שמור')

    await actionButtons()[0]?.trigger('click')
    await flushPromises()

    expect(actionButtons()[0]?.text()).toBe('מחק')
    await actionButtons()[0]?.trigger('click')
    await flushPromises()

    expect(confirm).toHaveBeenCalledWith('האם למחוק את הפרופיל?')
    expect(requests.filter((request) => request.method === 'DELETE')).toEqual([])
    expect(store.isProfileSaved(profile.id)).toBe(true)
    expect(router.currentRoute.value.fullPath).toBe(`/profile/${profile.id}?from=fetch`)
    expect(actionButtons()[0]?.text()).toBe('מחק')

    wrapper.unmount()
  })

  it('updates an unsaved profile in memory without a PATCH request', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useProfilesStore()
    store.fetchedProfiles = [profile]

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        const method = init?.method ?? 'GET'
        requests.push({ url, method })
        return Response.json({ error: 'Profile not found' }, { status: 404 })
      }),
    )

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/fetch', component: { template: '<div />' } },
        { path: '/history', component: { template: '<div />' } },
        { path: '/profile/:id', name: 'profile', component: ProfileView },
      ],
    })
    await router.push(`/profile/${profile.id}?from=fetch`)
    await router.isReady()

    const wrapper = mount(ProfileView, { global: { plugins: [pinia, router] } })
    await flushPromises()

    const article = wrapper.get('article')
    await article.findAll('input')[0]?.setValue('Grace')
    await article
      .findAll('button')
      .find((button) => button.text() === 'עדכן')
      ?.trigger('click')
    await flushPromises()

    expect(store.profileById(profile.id)?.firstName).toBe('Grace')
    expect(store.isProfileSaved(profile.id)).toBe(false)
    expect(requests.filter((request) => request.method === 'PATCH')).toEqual([])
    expect(wrapper.text()).toContain('הפרופיל עודכן בהצלחה')

    wrapper.unmount()
  })
})
