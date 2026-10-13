<script setup lang="ts">
import { onMounted, ref } from 'vue'

type ConnectionStatus = 'checking' | 'ok' | 'error'

const status = ref<ConnectionStatus>('checking')
const detail = ref('Checking backend connection…')

onMounted(async () => {
  try {
    const response = await fetch('/api/health')

    if (!response.ok) {
      status.value = 'error'
      detail.value = `Backend responded with HTTP ${response.status}`
      return
    }

    const body: unknown = await response.json()

    if (!isOkStatus(body)) {
      status.value = 'error'
      detail.value = 'Backend returned an unexpected health payload'
      return
    }

    status.value = 'ok'
    detail.value = 'Backend connected'
  } catch {
    status.value = 'error'
    detail.value = 'Backend unreachable'
  }
})

function isOkStatus(value: unknown): boolean {
  if (typeof value !== 'object' || value === null || !('status' in value)) {
    return false
  }

  return value.status === 'ok'
}
</script>

<template>
  <p
    class="m-0 inline-flex items-center gap-[0.6rem] rounded-lg border border-[#d5dde6] bg-white py-3 ps-4 pe-4"
    role="status"
    aria-live="polite"
  >
    <span
      class="inline-block size-[0.65rem] rounded-full"
      :class="{
        'bg-[#8b98a8]': status === 'checking',
        'bg-[#1f8a4c]': status === 'ok',
        'bg-[#c0392b]': status === 'error',
      }"
      aria-hidden="true"
    ></span>
    <span>{{ detail }}</span>
  </p>
</template>
