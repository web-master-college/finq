<script setup lang="ts">
import ProfileBrowser from '../components/ProfileBrowser.vue'
import { useProfilesStore } from '../stores/profiles'

const store = useProfilesStore()

if (store.fetchStatus === 'idle') {
  void store.loadFetchedProfiles()
}
</script>

<template>
  <section class="grid gap-4">
    <h2 class="m-0 text-xl [font-weight:650]">Fetch</h2>
    <p v-if="store.fetchStatus === 'loading'" class="m-0" role="status">Loading profiles…</p>
    <div v-else-if="store.fetchStatus === 'error'" class="grid gap-3" role="alert">
      <p class="m-0">{{ store.fetchError }}</p>
      <button
        type="button"
        class="w-fit rounded-lg border border-[#d5dde6] bg-white py-2 ps-3 pe-3"
        @click="store.loadFetchedProfiles()"
      >
        Retry
      </button>
    </div>
    <ProfileBrowser
      v-else-if="store.fetchStatus === 'ready'"
      :profiles="store.fetchedProfiles"
      empty-message="No profiles returned."
      origin="fetch"
    />
  </section>
</template>
