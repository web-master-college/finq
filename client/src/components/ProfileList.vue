<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { profileFullName } from '../lib/profiles'
import type { Profile } from '../types/profile'

defineProps<{
  profiles: Profile[]
}>()
</script>

<template>
  <ul class="m-0 grid list-none gap-3 p-0">
    <li v-for="profile in profiles" :key="profile.id">
      <RouterLink
        :to="`/profile/${profile.id}`"
        class="flex items-center gap-4 rounded-lg border border-[#d5dde6] bg-white py-4 ps-4 pe-4 text-inherit no-underline"
      >
        <img
          :src="profile.thumbnailUrl"
          alt=""
          width="48"
          height="48"
          class="size-12 rounded-full object-cover"
        />
        <div>
          <p class="m-0 [font-weight:650]">{{ profileFullName(profile) }}</p>
          <p class="m-0 text-sm">{{ profile.gender }} · {{ profile.country }}</p>
          <p class="m-0 text-sm">{{ profile.phone }}</p>
          <p class="m-0 text-sm">{{ profile.email }}</p>
        </div>
      </RouterLink>
    </li>
  </ul>
</template>
