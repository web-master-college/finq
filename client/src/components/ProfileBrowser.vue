<script setup lang="ts">
import { computed, ref } from 'vue'
import { filterProfiles } from '../lib/profiles'
import type { Profile } from '../types/profile'
import ProfileList from './ProfileList.vue'
import ProfileSearch from './ProfileSearch.vue'

const props = defineProps<{
  profiles: Profile[]
  emptyMessage: string
}>()

const query = ref('')
const visibleProfiles = computed(() => filterProfiles(props.profiles, query.value))
</script>

<template>
  <div class="grid gap-4">
    <ProfileSearch v-if="profiles.length > 0" v-model="query" />
    <p v-if="visibleProfiles.length === 0" class="m-0">
      {{ query.trim() ? 'No profiles match your search.' : emptyMessage }}
    </p>
    <ProfileList v-else :profiles="visibleProfiles" />
  </div>
</template>
