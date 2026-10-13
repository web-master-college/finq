<script setup lang="ts">
const query = defineModel<string>({ required: true })
</script>

<template>
  <label class="block max-w-md">
    <span class="mb-2 block text-sm">Search by name or country</span>
    <input
      v-model="query"
      type="search"
      class="w-full rounded-lg border border-[#d5dde6] bg-white py-2 ps-3 pe-3"
    />
  </label>
</template>
