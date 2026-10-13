<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { profileFullName } from '../lib/profiles'
import { useProfilesStore } from '../stores/profiles'

const route = useRoute()
const store = useProfilesStore()

const profile = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? store.profileById(id) : undefined
})
</script>

<template>
  <section class="grid gap-4">
    <h2 class="m-0 text-xl [font-weight:650]">Profile</h2>
    <p v-if="profile" class="m-0">{{ profileFullName(profile) }}</p>
    <p v-else class="m-0">This profile is not available in the current session.</p>
  </section>
</template>
