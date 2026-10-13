<script setup lang="ts">
defineProps<{
  status: 'idle' | 'loading' | 'success' | 'error'
  message: string
}>()
</script>

<template>
  <p
    class="m-0 min-h-5 text-sm leading-5"
    :class="{
      'text-[#5c6b7a]': status === 'loading',
      'text-[#1f8a4c]': status === 'success',
      'text-[#c0392b]': status === 'error',
    }"
    :role="status === 'error' ? 'alert' : 'status'"
  >
    {{ message }}
  </p>
</template>
