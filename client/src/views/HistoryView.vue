<script setup lang="ts">
import ProfileBrowser from '../components/ProfileBrowser.vue'
import { useProfilesStore } from '../stores/profiles'

const store = useProfilesStore()

void store.loadSavedProfiles()
</script>

<template>
  <section class="grid gap-4">
    <h2 class="m-0 text-xl [font-weight:650]">History</h2>
    <p v-if="store.historyStatus === 'loading'" class="m-0" role="status">Loading saved profiles…</p>
    <div v-else-if="store.historyStatus === 'error'" class="grid gap-3" role="alert">
      <p class="m-0">{{ store.historyError }}</p>
      <button
        type="button"
        class="w-fit rounded-lg border border-[#d5dde6] bg-white py-2 ps-3 pe-3"
        @click="store.loadSavedProfiles()"
      >
        Retry
      </button>
    </div>
    <ProfileBrowser
      v-else-if="store.historyStatus === 'ready'"
      :profiles="store.savedProfiles"
      empty-message="No saved profiles."
      origin="history"
    />
  </section>
</template>
