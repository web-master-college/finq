<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

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
  <section class="grid gap-4">
    <div class="flex flex-wrap gap-3">
      <RouterLink
        to="/fetch"
        class="inline-flex rounded-lg bg-[#16324f] py-3 ps-5 pe-5 text-white no-underline hover:bg-[#1c3d60] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16324f]"
        >Fetch</RouterLink
      >
      <RouterLink
        to="/history"
        class="inline-flex rounded-lg bg-[#16324f] py-3 ps-5 pe-5 text-white no-underline hover:bg-[#1c3d60] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16324f]"
        >History</RouterLink
      >
    </div>
    <p
      class="m-0 inline-flex w-fit max-w-full items-center gap-2 rounded-full py-1 ps-2 pe-3 text-sm text-[#5c6b7a]"
      role="status"
      aria-live="polite"
    >
      <span
        class="inline-block size-2 shrink-0 rounded-full"
        :class="{
          'bg-[#8b98a8]': status === 'checking',
          'bg-[#1f8a4c]': status === 'ok',
          'bg-[#c0392b]': status === 'error',
        }"
        aria-hidden="true"
      ></span>
      <span>{{ detail }}</span>
    </p>
  </section>
</template>
